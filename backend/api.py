from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from main_script import find_optimal_design
from handle_db import connect_db, fetch_all_component_ids
from pydantic import BaseModel
from typing import Optional
from plagia_opsi import calculate_plagia_opsi
import traceback
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import hmac
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from fastapi import Header, Request
from fastapi.responses import JSONResponse
from feedback import FeedbackReport, save_report, load_all_reports, report_count, _commit



app = FastAPI()

# 1. Ορισμός Μοντέλου Δεδομένων
class ElevatorRequest(BaseModel):
    shaftwidth: float
    shaftdepth: float
    atoma: Optional[int] = None
    thesi_sassi: str
    anoigma_portas: float
    tupos_portas: str
    arithmos_fyllon: Optional[int] = None
    tupos_anoigmatos: Optional[str] = None
    kateuthinsi_anoigmatos: Optional[str] = None
    cabin_doors : Optional[str] = None
    thesi_second_door : Optional[str] = None
    dir_second_door : Optional[str] = None
    vathos_puthmena : float
    ekswteriko_ipsos_thalamou : float
    diadromi_anelkistira : float
    staseis : int


# 2. ΡΥΘΜΙΣΗ CORS
# Επιτρεπόμενες origins από το .env (CORS_ORIGINS, χωρισμένες με κόμμα). Όταν το site καλεί το API μέσω proxy
# στο ίδιο domain, δεν χρειάζεται CORS καθόλου.
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:5000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Feedback-Token"],
)

@app.get("/get-doors")
def get_doors():
    db = connect_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    doors = fetch_all_component_ids(db, "Portes", "Tupos_Portas_ID")
    db.close()
    return {"available_doors": doors}


# 2β. ΕΣΩΤΕΡΙΚΟ ΕΡΓΑΛΕΙΟ ΑΝΑΦΟΡΑΣ ΠΡΟΒΛΗΜΑΤΩΝ (βλ. backend/feedback.py)
# Η υποβολή είναι ανοιχτή αλλά περιορισμένη: μέγεθος, ρυθμός ανά client και συνολικός αριθμός αναφορών, ώστε
# να μη γεμίσει ο δίσκος. Η εξαγωγή απαιτεί FEEDBACK_TOKEN (.env): αν δεν έχει οριστεί, η εξαγωγή είναι ΚΛΕΙΣΤΗ.
MAX_FEEDBACK_BODY = 300_000
FEEDBACK_RATE_LIMIT = 10          # αναφορές ανά client...
FEEDBACK_RATE_WINDOW = 600        # ...σε αυτό το παράθυρο (δευτερόλεπτα)
FEEDBACK_MAX_REPORTS = 5000       # ανώτατος αριθμός αναφορών στον δίσκο
_feedback_hits = defaultdict(deque)

def _client_key(request: Request) -> str:
    # Πίσω από proxy/tunnel το request.client είναι ο proxy: προτιμάμε την IP που προωθεί ο proxy.
    for h in ("cf-connecting-ip", "x-forwarded-for"):
        v = request.headers.get(h)
        if v:
            return v.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def _rate_limited(key: str) -> bool:
    now = time.monotonic()
    if len(_feedback_hits) > 10_000:
        _feedback_hits.clear()
    q = _feedback_hits[key]
    while q and now - q[0] > FEEDBACK_RATE_WINDOW:
        q.popleft()
    if len(q) >= FEEDBACK_RATE_LIMIT:
        return True
    q.append(now)
    return False

@app.post("/feedback")
async def post_feedback(request: Request):
    raw = await request.body()
    if len(raw) > MAX_FEEDBACK_BODY:
        raise HTTPException(status_code=413, detail="Πολύ μεγάλη αναφορά")
    if _rate_limited(_client_key(request)):
        raise HTTPException(status_code=429, detail="Πάρα πολλές αναφορές, δοκιμάστε ξανά σε λίγα λεπτά.",
                            headers={"Retry-After": str(FEEDBACK_RATE_WINDOW)})
    if report_count() >= FEEDBACK_MAX_REPORTS:
        raise HTTPException(status_code=503, detail="Ο χώρος αναφορών είναι γεμάτος. Ειδοποιήστε τον διαχειριστή.")
    try:
        report = FeedbackReport.model_validate_json(raw)
        report_id = save_report(report)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {"status": "ok", "id": report_id}

@app.get("/feedback/export")
def export_feedback(x_feedback_token: Optional[str] = Header(default=None)):
    expected = os.environ.get("FEEDBACK_TOKEN", "")
    if not expected:
        # Χωρίς token η εξαγωγή θα ήταν ανοιχτή σε όποιον φτάσει στο API (π.χ. μέσω του site): μένει κλειστή.
        raise HTTPException(status_code=403, detail="Η εξαγωγή είναι απενεργοποιημένη (ορίστε FEEDBACK_TOKEN στο .env)")
    if not hmac.compare_digest(x_feedback_token or "", expected):
        raise HTTPException(status_code=401, detail="Λάθος ή άγνωστο token")
    reports = load_all_reports()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    return JSONResponse(
        {"exported_at": stamp, "commit": _commit(), "count": len(reports), "reports": reports},
        headers={"Content-Disposition": f'attachment; filename="minos-feedback-{stamp}.json"'},
    )

# 3. ΤΟ ΕΝΙΑΙΟ SOLVE ENDPOINT
@app.post("/solve")
async def solve_elevator(user_data: ElevatorRequest):
    try:
        # Μετατροπή του Pydantic model σε dictionary
        payload = user_data.model_dump()
        
        # Κλήση του Solver
        result = find_optimal_design(payload)
        
        # Έλεγχος αν βρέθηκε λύση (το result περιέχει το best_solution)
        if result and result.get("best_solution"):

            best_katopsi = result["best_solution"]
            
            # Περνάμε ΤΟΣΟ τα user_data ΟΣΟ ΚΑΙ τη best_katopsi στην Πλάγια Όψη!
            # Αν η πλάγια όψη αποτύχει (π.χ. staseis=1, λάθος βάθος πυθμένα), η κάτοψη πρέπει να επιστραφεί κανονικά
            try:
                plagia_opsi_result = calculate_plagia_opsi(payload, best_katopsi)
            except Exception:
                traceback.print_exc()
                plagia_opsi_result = None
            if not isinstance(plagia_opsi_result, dict):
                plagia_opsi_result = None
            
            return {
                "status": "success",
                "data": {
                    "best_solution": result["best_solution"],
                    "plagia_opsi": plagia_opsi_result,
                    "warning": result.get("warning")
                }
            }
        else:
            msg = "Δεν βρέθηκε εφικτή λύση για αυτές τις παραμέτρους."
            if isinstance(result, dict) and result.get("status") == "error":
                msg = result.get("message") or msg
            causes = result.get("unsat_causes", []) if isinstance(result, dict) else []
            if causes:
                msg = msg + " " + " ".join(causes)
            return {
                "status": "error",
                "message": msg,
                "unsat_causes": result.get("unsat_causes", []) if isinstance(result, dict) else []
            }

    except Exception as e:
        print("====== ΑΝΑΛΥΤΙΚΟ ΣΦΑΛΜΑ ======")
        traceback.print_exc()  # Αυτό θα τυπώσει την ακριβή γραμμή!
        print("==============================")
        raise HTTPException(status_code=500, detail=str(e))

current_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Ψάχνουμε τον φάκελο "frontend" στο ίδιο επίπεδο (αν το api.py είναι στο root)
if os.path.exists(os.path.join(current_dir, "frontend")):
    FRONTEND_DIR = os.path.join(current_dir, "frontend")
# 3. Αν δεν τον βρει, πάει έναν φάκελο πίσω (αν το api.py είναι μέσα στο "backend")
else:
    FRONTEND_DIR = os.path.join(os.path.dirname(current_dir), "frontend")

print(f"[*] Ξεκινάω τον Server! Ο φάκελος Frontend βρέθηκε εδώ: {FRONTEND_DIR}")

# Κάνουμε mount τον φάκελο χρησιμοποιώντας την απόλυτη διαδρομή!
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

if __name__ == "__main__":
    # Η θύρα 8000 είναι του vLLM στο μηχάνημα του agent: προεπιλογή 8002, ρυθμίζεται με API_PORT.
    uvicorn.run(app, host=os.environ.get("API_HOST", "127.0.0.1"), port=int(os.environ.get("API_PORT", "8002")))




    