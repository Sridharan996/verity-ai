#!/usr/bin/env python3
"""
VERITY AI — Live MongoDB Atlas Detailed TLS Diagnostic Probe

Performs deep-dive TLS diagnostics:
1. Discovers Atlas node hostname from existing SRV records (credentials redacted)
2. Reports Python runtime, OpenSSL build, and supported TLS versions
3. Executes Python TLS handshake with certificate validation and SNI
4. Captures exact SSL error internals (library, reason, strerror)
5. Executes OpenSSL CLI s_client probe if installed
"""

import os
import shutil
import socket
import ssl
import subprocess
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


def resolve_first_atlas_node(uri: str) -> tuple[str, int]:
    """Resolves DNS SRV records to discover an actual Atlas node hostname."""
    parsed_host = urlsplit(uri.strip()).hostname
    if not parsed_host:
        raise ValueError("Could not parse cluster hostname from configured URI.")

    srv_target = f"_mongodb._tcp.{parsed_host}"
    srv_records = dns.resolver.resolve(srv_target, "SRV")
    first_record = next(iter(srv_records))
    node_host = str(first_record.target).rstrip(".")
    node_port = int(first_record.port)
    return node_host, node_port


def run_tls_details_diagnostic() -> int:
    print("=" * 75)
    print("VERITY AI — MongoDB Atlas Detailed TLS Diagnostic Probe")
    print("=" * 75)

    # 1. Environment & Runtime Information
    print("\n[SECTION 1] Runtime & OpenSSL Environment:")
    print(f"  -> Python Version:        {sys.version.splitlines()[0]}")
    print(f"  -> Python Executable:     {sys.executable}")
    print(f"  -> OpenSSL Version:       {ssl.OPENSSL_VERSION}")
    print(f"  -> OpenSSL Version Number: {hex(ssl.OPENSSL_VERSION_NUMBER)}")
    supported_tls_versions = [v.name for v in ssl.TLSVersion]
    print(f"  -> Supported TLS Enums:   {', '.join(supported_tls_versions)}")
    print(f"  -> certifi CA File:       {certifi.where()} (exists: {os.path.exists(certifi.where())})")

    # 2. Configuration & Node Resolution
    print("\n[SECTION 2] Node Discovery from Existing Settings:")
    raw_uri = settings.MONGODB_URI
    if not raw_uri or not raw_uri.strip():
        print("  -> Result: FAIL")
        print("  -> Error: MONGODB_URI is empty or not set in backend/.env")
        return 1

    print(f"  -> Configured Target:     {redact_uri(raw_uri)}")
    try:
        node_host, node_port = resolve_first_atlas_node(raw_uri)
        print(f"  -> Resolved Node Host:    {node_host}")
        print(f"  -> Resolved Node Port:    {node_port}")
    except Exception as exc:
        print(f"  -> Failed to resolve Atlas node via SRV: {type(exc).__name__}: {exc}")
        return 1

    # 3. Python SSL Handshake Probe with SNI & Certificate Verification
    print("\n[SECTION 3] Python SSL Handshake Probe (Strict Certificate Verification):")
    ctx = ssl.create_default_context(cafile=certifi.where())
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED

    print(f"  -> check_hostname:        {ctx.check_hostname}")
    print(f"  -> verify_mode:           {ctx.verify_mode.name}")
    print(f"  -> SNI (server_hostname): {node_host}")

    raw_socket = None
    tls_socket = None
    python_tls_passed = False
    start_time = time.perf_counter()

    try:
        raw_socket = socket.create_connection((node_host, node_port), timeout=8.0)
        tls_socket = ctx.wrap_socket(raw_socket, server_hostname=node_host)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        python_tls_passed = True

        print(f"  -> Handshake Result:      PASS ({elapsed_ms:.1f} ms)")
        print(f"  -> Negotiated Protocol:   {tls_socket.version()}")
        print(f"  -> Negotiated Cipher:     {tls_socket.cipher()}")
        peercert = tls_socket.getpeercert()
        subject = peercert.get("subject", ()) if peercert else ()
        print(f"  -> Peer Certificate Subj: {subject}")

    except ssl.SSLError as ssl_err:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        print(f"  -> Handshake Result:      FAIL ({elapsed_ms:.1f} ms)")
        print(f"  -> Exception Class:       {type(ssl_err).__name__}")
        print(f"  -> SSL Library:           {getattr(ssl_err, 'library', 'N/A')}")
        print(f"  -> SSL Reason:            {getattr(ssl_err, 'reason', 'N/A')}")
        print(f"  -> SSL Strerror:          {getattr(ssl_err, 'strerror', 'N/A')}")
        print(f"  -> Exception Args:        {ssl_err.args}")

    except Exception as exc:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        print(f"  -> Handshake Result:      FAIL ({elapsed_ms:.1f} ms)")
        print(f"  -> Exception Class:       {type(exc).__name__}")
        print(f"  -> Error Message:         {exc}")

    finally:
        if tls_socket is not None:
            try:
                tls_socket.close()
            except Exception:
                pass
        elif raw_socket is not None:
            try:
                raw_socket.close()
            except Exception:
                pass

    # 4. OpenSSL CLI s_client Probe
    print("\n[SECTION 4] OpenSSL CLI s_client Probe:")
    openssl_bin = shutil.which("openssl")
    openssl_cli_passed = False

    if not openssl_bin:
        print("  -> OpenSSL Executable:    NOT FOUND in system PATH")
        print("  -> Status:                Skipped (openssl CLI tool not installed on host)")
    else:
        print(f"  -> OpenSSL Executable:    {openssl_bin}")
        cmd = [
            openssl_bin,
            "s_client",
            "-connect",
            f"{node_host}:{node_port}",
            "-servername",
            node_host,
            "-tls1_2",
            "-CAfile",
            certifi.where(),
        ]
        print(f"  -> Executing:             openssl s_client -connect {node_host}:{node_port} -servername {node_host} -tls1_2 -CAfile <certifi_path>")

        try:
            res = subprocess.run(
                cmd,
                input="",
                capture_output=True,
                text=True,
                timeout=10,
            )
            print(f"  -> Exit Code:             {res.returncode}")
            openssl_cli_passed = (res.returncode == 0)

            # Extract informative lines from stdout/stderr without dumping sensitive memory
            combined_output = (res.stdout + "\n" + res.stderr).splitlines()
            notable_lines = [
                line.strip()
                for line in combined_output
                if any(
                    k in line.lower()
                    for k in ["verify return", "alert", "error", "handshake", "cipher", "protocol", "connected"]
                )
            ]
            print("  -> Key Diagnostic Lines:")
            if notable_lines:
                for nl in notable_lines[:15]:
                    print(f"     | {nl}")
            else:
                for line in combined_output[:10]:
                    print(f"     | {line.strip()}")

        except Exception as sub_err:
            print(f"  -> Execution Failed:      {type(sub_err).__name__}: {sub_err}")

    # Summary
    print("\n" + "=" * 75)
    print("DETAILED TLS DIAGNOSTIC SUMMARY")
    print("=" * 75)
    print(f"Target Node:               {node_host}:{node_port}")
    print(f"Python SSL Handshake:      {'PASS' if python_tls_passed else 'FAIL'}")
    if openssl_bin:
        print(f"OpenSSL CLI Handshake:     {'PASS' if openssl_cli_passed else 'FAIL'}")
    else:
        print(f"OpenSSL CLI Handshake:     SKIPPED (CLI not in PATH)")
    print("=" * 75)

    return 0 if python_tls_passed else 1


if __name__ == "__main__":
    exit_code = run_tls_details_diagnostic()
    sys.exit(exit_code)
