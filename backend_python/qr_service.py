import requests
from PIL import Image
from io import BytesIO
from pyzbar.pyzbar import decode
import numpy as np

try:
    import pypdfium2 as pdfium
except ImportError:
    pdfium = None


def detect_qr_from_bytes(img_bytes: bytes) -> dict:
    img = Image.open(BytesIO(img_bytes))
    img_np = np.array(img.convert("RGB"))
    decoded = decode(img_np)
    if decoded:
        data = decoded[0].data.decode("utf-8", errors="ignore")
        return {"found": True, "data": data, "type": decoded[0].type}
    return {"found": False, "data": None}


def _pdf_pages_to_png_bytes(pdf_bytes: bytes, scale: float = 2.5):
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


def detect_qr_from_url(url: str) -> dict:
    try:
        response = requests.get(url, timeout=60)
        content = response.content
        url_lower = url.lower().split("?")[0]

        if url_lower.endswith(".pdf"):
            for img_bytes in _pdf_pages_to_png_bytes(content):
                result = detect_qr_from_bytes(img_bytes)
                if result["found"]:
                    return result
            return {"found": False, "data": None}

        return detect_qr_from_bytes(content)
    except Exception as e:
        return {"found": False, "data": None, "error": str(e)}


def validate_qr_url(url: str) -> bool:
    try:
        if not url.startswith(("http://", "https://")):
            return False
        response = requests.head(url, timeout=10, allow_redirects=True)
        return response.status_code < 400
    except Exception:
        return False
