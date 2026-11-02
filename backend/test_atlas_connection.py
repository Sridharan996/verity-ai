#!/usr/bin/env python3
"""
VERITY AI — Live MongoDB Atlas Connectivity Diagnostic Probe

Systematic layer-by-layer network diagnostics:
1. Configuration loading & credential redaction
2. DNS SRV record resolution
3. Hostname to IP address resolution
4. Raw TCP socket connectivity to port 27017
5. TLS Handshake with SNI and certifi CA bundle
6. Focused TLS Protocol Comparison (TLS 1.2 vs TLS 1.3)
7. PyMongo admin ping command execution
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
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from app.core.config import settings


def redact_uri(uri: str) -> str:
    """Safely redact credentials from a MongoDB connection string."""
    try:
        parsed = urlsplit(uri)
        netloc = parsed.netloc
        host = netloc.split("@")[-1] if "@" in netloc else netloc
        scheme = parsed.scheme or "mongodb+srv"
        path = parsed.path or "/"
        return f"{scheme}://***:***@{host}{path}"
    except Exception:
        return "mongodb+srv://***:***@[REDACTED_TARGET]"


def run_diagnostics() -> int:
    overall_success = True
    print("=" * 70)
    print("VERITY AI — Live MongoDB Atlas Systematic Diagnostic Probe")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # Check 1: Load Existing Configuration
    # -------------------------------------------------------------------------
    print("\n[CHECK 1/7] Loading Configuration from Project Settings...")
    uri = settings.MONGODB_URI
    if not uri or not uri.strip():
        print("  -> Result: FAIL")
        print("  -> Error: 'MONGODB_URI' is empty or not set in backend/.env")
        return 1

    redacted = redact_uri(uri)
    parsed_host = urlsplit(uri.strip()).hostname
    print("  -> Result: PASS")
    print(f"  -> Target Target: {redacted}")
    print(f"  -> Cluster Host:  {parsed_host}")
    print(f"  -> Database Name: {settings.DATABASE_NAME}")
    print(f"  -> CA Bundle:     {certifi.where()}")

    # -------------------------------------------------------------------------
    # Check 2: DNS SRV Record Resolution
    # -------------------------------------------------------------------------
    print("\n[CHECK 2/7] Resolving MongoDB SRV Records...")
    srv_target = f"_mongodb._tcp.{parsed_host}"
    resolved_nodes = []
    try:
        print(f"  -> Querying DNS SRV: {srv_target}")
        srv_records = dns.resolver.resolve(srv_target, "SRV")
        for record in srv_records:
            node_host = str(record.target).rstrip(".")
            node_port = int(record.port)
            resolved_nodes.append((node_host, node_port))

        print("  -> Result: PASS")
        print(f"  -> Found {len(resolved_nodes)} replica set node(s):")
        for idx, (h, p) in enumerate(resolved_nodes, start=1):
            print(f"     [{idx}] {h}:{p}")
    except Exception as exc:
        print("  -> Result: FAIL")
        print(f"  -> Exception Type:    {type(exc).__name__}")
        print(f"  -> Exception Message: {exc}")
        return 1

    # -------------------------------------------------------------------------
    # Check 3: Hostname to IP Address Resolution
    # -------------------------------------------------------------------------
    print("\n[CHECK 3/7] Resolving Node Hostnames to IP Addresses...")
    node_ip_map = {}
    check3_failed = False
    for node_host, node_port in resolved_nodes:
        try:
            addr_info = socket.getaddrinfo(node_host, node_port, socket.AF_UNSPEC, socket.SOCK_STREAM)
            unique_ips = []
            for entry in addr_info:
                ip = entry[4][0]
                if ip not in unique_ips:
                    unique_ips.append(ip)
            node_ip_map[node_host] = unique_ips
            print(f"  -> {node_host}: PASS")
            print(f"     Resolved IPs: {', '.join(unique_ips)}")
        except Exception as exc:
            check3_failed = True
            node_ip_map[node_host] = []
            print(f"  -> {node_host}: FAIL")
            print(f"     Exception: {type(exc).__name__}: {exc}")

    if check3_failed:
        overall_success = False

    # -------------------------------------------------------------------------
    # Check 4: Raw TCP Connectivity to Port 27017
    # -------------------------------------------------------------------------
    print("\n[CHECK 4/7] Testing Raw TCP Socket Connectivity (Port 27017)...")
    check4_failed = False
    for node_host, node_port in resolved_nodes:
        sock = None
        start_time = time.perf_counter()
        try:
            sock = socket.create_connection((node_host, node_port), timeout=5.0)
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            print(f"  -> {node_host}:{node_port} -> PASS ({elapsed_ms:.1f} ms)")
        except Exception as exc:
            check4_failed = True
            print(f"  -> {node_host}:{node_port} -> FAIL")
            print(f"     Exception Type:    {type(exc).__name__}")
            print(f"     Exception Message: {exc}")
        finally:
            if sock is not None:
                try:
                    sock.close()
                except Exception:
                    pass

    if check4_failed:
        overall_success = False

    # -------------------------------------------------------------------------
    # Check 5: TLS Handshake with SNI & Certificate Verification (Default Context)
    # -------------------------------------------------------------------------
    print("\n[CHECK 5/7] Testing TLS Handshake with SNI & certifi CA (Default Context)...")
    check5_failed = False
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    ssl_context.check_hostname = True
    ssl_context.verify_mode = ssl.CERT_REQUIRED

    for node_host, node_port in resolved_nodes:
        raw_sock = None
        tls_sock = None
        start_time = time.perf_counter()
        try:
            raw_sock = socket.create_connection((node_host, node_port), timeout=5.0)
            tls_sock = ssl_context.wrap_socket(raw_sock, server_hostname=node_host)
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            cipher_info = tls_sock.cipher()
            tls_ver = tls_sock.version()
            print(f"  -> {node_host} -> PASS ({elapsed_ms:.1f} ms)")
            print(f"     Protocol: {tls_ver}, Cipher: {cipher_info[0]}")
        except Exception as exc:
            check5_failed = True
            print(f"  -> {node_host} -> FAIL")
            print(f"     Exception Type:    {type(exc).__name__}")
            print(f"     Exception Message: {exc}")
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

    if check5_failed:
        overall_success = False

    # -------------------------------------------------------------------------
    # Check 6: Focused TLS Protocol Comparison (TLS 1.2 vs TLS 1.3)
    # -------------------------------------------------------------------------
    sample_host, sample_port = resolved_nodes[0]
    print("\n[CHECK 6/7] Focused TLS Protocol Comparison (TLS 1.2 vs TLS 1.3)...")
    print(f"  -> Target Node:     {sample_host}:{sample_port}")
    print(f"  -> OpenSSL Version: {ssl.OPENSSL_VERSION}")
    print(f"  -> Python Version:  {sys.version.splitlines()[0]}")

    tls_12_passed = False
    tls_13_passed = False

    # Test 1: TLS 1.2 only
    print("\n  --- Testing TLS 1.2 Only ---")
    ctx_12 = ssl.create_default_context(cafile=certifi.where())
    ctx_12.check_hostname = True
    ctx_12.verify_mode = ssl.CERT_REQUIRED
    ctx_12.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx_12.maximum_version = ssl.TLSVersion.TLSv1_2

    raw_12 = None
    tls_12 = None
    start_time = time.perf_counter()
    try:
        raw_12 = socket.create_connection((sample_host, sample_port), timeout=5.0)
        tls_12 = ctx_12.wrap_socket(raw_12, server_hostname=sample_host)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        tls_12_passed = True
        print(f"  -> TLS 1.2 Result: PASS ({elapsed_ms:.1f} ms)")
        print(f"     Negotiated Version: {tls_12.version()}")
        print(f"     Negotiated Cipher:  {tls_12.cipher()[0]}")
    except Exception as exc:
        print("  -> TLS 1.2 Result: FAIL")
        print(f"     Exception Type:     {type(exc).__name__}")
        print(f"     Exception Message:  {exc}")
    finally:
        if tls_12 is not None:
            try:
                tls_12.close()
            except Exception:
                pass
        elif raw_12 is not None:
            try:
                raw_12.close()
            except Exception:
                pass

    # Test 2: TLS 1.3 only
    print("\n  --- Testing TLS 1.3 Only ---")
    ctx_13 = ssl.create_default_context(cafile=certifi.where())
    ctx_13.check_hostname = True
    ctx_13.verify_mode = ssl.CERT_REQUIRED
    ctx_13.minimum_version = ssl.TLSVersion.TLSv1_3
    ctx_13.maximum_version = ssl.TLSVersion.TLSv1_3

    raw_13 = None
    tls_13 = None
    start_time = time.perf_counter()
    try:
        raw_13 = socket.create_connection((sample_host, sample_port), timeout=5.0)
        tls_13 = ctx_13.wrap_socket(raw_13, server_hostname=sample_host)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        tls_13_passed = True
        print(f"  -> TLS 1.3 Result: PASS ({elapsed_ms:.1f} ms)")
        print(f"     Negotiated Version: {tls_13.version()}")
        print(f"     Negotiated Cipher:  {tls_13.cipher()[0]}")
    except Exception as exc:
        print("  -> TLS 1.3 Result: FAIL")
        print(f"     Exception Type:     {type(exc).__name__}")
        print(f"     Exception Message:  {exc}")
    finally:
        if tls_13 is not None:
            try:
                tls_13.close()
            except Exception:
                pass
        elif raw_13 is not None:
            try:
                raw_13.close()
            except Exception:
                pass

    # -------------------------------------------------------------------------
    # Check 7: PyMongo Client Ping Command
    # -------------------------------------------------------------------------
    print("\n[CHECK 7/7] Executing PyMongo Admin Ping Command...")
    mongo_client = None
    start_time = time.perf_counter()
    try:
        mongo_client = MongoClient(
            uri.strip(),
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
        )
        ping_response = mongo_client.admin.command("ping")
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        print("  -> Result: PASS")
        print(f"  -> Latency:  {elapsed_ms:.1f} ms")
        print(f"  -> Response: {ping_response}")
    except (ServerSelectionTimeoutError, PyMongoError) as exc:
        overall_success = False
        print("  -> Result: FAIL")
        print(f"  -> Exception Type:    {type(exc).__name__}")
        print(f"  -> Exception Message: {exc}")
    except Exception as exc:
        overall_success = False
        print("  -> Result: FAIL")
        print(f"  -> Exception Type:    {type(exc).__name__}")
        print(f"  -> Exception Message: {exc}")
    finally:
        if mongo_client is not None:
            try:
                mongo_client.close()
            except Exception:
                pass

    # -------------------------------------------------------------------------
    # Summary of Diagnostics
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("DIAGNOSTIC SUMMARY")
    print("=" * 70)
    print(f"1. Configuration Loading:     PASS")
    print(f"2. DNS SRV Resolution:        PASS ({len(resolved_nodes)} nodes discovered)")
    print(f"3. Hostname to IP:            {'PASS' if not check3_failed else 'FAIL'}")
    print(f"4. TCP Connect (27017):       {'PASS' if not check4_failed else 'FAIL'}")
    print(f"5. TLS Default Context:       {'PASS' if not check5_failed else 'FAIL'}")
    print(f"6. TLS 1.2 Only:              {'PASS' if tls_12_passed else 'FAIL'}")
    print(f"   TLS 1.3 Only:              {'PASS' if tls_13_passed else 'FAIL'}")
    print(f"7. PyMongo Ping:              {'PASS' if overall_success and not check5_failed else 'FAIL'}")
    print("=" * 70)

    return 0 if overall_success else 1


if __name__ == "__main__":
    exit_code = run_diagnostics()
    sys.exit(exit_code)
