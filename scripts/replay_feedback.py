#!/usr/bin/env python3
"""Ξαναπαίζει τις αναφορές των μηχανικών στον ΤΡΟΧΟΝΤΑ κώδικα του solver.

Χρήση (από τη ρίζα του repo, με το venv):
    venv/bin/python scripts/replay_feedback.py backend/feedback            # φάκελος με .json
    venv/bin/python scripts/replay_feedback.py minos-feedback-2026.json    # αρχείο εξαγωγής
    ... --tol 50      # ανοχή σε mm για σύγκριση διαστάσεων (ο Z3 δεν είναι απολύτως ντετερμινιστικός)
    ... --only wrong  # μόνο αναφορές «λάθος» (ή: ok)

Για κάθε αναφορά τυπώνει: τι είπε ο μηχανικός, τι έβγαλε ο κώδικας τότε, τι βγάζει ΤΩΡΑ.
Αναφορές «ok» λειτουργούν ως έλεγχοι παλινδρόμησης: αν το τωρινό αποτέλεσμα αλλάξει, βγαίνει REGRESSION.
Κωδικός εξόδου 1 αν υπάρχει REGRESSION.
"""
import argparse
import contextlib
import glob
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from main_script import find_optimal_design  # noqa: E402

NUMERIC_KEYS = ["Platos_thalamou", "Vathos_Thalamou", "Apostasi_ar_lampa", "Apostasi_dek_lampa"]


def load_reports(path):
    if os.path.isdir(path):
        reports = []
        for f in sorted(glob.glob(os.path.join(path, "*.json"))):
            with open(f, encoding="utf-8") as fh:
                reports.append(json.load(fh))
        return reports
    with open(path, encoding="utf-8") as fh:
        doc = json.load(fh)
    return doc["reports"] if isinstance(doc, dict) and "reports" in doc else [doc]


def solve(inputs):
    with contextlib.redirect_stdout(io.StringIO()):
        res = find_optimal_design(inputs)
    if isinstance(res, dict) and res.get("best_solution"):
        return res["best_solution"], res.get("warning"), None
    msg = (res or {}).get("message") if isinstance(res, dict) else str(res)
    causes = (res or {}).get("unsat_causes") if isinstance(res, dict) else None
    return None, None, " ".join(filter(None, [msg, " ".join(causes or [])])) or "Καμία λύση"


def bracket(sol):
    return sol.get("Bracket_Door_Side") or sol.get("Bracket_Deksia_Side")


def fmt(sol):
    if not sol:
        return "ΚΑΜΙΑ ΛΥΣΗ"
    return (f"{sol['Platos_thalamou']:.0f}x{sol['Vathos_Thalamou']:.0f} (A={sol['cabin_area'] / 1e6:.3f} m²)  "
            f"σασί={sol['Sassi_Model']}  οδηγοί={sol['Odhgoi_Type']}  στήριγμα={bracket(sol)}  "
            f"λάμπες={sol.get('Apostasi_ar_lampa', 0):.0f}/{sol.get('Apostasi_dek_lampa', 0):.0f}")


def same(a, b, tol):
    """Ίδιο αποτέλεσμα (ή και τα δύο χωρίς λύση);"""
    if (a is None) != (b is None):
        return False
    if a is None:
        return True
    return all(abs(float(a.get(k, 0)) - float(b.get(k, 0))) <= tol for k in ("Platos_thalamou", "Vathos_Thalamou"))


def expected_diffs(sol, expected, tol):
    """Λίστα από «πεδίο: ζητούμενο vs τωρινό» για όσα δεν ταιριάζουν."""
    out = []
    for key, want in expected.items():
        got = bracket(sol) if key == "Bracket" else sol.get(key)
        try:
            ok = abs(float(want) - float(got)) <= tol
        except (TypeError, ValueError):
            ok = str(want).strip().lower() == str(got).strip().lower()
        if not ok:
            out.append(f"{key}: ζητήθηκε {want}, βγαίνει {got}")
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path")
    ap.add_argument("--tol", type=float, default=50.0)
    ap.add_argument("--only", choices=["wrong", "ok"])
    args = ap.parse_args()

    reports = [r for r in load_reports(args.path) if not args.only or r.get("verdict") == args.only]
    if not reports:
        print("Δεν βρέθηκαν αναφορές.")
        return 0

    regressions = 0
    for r in reports:
        verdict = r.get("verdict")
        print("=" * 100)
        print(f"[{r.get('id')}] {r.get('created_at', '')[:19]}  commit={r.get('commit')}  από: {r.get('author') or '-'}  verdict={verdict.upper()}")
        if r.get("categories"):
            print("Κατηγορίες:", ", ".join(r["categories"]))
        if r.get("comment"):
            print("Σχόλιο:", r["comment"])
        i = r["inputs"]
        print("Είσοδοι:", {k: i[k] for k in sorted(i)})

        old = r.get("result")
        now, warning, err = solve(i)
        print("Τότε  :", fmt(old) + (f"   ⚠ {r['warning']}" if r.get("warning") else "") +
              (f"   ✗ {r['error_message']}" if r.get("error_message") else ""))
        print("Τώρα  :", fmt(now) + (f"   ⚠ {warning}" if warning else "") + (f"   ✗ {err}" if err else ""))

        if verdict == "ok":
            if same(old, now, args.tol):
                print("→ OK (ίδιο με την επιβεβαιωμένη λύση)")
            else:
                regressions += 1
                print("→ REGRESSION: το αποτέλεσμα που είχε επιβεβαιωθεί ως σωστό άλλαξε!")
        else:
            if r.get("expected"):
                if now is None:
                    print("→ ΑΝΟΙΧΤΟ: ο μηχανικός ζήτησε συγκεκριμένες τιμές αλλά τώρα δεν βγαίνει λύση:", r["expected"])
                else:
                    diffs = expected_diffs(now, r["expected"], args.tol)
                    print("→ ΛΥΜΕΝΟ (ταιριάζει με όσα ζητήθηκαν)" if not diffs else "→ ΑΝΟΙΧΤΟ: " + "; ".join(diffs))
            elif same(old, now, args.tol):
                print("→ ΑΝΟΙΧΤΟ: το αποτέλεσμα είναι ίδιο με το λανθασμένο που αναφέρθηκε")
            else:
                print("→ ΑΛΛΑΞΕ από τότε (έλεγξε αν διορθώθηκε)")

    print("=" * 100)
    print(f"{len(reports)} αναφορές, {regressions} REGRESSION")
    return 1 if regressions else 0


if __name__ == "__main__":
    sys.exit(main())
