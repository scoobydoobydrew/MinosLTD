"""Εσωτερικό εργαλείο αναφοράς προβλημάτων από μηχανικούς.

Κάθε αναφορά αποθηκεύεται ως ξεχωριστό JSON στο backend/feedback/ με ΟΛΑ όσα χρειάζονται για να
ξαναπαιχτεί η περίπτωση (είσοδοι + αποτέλεσμα του solver + commit του κώδικα). Βλ. scripts/replay_feedback.py.
"""
import json
import os
import subprocess
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

FEEDBACK_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "feedback")
MAX_JSON_BYTES = 100_000  # όριο μεγέθους για inputs/result/expected ώστε να μην γεμίσει ο δίσκος

# Τι μπορεί να είναι λάθος (τα ίδια ids χρησιμοποιεί και το frontend)
CATEGORIES = [
    "diastaseis_kampinas", "sassi", "odhgoi", "sthrigma", "porta", "apostaseis_lampas",
    "apostaseis_toixou", "plagia_opsi", "eprepe_na_vgei_lusi", "den_eprepe_na_vgei_lusi", "allo",
]


class FeedbackReport(BaseModel):
    verdict: Literal["wrong", "ok"]                      # wrong = λάθος αποτέλεσμα, ok = επιβεβαιώνω ότι είναι σωστό
    categories: List[Literal[tuple(CATEGORIES)]] = Field(default_factory=list, max_length=len(CATEGORIES))
    expected: Dict[str, str] = Field(default_factory=dict)   # π.χ. {"Platos_thalamou": "1100"}
    comment: str = Field(default="", max_length=2000)
    author: str = Field(default="", max_length=60)
    inputs: Dict[str, Any]                                # ό,τι στάλθηκε στο /solve
    result: Optional[Dict[str, Any]] = None               # best_solution (αν βρέθηκε)
    plagia_opsi: Optional[Dict[str, Any]] = None
    warning: Optional[str] = Field(default=None, max_length=1000)
    error_message: Optional[str] = Field(default=None, max_length=1000)


def _commit() -> str:
    try:
        root = os.path.dirname(FEEDBACK_DIR)
        out = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=root, capture_output=True, text=True, timeout=3)
        dirty = subprocess.run(["git", "status", "--porcelain", "--untracked-files=no"], cwd=root, capture_output=True, text=True, timeout=3)
        return out.stdout.strip() + ("+dirty" if dirty.stdout.strip() else "")
    except Exception:
        return "unknown"


def validate_sizes(report: FeedbackReport) -> None:
    for name in ("inputs", "result", "plagia_opsi", "expected"):
        value = getattr(report, name)
        if value is not None and len(json.dumps(value, ensure_ascii=False)) > MAX_JSON_BYTES:
            raise ValueError(f"Πολύ μεγάλο πεδίο: {name}")
    if len(report.expected) > 40 or any(len(k) > 80 or len(v) > 200 for k, v in report.expected.items()):
        raise ValueError("Πολύ μεγάλο πεδίο: expected")


def save_report(report: FeedbackReport) -> str:
    validate_sizes(report)
    os.makedirs(FEEDBACK_DIR, exist_ok=True)
    now = datetime.now(timezone.utc)
    report_id = f"{now.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"
    doc = {"id": report_id, "created_at": now.isoformat(), "commit": _commit(), **report.model_dump()}
    tmp = os.path.join(FEEDBACK_DIR, f".{report_id}.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    os.replace(tmp, os.path.join(FEEDBACK_DIR, f"{report_id}.json"))   # ατομική εγγραφή
    return report_id


def load_all_reports() -> List[dict]:
    if not os.path.isdir(FEEDBACK_DIR):
        return []
    reports = []
    for name in sorted(os.listdir(FEEDBACK_DIR)):
        if name.endswith(".json") and not name.startswith("."):
            try:
                with open(os.path.join(FEEDBACK_DIR, name), encoding="utf-8") as f:
                    reports.append(json.load(f))
            except Exception:
                continue
    return reports
