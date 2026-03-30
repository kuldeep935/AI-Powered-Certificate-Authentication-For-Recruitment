from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import cv2
import numpy as np
import urllib.request
import re 
from pyzbar.pyzbar import decode
from playwright.sync_api import sync_playwright
import easyocr 
import pytesseract
from urlextract import URLExtract
pytesseract.pytesseract.tesseract_cmd = r"C:\Users\Nitin\Documents\GitHub\AI-Powered-Certificate-Authentication-For-Recruitment\tesseract.exe"

app = FastAPI()

print("Loading EasyOCR AI model... (This takes a few seconds)")
reader = easyocr.Reader(['en'], gpu=False)
print("✅ EasyOCR loaded and ready!")

print("Loading URLExtract...")
url_extractor = URLExtract()

class ValidationRequest(BaseModel):
    image_url: str

def fetch_image_from_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        arr = np.asarray(bytearray(response.read()), dtype=np.uint8)
        img = cv2.imdecode(arr, -1)
        if img is None:
            raise ValueError("Could not decode image.")
        
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        large_img = cv2.resize(gray_img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        return large_img
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {str(e)}")

def get_word_set(text):
    """Cleans text and returns a set of unique, meaningful words (3+ letters)"""
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    stop_words = {"the", "and", "for", "with", "this", "that", "has", "been"}
    return set(w for w in words if w not in stop_words)

def clean_url(url):
    url = url.strip()

    # Fix protocol
    url = url.replace("https:/", "https://")
    url = url.replace("http:/", "http://")

    # Fix missing 'www.'
    if "mygreatlearning.com" in url and "www." not in url:
        url = url.replace("https://", "https://www.")

    return url

@app.post("/verify-qr-and-data")
def verify_qr_and_data(data: ValidationRequest):
    img = fetch_image_from_url(data.image_url)
    
    # --- 1. Extract Text using EasyOCR ---
    # detail=0 returns a simple list of strings instead of complex bounding box coordinates
    text_list = reader.readtext(img, detail=0)
    cert_text = " ".join(text_list)

    cert_words = get_word_set(cert_text)

    cert_text_string = pytesseract.image_to_string(img)
    cert_text_string = clean_url(cert_text_string)
    if len(cert_words) == 0:
        return {"status": "Failed", "reason": "Could not read any text from the certificate image.", "is_verified": False}

    print(f"URL Text:", cert_text_string)
    # --- 2. Scan for QR Code and URL in certificate---
    qr_data = decode(img)
    qr_url = None
    if len(qr_data) > 0:
        qr_url = qr_data[0].data.decode('utf-8')
        print(f"Found URL via QR Code: {qr_url}")
    else:
        found_urls = url_extractor.find_urls(cert_text_string)
        if len(found_urls) > 0:
            qr_url = found_urls[0] # Grab the first URL found
            
            # Safely add https:// if the printed link was missing it (e.g. Great Learning)
            if not qr_url.startswith('http'):
                qr_url = 'https://' + qr_url
                
            print(f"✅ Found URL via urlextract: {qr_url}")
    
    if not qr_url:
        return {"status": "NO_QR_Link", "reason": "No QR code or URL found in the certificate image.", "is_verified": False, "qr_link": None}
    
    # --- 3. Scrape the Verification Webpage ---
    page_text = ""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(qr_url, wait_until="networkidle", timeout=15000)
            page_text = page.evaluate("document.body.innerText")
            browser.close()
    except Exception as e:
        return {"status": "Failed", "reason": "Could not load the verification webpage.", "is_verified": False}

    # --- 4. Compare the Two Texts ---
    page_words = get_word_set(page_text)
    matching_words = cert_words.intersection(page_words)
    
    # print(page_words)
    # print(cert_words)
    # Calculate the percentage
    match_percentage = (len(matching_words) / len(cert_words)) * 100
    is_verified = match_percentage >= 10.00 and qr_url is not None

    return {
        "status": "Verified" if is_verified else "Data Mismatch",
        "match_percentage": round(match_percentage, 2),
        "matched_words_count": len(matching_words),
        "total_cert_words": len(cert_words),
        "reason": f"Matched {round(match_percentage, 2)}% of words between certificate and website.",
        "is_verified": is_verified,
        "qr_link": qr_url
    }

