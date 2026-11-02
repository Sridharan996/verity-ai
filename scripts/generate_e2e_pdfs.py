import io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import pymupdf

OUTPUT_DIR = Path(__file__).resolve().parent / "test_pdfs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 1. Digitally Generated PDF
def generate_digital_pdf():
    text = (
        "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION\n"
        "APPROVAL PROCESS HANDBOOK COMPLIANCE DOSSIER 2026-27\n"
        "Institution Name: Madras Institute of Advanced Technology\n"
        "Permanent Institute ID: AICTE-IND-2026-9912\n"
        "Approved Contiguous Land Area: 14.85 Acres (60,095 sq.m)\n"
        "Survey Numbers: 104/2A, 104/2B, 105/1\n"
        "Building Structural Standard: PWD Standard IS 1893:2016 Compliant\n"
        "Fire Safety Manifold Pressure: 3.5 Bar Verified\n"
        "Anti-Ragging Committee & Grievance Cell Formed Under AICTE Regs."
    )
    doc = pymupdf.open()
    page = doc.new_page(width=612, height=792)  # Standard Letter
    page.insert_text((54, 72), text, fontsize=12)
    path = OUTPUT_DIR / "e2e_digital.pdf"
    doc.save(str(path))
    doc.close()
    print(f"Generated Digital PDF: {path} ({path.stat().st_size} bytes)")
    return path


# 2. Scanned / Image-Only PDF
def generate_scanned_pdf():
    lines = [
        "TAMIL NADU FIRE AND RESCUE SERVICES",
        "STATUTORY NO OBJECTION CERTIFICATE",
        "CERTIFICATE NO: DFRS-CHENNAI-2026-NOC-9821",
        "OCCUPANCY CATEGORY: TECHNICAL EDUCATION APPROVED",
        "HYDRANT PRESSURE: 3.5 BAR AT TERTIARY ROOF TERMINAL",
        "ANNUAL SAFETY INSPECTION COMPLETED PER NBC 2016",
        "CLEARANCE GRANTED FOR ACADEMIC YEAR 2026-27",
    ]
    img = Image.new("RGB", (1200, 700), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    y = 60
    for line in lines:
        draw.text((80, y), line, fill=(0, 0, 0))
        y += 70

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")

    doc = pymupdf.open()
    page = doc.new_page(width=1200, height=700)
    page.insert_image(pymupdf.Rect(0, 0, 1200, 700), stream=img_bytes.getvalue())
    path = OUTPUT_DIR / "e2e_scanned.pdf"
    doc.save(str(path))
    doc.close()
    print(f"Generated Scanned PDF: {path} ({path.stat().st_size} bytes)")
    return path


# 3. Mixed 2-Page PDF (Page 1 Digital, Page 2 Scanned)
def generate_mixed_pdf():
    doc = pymupdf.open()

    # Page 1: Digital text
    page1_text = (
        "GOVERNMENT OF TAMIL NADU - HIGHWAYS & INFRASTRUCTURE\n"
        "CAMPUS ACCESS ROAD AND CONNECTIVITY VERIFICATION\n"
        "Application Reference: AICTE-INFRA-2026-8802\n"
        "Access Road Width: 18.00 Meters Public Tar Highway Confirmed\n"
        "Direct Entry Gate: 12.00 Meters Multi-Lane Clear Vehicular Access"
    )
    page1 = doc.new_page(width=612, height=792)
    page1.insert_text((54, 72), page1_text, fontsize=12)

    # Page 2: Scanned image
    lines = [
        "DIRECTORATE OF SURVEY AND SETTLEMENT",
        "CADASTRAL BOUNDARY COORDINATES WGS84",
        "SURVEY NO: 104/2A LAT 12.9821 N LONG 80.1204 E",
        "CAMPUS PERIMETER: 1680 METERS ENCLOSED BOUNDARY",
        "NO FOREST OR WETLAND ENCROACHMENT DETECTED",
    ]
    img = Image.new("RGB", (1200, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    y = 60
    for line in lines:
        draw.text((80, y), line, fill=(0, 0, 0))
        y += 70

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")

    page2 = doc.new_page(width=1200, height=600)
    page2.insert_image(pymupdf.Rect(0, 0, 1200, 600), stream=img_bytes.getvalue())

    path = OUTPUT_DIR / "e2e_mixed.pdf"
    doc.save(str(path))
    doc.close()
    print(f"Generated Mixed PDF: {path} ({path.stat().st_size} bytes)")
    return path


# 4. Malformed PDF (invalid header/corrupt)
def generate_malformed_pdf():
    path = OUTPUT_DIR / "e2e_malformed.pdf"
    with open(path, "wb") as f:
        # Invalid PDF header and garbage bytes
        f.write(b"%PDF-1.4 CORRUPTED FILE NOT A REAL PDF PAYLOAD GARBAGE DATA 1234567890")
    print(f"Generated Malformed PDF: {path} ({path.stat().st_size} bytes)")
    return path


# 5. Empty PDF (0 bytes)
def generate_empty_pdf():
    path = OUTPUT_DIR / "e2e_empty.pdf"
    with open(path, "wb") as f:
        pass
    print(f"Generated Empty PDF: {path} ({path.stat().st_size} bytes)")
    return path


if __name__ == "__main__":
    generate_digital_pdf()
    generate_scanned_pdf()
    generate_mixed_pdf()
    generate_malformed_pdf()
    generate_empty_pdf()

