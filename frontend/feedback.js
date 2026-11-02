// Εσωτερικό εργαλείο: αναφορά προβλημάτων από μηχανικούς.
// Δεν επηρεάζει τον υπολογισμό ή το σχέδιο: διαβάζει μόνο ό,τι έστειλε/πήρε το /solve.
(function () {
    const API_BASE = 'https://elevatordesignapi.minos1972.com';

    const CATEGORIES = [
        ['diastaseis_kampinas', 'Διαστάσεις καμπίνας'],
        ['sassi', 'Σασί'],
        ['odhgoi', 'Οδηγοί'],
        ['sthrigma', 'Στήριγμα'],
        ['porta', 'Πόρτα'],
        ['apostaseis_lampas', 'Αποστάσεις λάμπας'],
        ['apostaseis_toixou', 'Αποστάσεις από τοίχο / οδηγούς'],
        ['plagia_opsi', 'Πλάγια όψη'],
        ['eprepe_na_vgei_lusi', 'Έπρεπε να βγάλει λύση'],
        ['den_eprepe_na_vgei_lusi', 'Δεν έπρεπε να βγάλει λύση'],
        ['allo', 'Άλλο']
    ];

    // Πεδία που ο μηχανικός μπορεί να δώσει ως «σωστή τιμή»
    const EXPECTED_FIELDS = [
        ['Platos_thalamou', 'Πλάτος θαλάμου (mm)'],
        ['Vathos_Thalamou', 'Βάθος θαλάμου (mm)'],
        ['Sassi_Model', 'Σασί'],
        ['Odhgoi_Type', 'Οδηγοί'],
        ['Bracket', 'Στήριγμα'],
        ['Apostasi_ar_lampa', 'Απόσταση αριστερής λάμπας (mm)'],
        ['Apostasi_dek_lampa', 'Απόσταση δεξιάς λάμπας (mm)']
    ];

    let ctx = null; // τελευταίος υπολογισμός {inputs, result, plagia_opsi, warning, error_message}

    window.feedbackSetContext = function (inputs, response) {
        const d = response && response.data ? response.data : (response || {});
        ctx = {
            inputs: inputs,
            result: d.best_solution || null,
            plagia_opsi: d.plagia_opsi && typeof d.plagia_opsi === 'object' ? d.plagia_opsi : null,
            warning: d.warning || (response && response.warning) || null,
            error_message: response && response.status !== 'success' ? (response.message || null) : null
        };
        render();
    };

    function el(tag, props, children) {
        const e = document.createElement(tag);
        Object.assign(e, props || {});
        (children || []).forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
        return e;
    }

    function ensurePanel() {
        let panel = document.getElementById('feedbackPanel');
        if (!panel) {
            panel = el('div', { id: 'feedbackPanel' });
            panel.style.cssText = 'margin-top:20px;font-family:Inter,sans-serif;';
            const anchor = document.getElementById('resultsTable');
            anchor.parentNode.insertBefore(panel, anchor.nextSibling);
        }
        return panel;
    }

    function btn(text, onclick, bg) {
        const b = el('button', { type: 'button', textContent: text, onclick: onclick });
        b.style.cssText = 'padding:8px 14px;border-radius:8px;border:none;cursor:pointer;color:#fff;margin-right:8px;font-size:0.9em;background:' + (bg || '#475569') + ';';
        return b;
    }

    function render() {
        const panel = ensurePanel();
        panel.innerHTML = '';
        const row = el('div');
        if (ctx) {
            row.appendChild(btn('⚠️ Αναφορά προβλήματος', () => openForm('wrong'), '#b45309'));
            row.appendChild(btn('✅ Είναι σωστό', () => openForm('ok'), '#15803d'));
        }
        row.appendChild(btn('⬇️ Εξαγωγή αναφορών', exportReports, '#334155'));
        panel.appendChild(row);
        const msg = el('div', { id: 'feedbackMsg' });
        msg.style.cssText = 'margin-top:8px;font-size:0.9em;';
        panel.appendChild(msg);
    }

    function say(text, ok) {
        const m = document.getElementById('feedbackMsg');
        if (m) { m.textContent = text; m.style.color = ok ? '#4ade80' : '#f87171'; }
    }

    function openForm(verdict) {
        const panel = ensurePanel();
        const old = document.getElementById('feedbackForm');
        if (old) old.remove();

        const form = el('div', { id: 'feedbackForm' });
        form.style.cssText = 'background:#fff;color:#1a1a1a;padding:18px;border-radius:12px;margin-top:10px;border:2px solid ' + (verdict === 'wrong' ? '#f97316' : '#22c55e') + ';';
        form.appendChild(el('h4', { textContent: verdict === 'wrong' ? 'Τι είναι λάθος;' : 'Επιβεβαίωση ότι το αποτέλεσμα είναι σωστό' }));

        const checks = [];
        if (verdict === 'wrong') {
            const box = el('div');
            box.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px;';
            CATEGORIES.forEach(([id, label]) => {
                const cb = el('input', { type: 'checkbox', value: id });
                checks.push(cb);
                box.appendChild(el('label', {}, [cb, ' ' + label]));
            });
            form.appendChild(box);
        }

        const expInputs = {};
        if (verdict === 'wrong') {
            form.appendChild(el('div', { textContent: 'Σωστές τιμές (προαιρετικά):' }));
            const grid = el('div');
            grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 10px;';
            EXPECTED_FIELDS.forEach(([key, label]) => {
                const inp = el('input', { type: 'text', placeholder: label });
                inp.style.cssText = 'padding:6px;border:1px solid #cbd5e1;border-radius:6px;';
                expInputs[key] = inp;
                grid.appendChild(inp);
            });
            form.appendChild(grid);
        }

        const comment = el('textarea', { rows: 4, placeholder: 'Σχόλιο: ποιος κανόνας/τιμή δεν στέκει και γιατί (π.χ. «η ελάχιστη απόσταση από τον τοίχο πρέπει να είναι …»)' });
        comment.style.cssText = 'width:100%;box-sizing:border-box;padding:8px;border:1px solid #cbd5e1;border-radius:6px;';
        form.appendChild(comment);

        const author = el('input', { type: 'text', placeholder: 'Όνομα μηχανικού', value: safeGet('feedbackAuthor') });
        author.style.cssText = 'padding:6px;border:1px solid #cbd5e1;border-radius:6px;margin:8px 8px 0 0;';
        form.appendChild(author);

        form.appendChild(btn('Αποστολή', async () => {
            const expected = {};
            Object.entries(expInputs).forEach(([k, inp]) => { if (inp.value.trim()) expected[k] = inp.value.trim(); });
            safeSet('feedbackAuthor', author.value);
            const body = {
                verdict: verdict,
                categories: checks.filter(c => c.checked).map(c => c.value),
                expected: expected,
                comment: comment.value,
                author: author.value,
                inputs: ctx.inputs,
                result: ctx.result,
                plagia_opsi: ctx.plagia_opsi,
                warning: ctx.warning,
                error_message: ctx.error_message
            };
            try {
                const r = await fetch(API_BASE + '/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.status);
                const j = await r.json();
                form.remove();
                say('Η αναφορά αποθηκεύτηκε (' + j.id + '). Ευχαριστούμε!', true);
            } catch (e) {
                say('Αποτυχία αποστολής: ' + e.message, false);
            }
        }, '#0284c7'));
        form.appendChild(btn('Ακύρωση', () => form.remove(), '#64748b'));
        panel.insertBefore(form, document.getElementById('feedbackMsg'));
    }

    async function exportReports() {
        const headers = {};
        const token = safeGet('feedbackToken');
        if (token) headers['X-Feedback-Token'] = token;
        try {
            let r = await fetch(API_BASE + '/feedback/export', { headers: headers });
            if (r.status === 401) {
                const t = window.prompt('Token εξαγωγής (FEEDBACK_TOKEN):');
                if (!t) return;
                safeSet('feedbackToken', t);
                r = await fetch(API_BASE + '/feedback/export', { headers: { 'X-Feedback-Token': t } });
            }
            if (!r.ok) throw new Error(r.status);
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            const cd = r.headers.get('Content-Disposition') || '';
            const m = /filename="([^"]+)"/.exec(cd);
            a.download = m ? m[1] : 'minos-feedback.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(a.href);
            say('Το αρχείο κατέβηκε.', true);
        } catch (e) {
            say('Αποτυχία εξαγωγής: ' + e.message, false);
        }
    }

    function safeGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
    function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

    window.addEventListener('load', render);
})();
