# MinosLTD: σχεδιασμός ανελκυστήρα (solver z3 + FastAPI)

Απάντα στα **ελληνικά**, σε μικρά βήματα. Μην κάνεις commit/push χωρίς εντολή. Μην τυπώνεις τιμές από το `.env`.

Δέχεται δεδομένα φρεατίου και πόρτας και επιστρέφει σασί, οδηγούς, στηρίγματα, διαστάσεις θαλάμου και δεδομένα για κάτοψη και πλάγια όψη. Το frontend του σχεδιασμού ζει πλέον στο `~/minos-site` (σελίδα `#/design`). Το `frontend/` εδώ είναι το παλιό αυτόνομο UI.

## Τρέξιμο
- API: FastAPI στο `backend/api.py`, **θύρα 8002** (η 8000 είναι του vLLM), systemd service `minos-design` (unit στο `scripts/minos-design.service`). Restart: `sudo systemctl restart minos-design`.
- venv: `venv/` (`requirements.txt`: z3-solver, fastapi, uvicorn, mysql-connector-python, python-dotenv).
- Βάση: MariaDB τοπικά, βάση `minosltd`, πίνακες `Emvola`, `Odhgoi`, `Portes`, `Sassi`, `Sthrigmata`. Στήσιμο από dump: `bash scripts/setup_local_db.sh` (αντικαθιστά τα collations `uca1400`/`0900` και φτιάχνει χρήστη `minos_app` **μόνο SELECT**). Τα στοιχεία σύνδεσης είναι στο `.env` (δεν μπαίνει στο git, υπόδειγμα `.env.example`).
- Το dump (`minosltd.sql`) είναι στο `.gitignore`. Ο κωδικός του `root` της MariaDB στο Raspberry ήταν παλιά στο git: να αλλαχτεί.

## Endpoints
`GET /get-doors`, `POST /solve`, `POST /feedback` (αναφορές μηχανικών, με όριο ρυθμού), `GET /feedback/export` (απαιτεί `FEEDBACK_TOKEN`, αλλιώς 403). Οι αναφορές είναι αρχεία JSON στο `backend/feedback/`.
- Ξαναπαίξιμο αναφορών ως έλεγχος παλινδρόμησης: `venv/bin/python scripts/replay_feedback.py backend/feedback`.
- Το `/solve` μπορεί να επιστρέψει επιτυχία **χωρίς** `plagia_opsi` (πλάγια όψη) και με `warning`. Το site το χειρίζεται.

## Παγίδες
- Μην αλλάζεις τη λογική σχεδίασης (`main_script.py`, `solver_constraints_*.py`) χωρίς δοκιμή με το `replay_feedback.py` και τα παραδείγματα του Andreas.
- Το `cabin_area` είναι σε **mm²**. Η εμφάνιση στρογγυλεύει τις διαστάσεις προς τα κάτω στα 10 mm, αλλά το εμβαδόν υπολογίζεται με τις πραγματικές: το site δείχνει και τις δύο.
- Τα αρχεία του `backend/__pycache__/` είναι ακόμα tracked από παλιό commit, παρότι το `.gitignore` τα αγνοεί: μην τα κάνεις commit (`git checkout -- backend/__pycache__` αν αλλάξουν).
- Branch εργασίας: `fix/atoma-robust-solver` (προς merge στο `main`).

Σημειώσεις και roadmap: `~/minos-hub/vault/`.

## Σημειώσεις του Andreas (Inbox)
Στην αρχή κάθε συνεδρίας διάβασε το `~/minos-hub/vault/00-Inbox.md`. Ό,τι αφορά αυτό το repo (`@agent`, `@site`, `@ltd`, ή χωρίς ετικέτα) ειδοποίησε τον Andreas ότι το είδες και πες τι θα κάνεις. Όταν το ολοκληρώσεις, μετάφερέ το στο `## Επεξεργάστηκαν` με ημερομηνία (μην σβήνεις σημειώσεις) και γράψε τις αποφάσεις στο `02-Decisions.md`.
