// 1. Συναρτήσεις Υπολογισμού και Περιορισμών
function updateOpeningOptions() {
    const shaftWidth = parseFloat(document.getElementById('shaftWidth').value) || 0;
    const doorType = document.getElementById('doortype').value;
    const leaves = document.getElementById('doorLeaves').value;
    const thesiSassiSelect = document.getElementById('thesi_sassi');
    const thesiSassi = thesiSassiSelect.value; 
    const openingSelect = document.getElementById('doorOpening');
    const options = openingSelect.options;

    // ΚΑΝΟΝΑΣ ΓΙΑ 4 ΦΥΛΛΑ: Κλειδώνει τη θέση σασί στο "Πίσω"
    if (doorType === 'automatic' && leaves === "4") {
        thesiSassiSelect.value = 'rear';
        thesiSassiSelect.disabled = true;
    } else {
        thesiSassiSelect.disabled = false;
    }

    const isCentral = (thesiSassiSelect.value === 'rear');
    let maxCO = 1600;

    // Εφαρμογή των Γραμμικών Συναρτήσεων βάσει των πινάκων
    if (doorType === 'semi_automatic') {
        maxCO = shaftWidth - 150;
    } 
    else if (doorType === 'automatic') {
        if (leaves === "2") {
            if (isCentral) {
                maxCO = (shaftWidth - 184) / 2; // ΚΕΝΤΡΙΚΟ (2 φύλλα)
            } else {
                maxCO = (shaftWidth - 200) / 1.5; // ΠΛΑΪΝΟ (2 φύλλα)
            }
        } 
        else if (leaves === "3") {
            maxCO = (shaftWidth - 197) / 1.33; // ΠΛΑΪΝΟ (3 φύλλα)
        }
        else if (leaves === "4") {
            maxCO = (shaftWidth - 260) / 1.4; // ΚΕΝΤΡΙΚΟ (4 φύλλα)
        }
    }

    // Καθορισμός ελάχιστων ορίων
    let minOpening = 600;
    if (doorType === 'semi_automatic') minOpening = 550;
    else if (leaves === "4") minOpening = 700;
    else if (leaves === "3") minOpening = 650;

    // Ενημέρωση Dropdown
    for (let i = 0; i < options.length; i++) {
        const val = parseInt(options[i].value);
        if (val >= minOpening && val <= maxCO) {
            options[i].style.display = 'block';
            options[i].disabled = false;
        } else {
            options[i].style.display = 'none';
            options[i].disabled = true;
        }
    }

    if (parseInt(openingSelect.value) < minOpening || parseInt(openingSelect.value) > maxCO) {
        openingSelect.value = minOpening.toString();
    }
}

// 2. Event Listeners
document.getElementById('doortype').addEventListener('change', function() {
    const doorLeaves = document.getElementById('doorLeaves');
    if (this.value === 'semi_automatic') {
        doorLeaves.innerHTML = '<option value="1">1 Φύλλο (Ανοιγόμενη)</option>';
        doorLeaves.disabled = true;
    } else {
        doorLeaves.innerHTML = `
            <option value="2">2 Φύλλα</option>
            <option value="3">3 Φύλλα</option>
            <option value="4">4 Φύλλα</option>
        `;
        doorLeaves.disabled = false;
    }
    updateOpeningOptions();
});

document.getElementById('shaftWidth').addEventListener('input', updateOpeningOptions);
document.getElementById('doorLeaves').addEventListener('change', updateOpeningOptions);
document.getElementById('thesi_sassi').addEventListener('change', updateOpeningOptions);

window.onload = updateOpeningOptions;

// 3. Επικοινωνία με API
async function solveElevator() {
    const doorTypeMap = { 'automatic': 'Αυτόματη', 'semi_automatic': 'Ημιαυτόματη' };

    // Προσοχή: Στέλνουμε το value ακόμα και αν είναι disabled το πεδίο
    const data = {
        shaft_width: parseFloat(document.getElementById('shaftWidth').value),
        shaft_depth: parseFloat(document.getElementById('shaftDepth').value),
        p_weight: parseFloat(document.getElementById('pWeight').value),
        q_load: parseFloat(document.getElementById('qLoad').value),
        thesi_sassi: document.getElementById('thesi_sassi').value,
        door_type: doorTypeMap[document.getElementById('doortype').value],
        arithmos_fyllon: parseInt(document.getElementById('doorLeaves').value),
        door_opening: parseInt(document.getElementById('doorOpening').value),
        tupos_anoigmatos: document.getElementById('thesi_sassi').value === 'rear' ? 'Κεντρικό' : 'Πλαϊνό'
    };

    if (!data.shaft_width || !data.shaft_depth) {
        alert("Συμπληρώστε τις διαστάσεις!");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.status === "success") displayResults(result.data);
        else alert("Δεν βρέθηκε λύση: " + result.message);
    } catch (error) {
        alert("Σφάλμα σύνδεσης με τον Server.");
    }
}

function displayResults(data) {
    const resDiv = document.getElementById('resultsTable');
    resDiv.innerHTML = `
        <div style="background: #f1f8e9; padding: 20px; border-radius: 8px; border: 1px solid #c5e1a5; margin-top: 20px;">
            <h4 style="color: #33691e;">Βρέθηκε Λύση:</h4>
            <p><strong>Πλάτος Θαλάμου:</strong> ${data.Platos_thalamou} mm</p>
            <p><strong>Βάθος Θαλάμου:</strong> ${data.Vathos_Thalamou} mm</p>
            <p><strong>Εμβαδόν:</strong> ${data.cabin_area} m²</p>
            <p><strong>Τύπος Ανοίγματος:</strong> ${document.getElementById('thesi_sassi').value === 'rear' ? 'Κεντρικό' : 'Πλαϊνό'}</p>
        </div>
    `;
}