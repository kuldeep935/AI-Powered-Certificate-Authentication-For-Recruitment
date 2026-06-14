import os
import requests
import pytesseract
from PIL import Image
from io import BytesIO
import numpy as np
import cv2
from pypdf import PdfReader

try:
    import pypdfium2 as pdfium
except ImportError:
    pdfium = None

TESSERACT_CMD = os.environ.get("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD


def download_file(url: str) -> bytes:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.content


def extract_text_from_image_bytes(img_bytes: bytes) -> str:
    img = Image.open(BytesIO(img_bytes))
    img_np = np.array(img.convert("RGB"))
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    pil_img = Image.fromarray(thresh)
    text = pytesseract.image_to_string(pil_img, config="--psm 6")
    return text.strip()


def _pdf_pages_to_png_bytes(pdf_bytes: bytes, scale: float = 2.5):
    """Render PDF pages to PNG bytes using pypdfium2 (no PyMuPDF)."""
    if pdfium is None:
        return []
    doc = pdfium.PdfDocument(pdf_bytes)
    out = []
    for i in range(len(doc)):
        page = doc[i]
        bitmap = page.render(scale=scale)
        pil_img = bitmap.to_pil()
        buf = BytesIO()
        pil_img.save(buf, format="PNG")
        out.append(buf.getvalue())
    doc.close()
    return out


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    if len(text.strip()) < 50 and pdfium is not None:
        for png_bytes in _pdf_pages_to_png_bytes(pdf_bytes):
            text += extract_text_from_image_bytes(png_bytes) + "\n"
    return text.strip()


def extract_text_from_url(url: str) -> str:
    try:
        content = download_file(url)
        url_lower = url.lower().split("?")[0]
        if url_lower.endswith(".pdf"):
            return extract_text_from_pdf_bytes(content)
        return extract_text_from_image_bytes(content)
    except Exception as e:
        return f"OCR extraction failed: {str(e)}"
