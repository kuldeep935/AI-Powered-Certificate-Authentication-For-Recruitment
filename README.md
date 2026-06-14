# AI-Powered Certificate Authentication for Recruitment

End-to-end platform: **React** frontend, **Node/Express + MongoDB** API, **FastAPI** OCR/QR/NLP service, **Solidity + Hardhat** registry contract, and **Google Gemini** for chatbot and certificate analysis.

## Repository layout

| Path | Purpose |
|------|---------|
| `frontend/` | React SPA (auth, dashboards, verify flow, chatbot UI) |
| `backend/` | REST API, JWT, Cloudinary uploads, ethers.js, Gemini |
| `backend_python/` | FastAPI: OCR (Tesseract + PyMuPDF), QR (pyzbar), NLP (regex + optional HF NER) |
| `blockchain/` | Hardhat project + `CertificateRegistry.sol` |

## Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- Tesseract OCR (local Python dev on Windows: install Tesseract and set `TESSERACT_CMD` in `backend_python/.env`)
- Optional: Google Gemini API key (`GEMINI_API_KEY`), Cloudinary account, local Ethereum node (Hardhat) for on-chain issuance

## Quick start (local, four terminals)

### 1. Smart contract (optional but recommended for real on-chain records)

```bash
cd blockchain
npm install
npx hardhat compile
# Terminal A:
npx hardhat node
# Terminal B:
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address into `backend/.env` as `CONTRACT_ADDRESS`. Use a funded account private key on that network as `PRIVATE_KEY`, and `RPC_URL=http://127.0.0.1:8545`.

### 2. Python service

```bash
cd backend_python
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env   # adjust TESSERACT_CMD on Windows if needed
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Backend

```bash
cd backend
copy .env.example .env     # fill MongoDB, JWT, Cloudinary, optional Gemini/blockchain
npm install
npm run dev
```

Use `MONGODB_URI` (or legacy `MONGO_URI`). Set `PYTHON_SERVICE_URL=http://localhost:8000` and `CLIENT_URL=http://localhost:3000`.

### 4. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm start
```

Default API base: `REACT_APP_API_BASE_URL=http://localhost:5000/api`.

## Docker Compose

From the repo root:

1. Copy env templates: `backend/.env` from `backend/.env.example`, `frontend/.env` from `frontend/.env.example`, `backend_python/.env` from `backend_python/.env.example`.
2. Ensure `JWT_SECRET` and Cloudinary vars are set for the backend.
3. Run:

```bash
docker-compose up --build
```

- Frontend (nginx): **http://localhost:3000**
- Backend: **http://localhost:5000**
- Python: **http://localhost:8000**
- MongoDB: **localhost:27017**

Compose overrides `MONGODB_URI` and `PYTHON_SERVICE_URL` for container networking. **Hardhat is not included** in Compose; run a local chain separately if you need writes to Ethereum.

## Main API flows

- **Register / login**: `POST /api/auth/register`, `POST /api/auth/login`
- **Upload file**: `POST /api/files/upload` (Bearer token, multipart `file`)
- **Verify certificate**: `POST /api/certificates/upload-and-verify` with `{ fileUrl, filePublicId?, fileName? }` → Python extract + QR + blockchain read + optional Gemini analysis → MongoDB `Certificate`
- **Issue (institution)**: `POST /api/certificates/issue` → `issueCertificate` on contract when configured
- **Revoke (institution)**: `POST /api/certificates/revoke/:id` → updates DB and calls `revokeCertificate` when hash exists
- **Chatbot**: `POST /api/chatbot/ask` (requires `GEMINI_API_KEY` for full replies)

## Environment variables

See `backend/.env.example`, `frontend/.env.example`, `backend_python/.env.example`.

- **Blockchain disabled**: leave `CONTRACT_ADDRESS` empty — hashing and QR/OCR still run; issuance returns “pending / hash only” as appropriate.
- **Gemini disabled**: omit `GEMINI_API_KEY` — analysis is skipped; chatbot returns a short offline message.

## Notes

- Issuer wallet used by the backend must be **authorized** on the contract (deployer is authorized by default; others via `authorizeIssuer`).
- Applicant-upload verification hashes include `fileUrl`, so they generally **will not** match institution-issued hashes unless you align payload shapes intentionally.
- NLP uses **regex + optional HuggingFace NER** (`dslim/bert-base-NER`). For lighter Docker builds you could trim `torch`/`transformers` and rely on regex only.
