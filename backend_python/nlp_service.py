import re
from typing import Optional

try:
    from transformers import pipeline

    ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
    USE_TRANSFORMERS = True
except Exception:
    USE_TRANSFORMERS = False
    ner_pipeline = None


def extract_certificate_fields(text: str) -> dict:
    fields = {
        "candidate_name": None,
        "issuing_institution": None,
        "course_name": None,
        "issue_date": None,
        "expiry_date": None,
        "certificate_id": None,
        "skills": [],
    }

    if not text:
        return fields

    date_pattern = r"\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4})\b"
    dates = re.findall(date_pattern, text, re.IGNORECASE)
    if dates:
        fields["issue_date"] = dates[0]
        if len(dates) > 1:
            fields["expiry_date"] = dates[1]

    cert_id_pattern = r"(?:certificate\s*(?:id|no|number|#)\s*[:\-]?\s*)([A-Z0-9\-\/]+)"
    cert_match = re.search(cert_id_pattern, text, re.IGNORECASE)
    if cert_match:
        fields["certificate_id"] = cert_match.group(1)

    course_pattern = r"(?:certif\w+|complet\w+|award\w+|achiev\w+|passed)\s+(?:in|for|the)?\s*[\"']?([A-Za-z0-9\s\&\+\#]+)[\"']?"
    course_match = re.search(course_pattern, text, re.IGNORECASE)
    if course_match:
        fields["course_name"] = course_match.group(1).strip()

    if USE_TRANSFORMERS and ner_pipeline and len(text) > 20:
        try:
            entities = ner_pipeline(text[:512])
            persons = [e["word"] for e in entities if e.get("entity_group") == "PER"]
            orgs = [e["word"] for e in entities if e.get("entity_group") == "ORG"]
            if persons:
                fields["candidate_name"] = " ".join(persons[:2])
            if orgs:
                fields["issuing_institution"] = " ".join(orgs[:2])
        except Exception:
            pass

    if not fields["issuing_institution"]:
        inst_pattern = r"(?:issued by|from|university|institute|college|academy|school|board)\s*[:\-]?\s*([A-Za-z\s]+?)(?:\n|,|$)"
        inst_match = re.search(inst_pattern, text, re.IGNORECASE)
        if inst_match:
            fields["issuing_institution"] = inst_match.group(1).strip()

    skill_keywords = [
        "python",
        "java",
        "javascript",
        "react",
        "node",
        "sql",
        "machine learning",
        "ai",
        "blockchain",
        "aws",
        "docker",
        "kubernetes",
        "data science",
        "deep learning",
    ]
    text_lower = text.lower()
    fields["skills"] = [s for s in skill_keywords if s in text_lower]

    return fields


def normalize_certificate_data(fields: dict) -> dict:
    normalized = {}
    for key, value in fields.items():
        if isinstance(value, str):
            value = re.sub(r"\s+", " ", value).strip()
            value = re.sub(r"[^\w\s\-\.,&#+@]", "", value).strip()
            value = value.replace("B.Tech", "Bachelor of Technology")
            value = value.replace("M.Tech", "Master of Technology")
            value = value.replace("AI&DS", "Artificial Intelligence and Data Science")
            value = value.replace("CSE", "Computer Science Engineering")
            normalized[key] = value if value else None
        else:
            normalized[key] = value
    return normalized
