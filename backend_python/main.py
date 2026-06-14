import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from ocr_service import extract_text_from_url
from qr_service import detect_qr_from_url, validate_qr_url
from nlp_service import normalize_certificate_data, extract_certificate_fields

app = FastAPI(title="CertAuth Python Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CertificateRequest(BaseModel):
    file_url: str
    extracted_text: Optional[str] = None


class ExtractionRequest(BaseModel):
    file_url: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/verify-certificate")
async def verify_certificate(request: CertificateRequest):
    try:
        qr_result = detect_qr_from_url(request.file_url)
        qr_valid = False
        qr_url = None

        if qr_result["found"]:
            qr_url = qr_result["data"]
            qr_valid = validate_qr_url(qr_url)

        return {
            "success": True,
            "qr_found": qr_result["found"],
            "qr_valid": qr_valid,
            "qr_url": qr_url,
            "qr_data": qr_result.get("data"),
        }
    except Exception as e:
        return {"success": False, "qr_found": False, "qr_valid": False, "error": str(e)}


@app.post("/extract-data")
async def extract_data(request: ExtractionRequest):
    try:
        raw_text = extract_text_from_url(request.file_url)
        fields = extract_certificate_fields(raw_text)
        normalized = normalize_certificate_data(fields)

        return {
            "success": True,
            "data": {
                "rawText": raw_text,
                "candidateName": normalized.get("candidate_name"),
                "issuingInstitution": normalized.get("issuing_institution"),
                "courseName": normalized.get("course_name"),
                "issueDate": normalized.get("issue_date"),
                "expiryDate": normalized.get("expiry_date"),
                "certificateId": normalized.get("certificate_id"),
                "skills": normalized.get("skills", []),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e), "data": {}}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), reload=True)
