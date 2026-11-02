#!/usr/bin/env python3
"""
VERITY AI — Live MongoDB Atlas IPv4-Direct TLS Probe

Tests direct IPv4 socket connectivity and strict TLS handshake
(preserving SNI and certificate verification) to an Atlas node
discovered via SRV records, bypassing OS/DNS IPv6 address selection.
"""

import socket
import ssl
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import certifi
import dns.resolver

from app.core.config import settings


def redact_target(uri: str) -> str:
    """Safely redact credentials from MongoDB URI."""
    try:
        parsed = urlsplit(uri)
        netloc = parsed.netloc
        host = netloc.split("@")[-1] if "@" in netloc else netloc
        scheme = parsed.scheme or "mongodb+srv"
        path = parsed.path or "/"
        return f"{scheme}://***:***@{host}{path}"
    except Exception:
        return "mongodb+srv://***:***@[REDACTED_TARGET]"


def run_ipv4_tls_probe() -> int:
    print("=" * 70)
    print("VERITY AI — MongoDB Atlas Direct IPv4 TLS Probe")
    print("=" * 70)

    # 1. Load settings & resolve node hostname from SRV
    raw_uri = settings.MONGODB_URI
    if not raw_uri or not raw_uri.strip():
        print("Result: FAIL")
        print("Error: MONGODB_URI is not set in backend/.env")
        return 1

    print(f"Configured Cluster:       {redact_target(raw_uri)}")

    try:
        cluster_host = urlsplit(raw_uri.strip()).hostname
        srv_target = f"_mongodb._tcp.{cluster_host}"
        srv_records = dns.resolver.resolve(srv_target, "SRV")
        first_record = next(iter(srv_records))
        node_host = str(first_record.target).rstrip(".")
        node_port = int(first_record.port)
        print(f"Discovered Node Hostname: {node_host}")
        print(f"Discovered Node Port:     {node_port}")
    except Exception as exc:
        print("Result: FAIL")
        print(f"SRV Resolution Failed:    {type(exc).__name__}: {exc}")
        return 1

    # 2. Resolve IPv4 address explicitly using AF_INET
    ipv4_address = None
    try:
        addr_info = socket.getaddrinfo(node_host, node_port, socket.AF_INET, socket.SOCK_STREAM)
        ipv4_address = addr_info[0][4][0]
        print(f"Resolved IPv4 Address:    {ipv4_address}")
    except Exception as exc:
        print("Result: FAIL")
        print(f"IPv4 Resolution Failed:   {type(exc).__name__}: {exc}")
        return 1

    # 3. Direct IPv4 TCP Connection
    raw_sock = None
    tls_sock = None
    tcp_passed = False
    start_tcp = time.perf_counter()

    try:
        raw_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        raw_sock.settimeout(8.0)
        raw_sock.connect((ipv4_address, node_port))
        tcp_elapsed_ms = (time.perf_counter() - start_tcp) * 1000
        tcp_passed = True
        print(f"IPv4 TCP Connection:      PASS ({tcp_elapsed_ms:.1f} ms to {ipv4_address}:{node_port})")
    except Exception as exc:
        tcp_elapsed_ms = (time.perf_counter() - start_tcp) * 1000
        print(f"IPv4 TCP Connection:      FAIL ({tcp_elapsed_ms:.1f} ms)")
        print(f"  -> Exception Type:      {type(exc).__name__}")
        print(f"  -> Error Message:       {exc}")
        if raw_sock is not None:
            try:
                raw_sock.close()
            except Exception:
                pass
        return 1

    # 4. Strict TLS Handshake with SNI set to node_host
    print("\nInitiating Strict TLS Handshake over IPv4 Socket:")
    ctx = ssl.create_default_context(cafile=certifi.where())
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED

    print(f"  -> CA Bundle:           {certifi.where()}")
    print(f"  -> check_hostname:      {ctx.check_hostname}")
    print(f"  -> verify_mode:         {ctx.verify_mode.name}")
    print(f"  -> SNI Server Hostname: {node_host} (preserves certificate validation)")

    start_tls = time.perf_counter()
    try:
        tls_sock = ctx.wrap_socket(raw_sock, server_hostname=node_host)
        tls_elapsed_ms = (time.perf_counter() - start_tls) * 1000

        print(f"\nIPv4 TLS Handshake:       PASS ({tls_elapsed_ms:.1f} ms)")
        print(f"Negotiated Version:       {tls_sock.version()}")
        cipher_info = tls_sock.cipher()
        print(f"Negotiated Cipher:        {cipher_info[0]}")
        peercert = tls_sock.getpeercert()
        subject = peercert.get("subject", ()) if peercert else ()
        print(f"Server Certificate Subj:  {subject}")
        print("-" * 70)
        print("Result: PASS — Direct IPv4 TLS handshake succeeded.")
        print("-" * 70)
        return 0

    except ssl.SSLError as ssl_err:
        tls_elapsed_ms = (time.perf_counter() - start_tls) * 1000
        print(f"\nIPv4 TLS Handshake:       FAIL ({tls_elapsed_ms:.1f} ms)")
        print(f"  -> Exception Class:     {type(ssl_err).__name__}")
        print(f"  -> SSL Library:         {getattr(ssl_err, 'library', 'N/A')}")
        print(f"  -> SSL Reason:          {getattr(ssl_err, 'reason', 'N/A')}")
        print(f"  -> SSL Strerror:        {getattr(ssl_err, 'strerror', 'N/A')}")
        print(f"  -> Exception Args:      {ssl_err.args}")
        print("-" * 70)
        print("Result: FAIL — Direct IPv4 TLS handshake was rejected by the server.")
        print("-" * 70)
        return 1

    except Exception as exc:
        tls_elapsed_ms = (time.perf_counter() - start_tls) * 1000
        print(f"\nIPv4 TLS Handshake:       FAIL ({tls_elapsed_ms:.1f} ms)")
        print(f"  -> Exception Class:     {type(exc).__name__}")
        print(f"  -> Error Message:       {exc}")
        print("-" * 70)
        print("Result: FAIL — Unexpected error during IPv4 TLS handshake.")
        print("-" * 70)
        return 1

    finally:
        if tls_sock is not None:
            try:
                tls_sock.close()
            except Exception:
                pass
        elif raw_sock is not None:
            try:
                raw_sock.close()
            except Exception:
                pass


if __name__ == "__main__":
    exit_code = run_ipv4_tls_probe()
    sys.exit(exit_code)
