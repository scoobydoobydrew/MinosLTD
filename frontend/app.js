
function updateDoorLogic() {
    // 1. Πιάσε όλα τα στοιχεία από το HTML
    const doorType = document.getElementById('doortype').value;
    const doorLeaves = document.getElementById('doorLeaves');
    const openingType = document.getElementById('tuposAnoigmatos');
    const openingDirection = document.getElementById('kateuthinsiAnoigmatos');
    const chassisPosition = document.getElementById('thesi_sassi').value; 
    const cabinDoorsSelect = document.getElementById('cabinDoors');
    const secondContainer = document.getElementById('secondDoorPosContainer');
    const dirSecondDoor = document.getElementById('secondDoorDir');

    // Κράτα την τρέχουσα επιλογή του χρήστη για να μην τη χάσουμε στο "refresh" των επιλογών
    const currentCabinDoorsVal = cabinDoorsSelect.value;

    // --- SECTION A: ΔΙΑΧΕΙΡΙΣΗ ΕΠΙΛΟΓΩΝ ΕΙΣΟΔΩΝ (Ανάλογα με το Σασί) ---
    if (chassisPosition === 'rear') {
        // Στο Πίσω Σασί: Μόνο 1 πόρτα ή Γωνιακό (2_gwniako)
        if (!cabinDoorsSelect.innerHTML.includes('2_gwniako')) {
            cabinDoorsSelect.innerHTML = `
                <option value="1">1 Πόρτα</option>
                <option value="2_gwniako">2 Πόρτες (γωνιακό)</option>
            `;
            // Επαναφορά τιμής αν υπήρχε
            if (currentCabinDoorsVal === '2_gwniako') cabinDoorsSelect.value = '2_gwniako';
            else cabinDoorsSelect.value = '1';
        }
    } else {
        // Στο Πλαϊνό Σασί (Side/Left/Right): Μόνο 1 πόρτα ή Διαμπερές (2_opposite)
        if (!cabinDoorsSelect.innerHTML.includes('2_opposite')) {
            cabinDoorsSelect.innerHTML = `
                <option value="1">1 Πόρτα</option>
                <option value="2_opposite">2 Πόρτες (διαμπερές)</option>
            `;
            // Επαναφορά τιμής αν υπήρχε
            if (currentCabinDoorsVal === '2_opposite') cabinDoorsSelect.value = '2_opposite';
            else cabinDoorsSelect.value = '1';
        }
    }

    // --- SECTION B: ΕΜΦΑΝΙΣΗ/ΑΠΟΚΡΥΨΗ ΕΠΙΛΟΓΩΝ ΓΙΑ ΤΗ ΓΩΝΙΑΚΗ ΠΟΡΤΑ ---
    // Εδώ είναι το "κλειδί": Ελέγχουμε την τιμή ΜΕΤΑ την παραπάνω ενημέρωση
    if (cabinDoorsSelect.value === '2_gwniako') {
        console.log("Ενεργοποίηση επιλογών Γωνιακής Πόρτας");
        secondContainer.style.display = 'block';
    } else {
        secondContainer.style.display = 'none';
    }

    // --- SECTION C: ΛΟΓΙΚΗ ΠΟΡΤΑΣ (Αυτόματη / Ημιαυτόματη) ---
    if (doorType === 'semi_automatic') {
        // ΗΜΙΑΥΤΟΜΑΤΗ
        doorLeaves.innerHTML = '<option value="1">1 Φύλλο</option>';
        doorLeaves.value = "1";
        doorLeaves.disabled = true;

        openingType.innerHTML = '<option value="Ημιαυτόματη">Ημιαυτόματη</option>';
        openingType.value = "Ημιαυτόματη";
        openingType.style.pointerEvents = "none";
    } 
    else {
        // ΑΥΤΟΜΑΤΗ
        doorLeaves.disabled = false;
        
        // Αν πριν ήταν ημιαυτόματη, γέμισε ξανά τα φύλλα
        if (doorLeaves.options.length <= 1) {
            doorLeaves.innerHTML = `
                <option value="2">2 Φύλλα</option>
                <option value="3">3 Φύλλα</option>
                <option value="4">4 Φύλλα</option>
            `;
            doorLeaves.value = "2"; 
        }

        const leaves = doorLeaves.value;

        if (leaves === "3") {
            openingType.innerHTML = '<option value="Πλαϊνό">Πλαϊνό</option>';
            openingType.value = "Πλαϊνό"; 
            openingType.style.pointerEvents = "none";
        } 
        else if (leaves === "4") {
            openingType.innerHTML = '<option value="Κεντρικό">Κεντρικό</option>';
            openingType.value = "Κεντρικό"; 
            openingType.style.pointerEvents = "none";
        } 
        else {
            // 2 Φύλλα
            openingType.style.pointerEvents = "auto";
            const prevVal = openingType.value; 
            
            openingType.innerHTML = `
                <option value="Κεντρικό">Κεντρικό</option>
                <option value="Πλαϊνό">Πλαϊνό</option>
            `;
            
            // Κράτα την επιλογή του χρήστη ή βάλε default
            if (prevVal === "Πλαϊνό" || prevVal === "Κεντρικό") {
                openingType.value = prevVal;
            } else {
                openingType.value = (chassisPosition === 'rear') ? "Κεντρικό" : "Πλαϊνό";
            }
        }
    }
    
    // --- SECTION D: ΚΑΤΕΥΘΥΝΣΗ ΑΝΟΙΓΜΑΤΟΣ (1η Πόρτα) ---
    if (openingType.value === "Πλαϊνό") {
        openingDirection.disabled = false;
        if (!openingDirection.innerHTML.includes('Αριστερά')) {
            openingDirection.innerHTML = `
                <option value="Αριστερά">Αριστερά</option>
                <option value="Δεξιά" selected>Δεξιά</option>
            `;
        }
    } else {
        openingDirection.disabled = true;
        openingDirection.innerHTML = '<option value="Default">Default</option>';
        openingDirection.value = "Default";
    }

    // --- SECTION E (ΝΕΟ): ΚΛΕΙΔΩΜΑ ΚΑΤΕΥΘΥΝΣΗΣ 2ης ΠΟΡΤΑΣ ---
    if (dirSecondDoor) { 
        if (cabinDoorsSelect.value === '2_gwniako' && (openingType.value === "Κεντρικό" || openingType.value === "Ημιαυτόματη")) {
            // Αν είναι κεντρική ή ημιαυτόματη
            dirSecondDoor.disabled = true;
            dirSecondDoor.innerHTML = '<option value="Default">Default</option>';
            dirSecondDoor.style.opacity = '0.5';
        } else {
            // Αν είναι πλαϊνή, ξεκλείδωσέ το και βάλε ξανά τις επιλογές
            dirSecondDoor.disabled = false;
            dirSecondDoor.style.opacity = '1';
            
            // Ελέγχουμε αν λείπει η επιλογή "panw". Αν λείπει, τις ξαναγράφουμε!
            if (!dirSecondDoor.innerHTML.includes('panw')) {
                dirSecondDoor.innerHTML = `
                    <option value="panw">Πάνω</option>
                    <option value="katw">Κάτω</option>
                `;
            }
        }
    }
    
    // Τέλος, ενημέρωσε τα διαθέσιμα mm ανοίγματος
    populateDoorOpenings();
}

function populateDoorOpenings() {
    const doorType = document.getElementById('doortype').value;
    const leaves = document.getElementById('doorLeaves').value;
    const openingType = document.getElementById('tuposAnoigmatos').value;
    const openingSelect = document.getElementById('doorOpening');
    
    openingSelect.innerHTML = ''; // πριν βάλουμε τα νέα νούμερα πρέπει να καθαρίσουμε το κουτάκι από τα παλιά
    let options = []; // Αυτός ο πίνακας θα γεμίσει με τις σωστές επιλογές ανάλογα με τον τύπο πόρτας, τα φύλλα και τον τύπο ανοίγματος

    if (doorType === 'semi_automatic') {
        options = [550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1100, 1200, 1300, 1400, 1500];
    } 
    else {
        if (leaves === "2" && openingType === "Κεντρικό") {
            options = [600, 650, 700, 750, 800, 850, 900, 1000, 1100, 1200, 1300, 1400, 1500];
        } 
        else if (leaves === "4" && openingType === "Κεντρικό") {
            options = [700, 750, 800, 850, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
        } 
        else if (leaves === "2" && openingType === "Πλαϊνό") {
            options = [600, 650, 700, 750, 800, 850, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
        } 
        else if (leaves === "3" && openingType === "Πλαϊνό") {
            options = [650, 700, 750, 800, 850, 900, 1000, 1200, 1300, 1400, 1500, 1600];
        }
    }

    options.forEach(val => { 
        let opt = document.createElement('option');
        opt.value = val;
        opt.innerHTML = val + " mm";
        openingSelect.appendChild(opt);
    });
    const optionExists = Array.from(cabinDoorsSelect.options).some(opt => opt.value === currentCabinDoorsVal);
    if (optionExists) {
        cabinDoorsSelect.value = currentCabinDoorsVal;
    } else {
        cabinDoorsSelect.value = "1";
    }

    // --- ΝΕΟΣ ΕΛΕΓΧΟΣ ΓΙΑ ΕΜΦΑΝΙΣΗ ΘΕΣΗΣ 2ΗΣ ΠΟΡΤΑΣ ---
    const secondDoorPosContainer = document.getElementById('secondDoorPosContainer');
    if (cabinDoorsSelect.value === '2_gwniako') {
        secondDoorPosContainer.style.display = 'block'; // Το εμφανίζουμε
    } else {
        secondDoorPosContainer.style.display = 'none';  // Το κρύβουμε
    }
}

// αν αλλάξει ο τύπος πόρτας, πρέπει να ενημερωθούν και τα φύλλα και ο τύπος ανοίγματος, άρα καλούμε την updateDoorLogic που κάνει ήδη αυτή τη δουλειά. Αν αλλάξει ο αριθμός των φύλλων ή ο τύπος ανοίγματος, πρέπει να ενημερωθούν τα διαθέσιμα mm, άρα καλούμε την populateDoorOpenings.
document.getElementById('doortype').addEventListener('change', updateDoorLogic); 
document.getElementById('doorLeaves').addEventListener('change', updateDoorLogic);
document.getElementById('tuposAnoigmatos').addEventListener('change', updateDoorLogic);
document.getElementById('thesi_sassi').addEventListener('change', updateDoorLogic);
// Πρέπει να λέμε στο JS να ξανατρέχει τη λογική κάθε φορά που αλλάζουμε τον αριθμό των πορτών
document.getElementById('cabinDoors').addEventListener('change', updateDoorLogic);
document.getElementById('secondDoorDir').addEventListener('change', updateDoorLogic)





// Αρχική κλήση
window.addEventListener('load', updateDoorLogic);

async function solveElevator() {
    const container = document.getElementById('elevator-plan-container'); // πιάσε τον χώρο που θα μπει το σχέδιο
    const resultsTable = document.getElementById('resultsTable'); // πιάσε τον χώρο που θα μπει ο πίνακας με τα αποτελέσματα
    const atomaVal = document.getElementById('atomaCount').value;

    let actualChassis = document.getElementById('thesi_sassi').value;
    let actualDoorDir = document.getElementById('kateuthinsiAnoigmatos').value;
    let apiChassis = actualChassis;
    let apiDoorDir = actualDoorDir;

    if (actualChassis === 'right') {
        apiChassis = 'side';
        if (actualDoorDir === 'Αριστερά') apiDoorDir = 'Δεξιά';
        else if (actualDoorDir === 'Δεξιά') apiDoorDir = 'Αριστερά';
    }


    // Συλλογή Δεδομένων
    const data = {
        shaftwidth: parseFloat(document.getElementById('shaftWidth').value) || 0,
        shaftdepth: parseFloat(document.getElementById('shaftDepth').value) || 0,
        // Χρήση της atomaVal που ορίσαμε παραπάνω
        atoma: atomaVal === "" ? null : parseInt(atomaVal), 
        thesi_sassi: apiChassis,
        tupos_portas: document.getElementById('doortype').value === 'automatic' ? 'Αυτόματη' : 'Ημιαυτόματη',
        arithmos_fyllon: parseInt(document.getElementById('doorLeaves').value) || 1,
        anoigma_portas: parseInt(document.getElementById('doorOpening').value) || 0,
        tupos_anoigmatos: document.getElementById('tuposAnoigmatos').value,
        kateuthinsi_anoigmatos: apiDoorDir,
        cabin_doors: document.getElementById('cabinDoors').value,
        thesi_second_door: document.getElementById('secondDoorPosition').value,
        dir_second_door: document.getElementById('secondDoorDir').value,
        vathos_puthmena: parseFloat(document.getElementById('vathos_puthmena').value),
        ipsos_tel_orofou: parseFloat(document.getElementById('ipsos_tel_orofou').value),
        diadromi_anelkistira: parseFloat(document.getElementById('diadromi_anelkistira').value),
        staseis: parseInt(document.getElementById('staseis').value)
        


    };

    data.real_chassis = actualChassis;

    if (container) {
        container.innerHTML = `<div class="loader"></div><p>Αναζήτηση βέλτιστης λύσης Z3...</p>`; // loading εφέ 
    }

    try {
    const response = await fetch('http://127.0.0.1:8000/solve', { // Στείλε τα δεδομένα στο Backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    
    const result = await response.json(); // περίμενε την απάντηση από το Backend και κάνε την JSON

    if (result.status === "success") {
        // Τραβάμε ΤΑΥΤΟΧΡΟΝΑ την κάτοψη και την πλάγια όψη από το Backend!
        const best_horiz = result.data ? result.data.best_solution : result.best_solution;
        const best_vert = result.data ? result.data.plagia_opsi : result.plagia_opsi;
        
        if (best_horiz) {
            displayResults(best_horiz);
            drawElevatorSVG(data, best_horiz); 
            
            drawplagiaopsi(data, best_horiz, best_vert);
        } else {
            if (container) container.innerHTML = `<p style="color: orange;">⚠️ Τα δεδομένα της λύσης είναι κενά.</p>`;
        }
    } 
    else {
        // Διαχείριση περίπτωσης "error" από το Backend
        if (container) {
            container.innerHTML = `<p style="color: red;">❌ Δεν βρέθηκε λύση: ${result.message || 'Άγνωστο σφάλμα'}</p>`;
        }
    }

} catch (error) {
    // Διαχείριση σφαλμάτων δικτύου ή crash του server
    if (container) {
        container.innerHTML = `<p style="color: red;">❌ Σφάλμα συστήματος: ${error.message}</p>`;
    }
    console.error('Error Details:', error);
}
}

function drawElevatorSVG(inputs, data) {
    
    const container = document.getElementById('elevator-plan-container');
    if (!container) return;
    container.innerHTML = '';
   
    const chassisPosition = inputs.thesi_sassi; 
    if (chassisPosition === 'left' || chassisPosition === 'side'){ 
   
    // ==============================================================
    // --- 1. ΜΕΤΑΒΛΗΤΕΣ ΑΠΟ API & INPUTS ---
    // ==============================================================
    const sW = parseFloat(inputs.shaftwidth);
    const sD = parseFloat(inputs.shaftdepth);
    const CO = parseFloat(inputs.anoigma_portas);
    const G = parseFloat(data.G_portas_val) || 0;
    const pP = parseFloat(data.Pahos_portas_val) || 180;
    
    const doorStartX = parseFloat(data.Apostasi_ar_lampa); 

    const cW = parseFloat(data.Platos_thalamou);
    const cD = parseFloat(data.Vathos_Thalamou);
    const dist_y = parseFloat(data.Apostasi_thalamou_toixou_y);
    const dist_x = parseFloat(data.Apostasi_thalamou_toixou_x);
    
    const cX = sW - cW - dist_x;
    const cY = dist_y; 

    const rX = parseFloat(data.Apostasi_toixou_odhgou_x);
    const rY1 = parseFloat(data.Apostasi_toixou_odhgou_y1);
    const dbg = parseFloat(data.Anoigma_odhgwn);
    
    const t = 90; // Πάχος Τοίχου

    // --- VIEWBOX (Μεγαλωμένο για να χωράνε οι διαστάσεις γύρω-γύρω) ---
    let svg = `<svg viewBox="-250 -250 ${sW + 650} ${sD + 650}" xmlns="http://www.w3.org/2000/svg" style="width:100%; background:#111827; border-radius:12px;">`;

    // --- DEFINITIONS (HATCHES) ---
    svg += `
        <defs>
            <pattern id="doorHatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="5" stroke="#475569" stroke-width="1" />
            </pattern>
            <pattern id="concretePattern" patternUnits="userSpaceOnUse" width="120" height="120">
                <circle cx="10" cy="15" r="0.8" fill="#64748b" />
                <circle cx="45" cy="10" r="0.5" fill="#64748b" />
                <circle cx="90" cy="40" r="1" fill="#64748b" />
                <circle cx="30" cy="80" r="0.7" fill="#64748b" />
                <path d="M 60 70 L 68 65 L 72 75 L 62 80 Z" fill="none" stroke="#94a3b8" stroke-width="2" /> <circle cx="20" cy="40" r="3" fill="none" stroke="#94a3b8" stroke-width="1.5" /> <path d="M 100 90 L 110 95 L 105 105 Z" fill="#475569" /> <path d="M 40 30 L 50 30 L 45 38 Z" fill="none" stroke="#cbd5e1" stroke-width="1.8" />
                <path d="M 80 15 L 88 15 L 84 22 Z" fill="none" stroke="#cbd5e1" stroke-width="1.2" />
            </pattern>
            <pattern id="pillarPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="0.8" />
                <line x1="0" y1="0" x2="8" y2="0" stroke="#475569" stroke-width="0.8" />
            </pattern>
        </defs>
    `;
    let globalMirror = "";
    if (inputs.real_chassis === 'right') {
        // Κάνουμε mirror όλο το φρεάτιο γύρω από τον άξονα Χ του
        globalMirror = `transform="translate(${sW}, 0) scale(-1, 1)"`;
    }

    // Ανοίγουμε το Group για όλη τη γεωμετρία
    svg += `<g ${globalMirror}>`;

    // ==============================================================
    // --- 2. ΤΟΙΧΟΙ & ΦΡΕΑΤΙΟ ---
    // ==============================================================
    const isThroughCar = (inputs.cabin_doors === '2_opposite');

    let wallPath = ``;
    if (isThroughCar) {
        // Αν έχουμε 2 πόρτες (διαμπερές), "σπάμε" το Π του φρεατίου σε δύο κάθετους τοίχους (αριστερά και δεξιά)
        // για να αφήσουμε όλο το πάνω μέρος ελεύθερο.
        wallPath = `
            M ${-t} ${sD} 
            L ${-t} 0 
            L 0 0 
            L 0 ${sD} 
            Z
            M ${sW} ${sD} 
            L ${sW} 0 
            L ${sW + t} 0 
            L ${sW + t} ${sD} 
            Z
        `;
    } else {
        // Κανονικό φρεάτιο 1 πόρτας (ένα συνεχόμενο Π που κλείνει την πλάτη)
        wallPath = `
            M ${-t} ${sD} 
            L ${-t} ${-t} 
            L ${sW + t} ${-t} 
            L ${sW + t} ${sD} 
            L ${sW} ${sD} 
            L ${sW} 0 
            L 0 0 
            L 0 ${sD} 
            Z
        `;
    }
    svg += `<path d="${wallPath}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" stroke-linejoin="round" />`;
    
    // --- ΜΠΡΟΣΤΙΝΟΣ ΤΟΙΧΟΣ & ΚΟΛΩΝΕΣ (ΥΠΑΡΧΟΥΝ ΠΑΝΤΑ) ---
    const pillarW = 120; 
    const pillarH = 60;  
    const pillarY = sD; 
    const frontWallH = t; 
    const frontWallY = sD;

    const leftWallW = doorStartX - pillarW;
    if (leftWallW > 0) svg += `<rect x="0" y="${frontWallY}" width="${leftWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
    svg += `<rect x="${doorStartX - pillarW}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
    svg += `<rect x="${doorStartX + CO}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
    
    const rightWallX = doorStartX + CO + pillarW;
    const rightWallW = sW - rightWallX;
    if (rightWallW > 0) svg += `<rect x="${rightWallX}" y="${frontWallY}" width="${rightWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;

    // --- ΠΙΣΩ ΤΟΙΧΟΣ & ΚΟΛΩΝΕΣ (ΜΟΝΟ ΣΤΟ ΔΙΑΜΠΕΡΕΣ) ---
    if (isThroughCar) {
        // Ζωγραφίζουμε το καθρέφτισμα του μπροστινού τοίχου ψηλά, στο Υ = 0 και Υ = -t
        const backWallY = -t;
        const backPillarY = -pillarH; // Οι κολώνες βγαίνουν προς τα έξω (πάνω)
        
        if (leftWallW > 0) svg += `<rect x="0" y="${backWallY}" width="${leftWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        svg += `<rect x="${doorStartX - pillarW}" y="${backPillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        svg += `<rect x="${doorStartX + CO}" y="${backPillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        
        if (rightWallW > 0) svg += `<rect x="${rightWallX}" y="${backWallY}" width="${rightWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
    }
    // ==============================================================
    // --- 3. ΠΟΡΤΑ (ΜΠΡΟΣΤΑ & ΠΙΣΩ) ---
    // ==============================================================
    const doorType = inputs.tupos_portas || 'Αυτόματη';
    const numLeaves = parseInt(inputs.arithmos_fyllon) || 2;
    const isCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";
    const isLeftOpen = (inputs.kateuthinsi_anoigmatos === "Αριστερά"); 

    const doorCode = isCentral ? 'pC' : 'pS';
    const doorKey = numLeaves + doorCode; 
    const sealDict = { "2pC": 54, "4pC": 90, "2pS": 90, "3pS": 135 };
    const seal = sealDict[doorKey] || 90; 
    const numRails = isCentral ? (numLeaves / 2) : numLeaves;
    const railThk = seal / numRails; 
    
    const isRightChassis = (inputs.real_chassis === 'right');
    const hasTwoDoors = (inputs.cabin_doors === '2_opposite');

    // === Βοηθητική Συνάρτηση που ζωγραφίζει ΜΙΑ πόρτα (μπροστά ή πίσω) ===
    function drawOneDoor(isFront) {
        let localSvg = "";
        
        // --- Ρυθμίσεις Ύψους (Y) ανάλογα με το αν είναι η μπροστινή ή η πίσω πόρτα ---
        let cFrontY, doorWallY, lDoorY, cDoorY, visualAir;
        
        if (isFront) {
            cFrontY = cY + cD; // Η φάτσα της καμπίνας (κάτω μέρος)
            doorWallY = sD;    // Ο μπροστινός τοίχος του φρεατίου (τέρμα κάτω)
            lDoorY = doorWallY - seal; // Πόρτα ορόφου
            cDoorY = lDoorY - 35 - seal; // Πόρτα καμπίνας
            visualAir = cDoorY - cFrontY; // Το "50άρι" κενό (αέρας)
        } else {
            cFrontY = cY; // Η πλάτη της καμπίνας (πάνω μέρος)
            doorWallY = 0; // Ο πίσω τοίχος του φρεατίου (τέρμα πάνω)
            lDoorY = doorWallY; // Η πίσω πόρτα ορόφου κολλάει στο Υ=0
            cDoorY = lDoorY + seal + 35; // Η πίσω πόρτα καμπίνας είναι πιο κάτω
            visualAir = cFrontY - (cDoorY + seal); 
        }

        const endX = doorStartX + CO;

        if (doorType === 'Αυτόματη') {
            // ΓΡΑΜΜΕΣ ΚΑΣΑΣ / ΚΕΝΟ
            localSvg += `<line x1="${doorStartX}" y1="${cFrontY}" x2="${doorStartX}" y2="${isFront ? cDoorY : cDoorY + seal}" stroke="#64748b" stroke-width="2" />`;
            localSvg += `<line x1="${endX}" y1="${cFrontY}" x2="${endX}" y2="${isFront ? cDoorY : cDoorY + seal}" stroke="#64748b" stroke-width="2" />`;
            localSvg += `<rect x="${doorStartX}" y="${isFront ? cFrontY : cDoorY + seal}" width="${CO}" height="${Math.abs(cFrontY - (isFront ? cDoorY : cDoorY + seal))}" fill="#1e293b" opacity="0.4" />`;

            const doorsToDraw = [
                { yBase: cDoorY, label: "Cabin Door" }, 
                { yBase: lDoorY, label: "Landing Door" }
            ];

            doorsToDraw.forEach((doorSet, setIndex) => {
                const baseY = doorSet.yBase;
                for (let i = 0; i < numRails; i++) {
                    const railY = baseY + (i * railThk);
                    let railX, railW;

                    if (isCentral) {
                        railX = doorStartX - G;
                        railW = G + CO + G;
                        localSvg += `<rect x="${railX}" y="${railY}" width="${railW}" height="${railThk}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                        localSvg += `<line x1="${railX}" y1="${railY + railThk * 0.5}" x2="${railX + railW}" y2="${railY + railThk * 0.5}" stroke="#475569" stroke-width="1.5" />`;
                        const leafW = CO / 2;
                        localSvg += `<rect x="${doorStartX}" y="${railY + 2}" width="${leafW}" height="${railThk - 4}" fill="url(#doorHatch)" stroke="#677b96" stroke-width="1.5" />`;
                        localSvg += `<rect x="${doorStartX + leafW}" y="${railY + 2}" width="${leafW}" height="${railThk - 4}" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
                        localSvg += `<rect x="${doorStartX + (leafW/2) - 15}" y="${railY + (railThk/2) - 2}" width="30" height="4" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                        localSvg += `<rect x="${doorStartX + leafW + (leafW/2) - 15}" y="${railY + (railThk/2) - 2}" width="30" height="4" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                    } else {
                        let leafIndex;
                        if (isLeftOpen) {
                            railX = doorStartX - G;
                            railW = G + CO;
                            leafIndex = (setIndex === 0) ? i : (numRails - 1 - i);
                        } else {
                            railX = doorStartX;
                            railW = CO + G;
                            leafIndex = (setIndex === 0) ? (numRails - 1 - i) : i; 
                        }

                        localSvg += `<rect x="${railX}" y="${railY}" width="${railW}" height="${railThk}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                        localSvg += `<line x1="${railX}" y1="${railY + railThk * 0.5}" x2="${railX + railW}" y2="${railY + railThk * 0.5}" stroke="#475569" stroke-width="1.5" />`;
                        
                        const leafW = CO / numLeaves;
                        const leafX = doorStartX + (leafIndex * leafW);
                        
                        localSvg += `<rect x="${leafX}" y="${railY + 2}" width="${leafW}" height="${railThk - 4}" fill="url(#doorHatch)" stroke="#5d6d85" stroke-width="1.5" />`;
                        localSvg += `<rect x="${leafX + (leafW/2) - 15}" y="${railY + (railThk/2) - 2}" width="30" height="4" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                    }
                }
            });

            // ΕΣΩΤΕΡΙΚΗ ΔΙΑΣΤΑΣΙΟΛΟΓΗΣΗ (Μόνο για την μπροστινή πόρτα, για να μην γεμίσει το σχέδιο νούμερα)
            if (isFront) {
                let dimX_internal, textAnchor, textX;
                if (isCentral) {
                    dimX_internal = doorStartX - G - 25;
                    textAnchor = "end"; textX = dimX_internal - 12;
        } else {
                    if (isLeftOpen) {
                        dimX_internal = doorStartX + CO + 25;
                        textAnchor = "start"; textX = dimX_internal + 16;
                    } else {
                        dimX_internal = doorStartX - 25;
                        textAnchor = "end"; textX = dimX_internal - 12;
                    }
                }

                const drawHorizTick = (y) => `<line x1="${dimX_internal - 5}" y1="${y}" x2="${dimX_internal + 5}" y2="${y}" stroke="white" stroke-width="1.5" />`;
                localSvg += `<line x1="${dimX_internal}" y1="${cFrontY}" x2="${dimX_internal}" y2="${doorWallY}" stroke="white" stroke-width="1" />`;
                localSvg += drawHorizTick(cFrontY) + drawHorizTick(cDoorY) + drawHorizTick(cDoorY + seal) + drawHorizTick(lDoorY) + drawHorizTick(doorWallY);       
                
                const fixX = isRightChassis ? -textX : textX;
                const fixTransform = isRightChassis ? ` transform="scale(-1, 1)"` : ``;
                let fixAnchor = textAnchor;
                if (isRightChassis) { fixAnchor = (textAnchor === "start") ? "end" : "start"; }

                localSvg += `<text x="${fixX}" y="${cFrontY + (visualAir / 2)}" fill="white" font-size="16" dominant-baseline="middle" text-anchor="${fixAnchor}"${fixTransform}>50</text>`;
                localSvg += `<text x="${fixX}" y="${cDoorY + (seal / 2)}" fill="#fbbf24" font-size="18" font-weight="bold" dominant-baseline="middle" text-anchor="${fixAnchor}"${fixTransform}>${seal}</text>`;
                localSvg += `<text x="${fixX}" y="${lDoorY - 17.5}" fill="white" font-size="16" dominant-baseline="middle" text-anchor="${fixAnchor}"${fixTransform}>35</text>`;
                localSvg += `<text x="${fixX}" y="${lDoorY + (seal / 2)}" fill="#fbbf24" font-size="18" font-weight="bold" dominant-baseline="middle" text-anchor="${fixAnchor}"${fixTransform}>${seal}</text>`;
                }

        } else {
            // ΗΜΙΑΥΤΟΜΑΤΗ ΠΟΡΤΑ
            localSvg += `<line x1="${doorStartX}" y1="${cFrontY}" x2="${doorStartX}" y2="${doorWallY}" stroke="#64748b" stroke-width="2" />`;
            localSvg += `<line x1="${doorStartX + CO}" y1="${cFrontY}" x2="${doorStartX + CO}" y2="${doorWallY}" stroke="#64748b" stroke-width="2" />`;
            localSvg += `<rect x="${doorStartX}" y="${isFront ? cFrontY : doorWallY}" width="${CO}" height="${Math.abs(doorWallY - cFrontY)}" fill="#1e293b" opacity="0.4" />`;

            const hemiWallY = isFront ? doorWallY : doorWallY - 40; 
            localSvg += `<rect x="${doorStartX - G}" y="${hemiWallY}" width="${G + CO + G}" height="40" fill="#334155" stroke="#475569" stroke-width="2" />`;
            localSvg += `<rect x="${doorStartX}" y="${hemiWallY + 5}" width="${CO}" height="30" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
            localSvg += `<circle cx="${doorStartX + CO - 20}" cy="${hemiWallY + 20}" r="6" fill="#fbbf24" stroke="#d97706" stroke-width="2" />`;
        }

        return localSvg;
    }

    // --- ΚΛΗΣΗ ΤΗΣ ΣΥΝΑΡΤΗΣΗΣ ---
    // 1. Ζωγραφίζουμε πάντα την μπροστινή πόρτα
    svg += drawOneDoor(true);

    // 2. Αν ο χρήστης έχει επιλέξει 2 πόρτες (διαμπερές), ζωγραφίζουμε ΚΑΙ την πίσω
    if (hasTwoDoors) {
        svg += drawOneDoor(false);
    }

    // ==============================================================
    // --- 4. ΥΠΟΛΟΓΙΣΜΟΙ ΟΔΗΓΩΝ & ΣΤΗΡΙΓΜΑΤΩΝ (ΑΠΟ ΤΟΥΣ ΤΟΙΧΟΥΣ) ---
    // ==============================================================

    let rawModel = (inputs.Odhgoi_Type || "T89/A").toString().trim().toUpperCase();
    const railModels = {
        "T50":      { baseW: 50,  baseThk: 5,  totalH: 50, bladeW: 5 },
        "T75":      { baseW: 75,  baseThk: 10, totalH: 62, bladeW: 10 },
        "T89/A":    { baseW: 89,  baseThk: 16, totalH: 62, bladeW: 16 },
        "T89/B":    { baseW: 89,  baseThk: 16, totalH: 62, bladeW: 16 },
        "T90/A":    { baseW: 90,  baseThk: 16, totalH: 75, bladeW: 16 },
        "T90/B":    { baseW: 90,  baseThk: 16, totalH: 75, bladeW: 16 },
        "T125/A":   { baseW: 125, baseThk: 16, totalH: 82, bladeW: 16 },
        "T125/B":   { baseW: 125, baseThk: 16, totalH: 82, bladeW: 16 },
        "T127-2/B": { baseW: 127, baseThk: 16, totalH: 89, bladeW: 16 }
    };
    let railDim = railModels[rawModel] || railModels["T89/A"];

    const railBaseW = railDim.baseW;     
    const railBaseThk = railDim.baseThk; 
    const bladeW = railDim.bladeW;       
    const h1 = railDim.totalH;           
    
    // Πάχη στηριγμάτων από τον solver
    const thkDoor = parseFloat(data.pahos_sthrigmatos_door) || 40;
    const thkOpposite = parseFloat(data.pahos_sthrigmatos_opposite) || 40;
    const bracketLenX = 240;

    
    
    // Αν για κάποιο λόγο δεν έρθει το y2, το υπολογίζουμε αφαιρώντας τα πάντα από το sD
    const rY2 = parseFloat(data.Apostasi_toixou_odhgou_y2) 

    // --- ΚΑΤΩ ΠΛΕΥΡΑ ---
    const br1BottomY = sD - rY1;                // Ξεκινάει rY1 χιλιοστά πάνω από τον κάτω τοίχο
    const br1TopY = br1BottomY - thkDoor;       // Το πάχος του κάτω στηρίγματος
    const rail1BaseY = br1TopY;                 // Η βάση του κάτω οδηγού
    const rail1TipY = rail1BaseY - h1;          // Η μύτη του κάτω οδηγού

    // --- ΠΑΝΩ ΠΛΕΥΡΑ ---
    const br2TopY = rY2;                        // Ξεκινάει rY2 χιλιοστά κάτω από τον πάνω τοίχο (0)
    const br2BottomY = br2TopY + thkOpposite;   // Το πάχος του πάνω στηρίγματος
    const rail2BaseY = br2BottomY;              // Η βάση του πάνω οδηγού
    const rail2TipY = rail2BaseY + h1;          // Η μύτη του πάνω οδηγού
    // ==============================================================
    // --- 5. ΖΩΓΡΑΦΙΚΗ ΚΑΜΠΙΝΑΣ & ΜΗΧΑΝΙΚΩΝ ---
    // ==============================================================
    // Καμπίνα
    svg += `<rect x="${cX}" y="${cY}" width="${cW}" height="${cD}" fill="none" stroke="#0ea5e9" stroke-width="4" />`;
    svg += `<rect x="${cX + 15}" y="${cY + 15}" width="${cW - 30}" height="${cD - 30}" fill="rgba(14, 165, 233, 0.05)" stroke="#0ea5e9" stroke-width="1" />`;

    // ==============================================================
    // --- 5. ΖΩΓΡΑΦΙΚΗ ΣΤΗΡΙΓΜΑΤΩΝ, ΟΔΗΓΩΝ & ΕΜΒΟΛΟΥ ---
    // ==============================================================

    // --- ΚΑΤΩ ΣΤΗΡΙΓΜΑ & ΟΔΗΓΟΣ ---
    // Χρησιμοποιούμε το thkDoor (πάχος από solver) για το ύψος του ορθογωνίου
    svg += `<rect x="0" y="${br1TopY}" width="${bracketLenX}" height="${thkDoor}" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
    svg += `<rect x="40" y="${br1TopY + (thkDoor/2) - 4}" width="80" height="8" rx="4" fill="#111827" />`;
    
    // Κάτω Οδηγός
    svg += `<rect x="${rX - (railBaseW / 2)}" y="${rail1BaseY - railBaseThk}" width="${railBaseW}" height="${railBaseThk}" fill="#eab308" />`;
    svg += `<rect x="${rX - (bladeW / 2)}" y="${rail1TipY}" width="${bladeW}" height="${h1 - railBaseThk}" fill="#eab308" />`;


    // --- ΠΑΝΩ ΣΤΗΡΙΓΜΑ & ΟΔΗΓΟΣ ---
    // Χρησιμοποιούμε το thkOpposite (πάχος από solver) για το ύψος του ορθογωνίου
    svg += `<rect x="0" y="${br2TopY}" width="${bracketLenX}" height="${thkOpposite}" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
    svg += `<rect x="40" y="${br2TopY + (thkOpposite/2) - 4}" width="80" height="8" rx="4" fill="#111827" />`;
    
    // Πάνω Οδηγός
    svg += `<rect x="${rX - (railBaseW / 2)}" y="${rail2BaseY}" width="${railBaseW}" height="${railBaseThk}" fill="#eab308" />`;
    svg += `<rect x="${rX - (bladeW / 2)}" y="${rail2BaseY + railBaseThk}" width="${bladeW}" height="${h1 - railBaseThk}" fill="#eab308" />`;


    // --- ΕΜΒΟΛΟ (Κεντραρισμένο ανάμεσα στις μύτες των οδηγών) ---
    const pistonY = (rail1TipY + rail2TipY) / 2;
    svg += `<circle cx="${rX}" cy="${pistonY}" r="22" fill="#f97316" stroke="#c2410c" stroke-width="2" />`;
    svg += `<circle cx="${rX}" cy="${pistonY}" r="10" fill="#fff7ed" />`;

    // Κλείνουμε τον καθρέφτη ΕΔΩ, ώστε οι γραμμές και τα κείμενα των διαστάσεων να μην γυρίσουν ανάποδα!
    svg += `</g>`;
    // ==============================================================
    // --- 6. ΕΞΩΤΕΡΙΚΗ ΔΙΑΣΤΑΣΙΟΛΟΓΗΣΗ ΣΕ ΟΛΕΣ ΤΙΣ ΠΛΕΥΡΕΣ ---
    // ==============================================================
    
    // Ελέγχουμε αν το πραγματικό σασί που ζήτησε ο χρήστης είναι δεξιά (άρα κάναμε mirror)
    const isRight = (inputs.real_chassis === 'right');

    // --- ΣΥΝΑΡΤΗΣΕΙΣ ---
    const drawDimV = (x, y1, y2, value, labelOffset = -25) => {
        let dimSvg = `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#ffffff" stroke-width="2" />`;
        dimSvg += `<line x1="${x}" y1="${y1}" x2="${x + 130}" y2="${y1}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        dimSvg += `<line x1="${x}" y1="${y2}" x2="${x + 130}" y2="${y2}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        dimSvg += `<line x1="${x - 8}" y1="${y1 + 8}" x2="${x + 8}" y2="${y1 - 8}" stroke="#ffffff" stroke-width="2.5" />`;
        dimSvg += `<line x1="${x - 8}" y1="${y2 + 8}" x2="${x + 8}" y2="${y2 - 8}" stroke="#ffffff" stroke-width="2.5" />`;
        const midY = (y1 + y2) / 2;
        dimSvg += `<text x="${x + labelOffset}" y="${midY}" fill="#ffffff" font-size="22" font-family="Arial" font-weight="bold" text-anchor="middle" transform="rotate(-90, ${x + labelOffset}, ${midY})">${Math.round(value)}</text>`;
        return dimSvg;
    };

    const drawDimVRight = (x, y1, y2, value, labelOffset = 25) => {
        let dimSvg = `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#ffffff" stroke-width="2" />`;
        dimSvg += `<line x1="${x}" y1="${y1}" x2="${x - 130}" y2="${y1}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        dimSvg += `<line x1="${x}" y1="${y2}" x2="${x - 130}" y2="${y2}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        dimSvg += `<line x1="${x - 8}" y1="${y1 + 8}" x2="${x + 8}" y2="${y1 - 8}" stroke="#ffffff" stroke-width="2.5" />`;
        dimSvg += `<line x1="${x - 8}" y1="${y2 + 8}" x2="${x + 8}" y2="${y2 - 8}" stroke="#ffffff" stroke-width="2.5" />`;
        const midY = (y1 + y2) / 2;
        dimSvg += `<text x="${x + labelOffset}" y="${midY}" fill="#fbbf24" font-size="24" font-family="Arial" font-weight="bold" text-anchor="middle" transform="rotate(-90, ${x + labelOffset}, ${midY})">${Math.round(value)}</text>`;
        return dimSvg;
    };

    const drawDimH = (x1, x2, y, value, wallY, labelColor = "#ffffff", fontWeight = "normal", fontSize = "20") => {
        let dimSvg = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#ffffff" stroke-width="2" />`;
        dimSvg += `<line x1="${x1}" y1="${wallY}" x2="${x1}" y2="${y}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        dimSvg += `<line x1="${x2}" y1="${wallY}" x2="${x2}" y2="${y}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        dimSvg += `<line x1="${x1 - 8}" y1="${y + 8}" x2="${x1 + 8}" y2="${y - 8}" stroke="#ffffff" stroke-width="2.5" />`;
        dimSvg += `<line x1="${x2 - 8}" y1="${y + 8}" x2="${x2 + 8}" y2="${y - 8}" stroke="#ffffff" stroke-width="2.5" />`;
        const midX = (x1 + x2) / 2;
        dimSvg += `<text x="${midX}" y="${y - 15}" fill="${labelColor}" font-size="${fontSize}" font-family="Arial" font-weight="${fontWeight}" text-anchor="middle">${Math.round(value)}</text>`;
        return dimSvg;
    };


    // 1. ΠΛΑΤΟΣ ΦΡΕΑΤΙΟΥ (Πάνω - Μένει πάντα κέντρο)
    svg += drawDimH(0, sW, -180, sW, 0);

    // 2. ΒΑΘΟΣ ΦΡΕΑΤΙΟΥ (Αλλάζει πλευρά)
    if (isRight) {
        svg += drawDimV(-180, 0, sD, sD); // Το πάμε αριστερά
    } else {
        svg += drawDimVRight(sW + 180, 0, sD, sD); // Μένει δεξιά
    }


    // --- Α. ΑΛΥΣΙΔΑ ΟΔΗΓΩΝ (Y-Axis) ---
    const dimRailX = isRight ? (sW + 130) : -130; // Αν είναι δεξιά οι ράγες, πάει δεξιά η διάσταση
    
    if (isRight) {
        svg += drawDimVRight(dimRailX, sD, rail1TipY, sD - rail1TipY);
        svg += drawDimVRight(dimRailX, rail1TipY, rail2TipY, dbg);
        svg += drawDimVRight(dimRailX, rail2TipY, 0, rail2TipY);
    } else {
        svg += drawDimV(dimRailX, sD, rail1TipY, sD - rail1TipY);
        svg += drawDimV(dimRailX, rail1TipY, rail2TipY, dbg);
        svg += drawDimV(dimRailX, rail2TipY, 0, rail2TipY);
    }


    // --- Β. ΑΛΥΣΙΔΑ ΚΑΤΩ (ΠΟΡΤΑ) ---
    const dimDoorY = sD + 150; 
    const apiLeftLampa = parseFloat(data.Apostasi_ar_lampa) || doorStartX;
    const apiRightLampa = parseFloat(data.Apostasi_dek_lampa) || (sW - (apiLeftLampa + CO));

    // Το μαγικό κόλπο: Αν το σασί γύρισε, η αριστερή λαμπά του API είναι πλέον η ΟΠΤΙΚΑ δεξιά λαμπά!
    const visLeftLampa = isRight ? apiRightLampa : apiLeftLampa;
    const visRightLampa = isRight ? apiLeftLampa : apiRightLampa;

    if (visLeftLampa > 0) {
        svg += drawDimH(0, visLeftLampa, dimDoorY, visLeftLampa, sD, "#ffffff", "normal", "18");
    }
    svg += drawDimH(visLeftLampa, visLeftLampa + CO, dimDoorY, CO, sD, "#fbbf24", "bold", "24");
    if (visRightLampa > 0) {
        svg += drawDimH(visLeftLampa + CO, sW, dimDoorY, visRightLampa, sD, "#ffffff", "normal", "18");
    }


    // --- Γ. ΚΑΜΠΙΝΑ ΚΑΙ ΟΔΗΓΟΙ ΠΑΝΩ (Άξονας X) ---
    const dimTopY = -140; 
    const distRailCabin = cX - rX; // Κενό ανάμεσα στη ράγα και την καμπίνα

    if (isRight) {
        // ΔΕΞΙΟ ΣΑΣΙ: Διαβάζουμε το σχέδιο από Αριστερά προς τα Δεξιά: (Τοίχος -> Καμπίνα -> Ράγα -> Τοίχος)
        let currX = 0;
        
        if (dist_x > 0) { // Απόσταση αριστερού τοίχου - καμπίνας
            svg += drawDimH(currX, currX + dist_x, dimTopY, dist_x, 0, "#ffffff", "normal", "18");
            currX += dist_x;
        }
        
        svg += drawDimH(currX, currX + cW, dimTopY, cW, cY, "#fbbf24", "bold", "26"); // Πλάτος Καμπίνας
        currX += cW;
        
        if (distRailCabin > 0) { // Κενό καμπίνας - ράγας
            svg += drawDimH(currX, currX + distRailCabin, dimTopY, distRailCabin, cY, "#ffffff", "normal", "18");
            currX += distRailCabin;
        }
        
        svg += drawDimH(currX, sW, dimTopY, rX, 0, "#ffffff", "normal", "18"); // Ράγα - Δεξιός τοίχος
        svg += `<line x1="${currX}" y1="${rail2TipY}" x2="${currX}" y2="${dimTopY}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;

    } else {
        // ΑΡΙΣΤΕΡΟ ΣΑΣΙ: Διαβάζουμε το σχέδιο από Αριστερά προς τα Δεξιά: (Τοίχος -> Ράγα -> Καμπίνα -> Τοίχος)
        let currX = 0;
        
        svg += drawDimH(0, rX, dimTopY, rX, 0, "#ffffff", "normal", "18"); // Αριστερός Τοίχος - Ράγα
        svg += `<line x1="${rX}" y1="${rail2TipY}" x2="${rX}" y2="${dimTopY}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        currX += rX;
        
        if (distRailCabin > 0) { // Κενό ράγας - καμπίνας
            svg += drawDimH(currX, currX + distRailCabin, dimTopY, distRailCabin, cY, "#ffffff", "normal", "18");
            currX += distRailCabin;
        }
        
        svg += drawDimH(currX, currX + cW, dimTopY, cW, cY, "#fbbf24", "bold", "26"); // Πλάτος Καμπίνας
        currX += cW;
        
        if (dist_x > 0) { // Καμπίνα - Δεξιός τοίχος
            svg += drawDimH(currX, sW, dimTopY, dist_x, 0, "#ffffff", "normal", "18");
        }
    }


    // --- Δ. ΚΑΜΠΙΝΑ (Y-Axis Βάθος & Απόσταση από πάνω) ---
    if (isRight) {
        // Το σασί πήγε δεξιά, άρα βάζουμε το βάθος καμπίνας στην ΑΡΙΣΤΕΡΗ μεριά για να μην πέφτει πάνω στις ράγες
        const dimCabinD_X = -150; 
        svg += drawDimV(dimCabinD_X, cY, cY + cD, cD);
        if (cY > 0) svg += drawDimV(dimCabinD_X, 0, cY, cY, 25); 
    } else {
        // Αριστερό σασί, οι διαστάσεις καμπίνας μένουν ΔΕΞΙΑ
        const dimCabinD_X = sW + 150; 
        svg += drawDimVRight(dimCabinD_X, cY, cY + cD, cD);
        if (cY > 0) svg += drawDimVRight(dimCabinD_X, 0, cY, cY, 25); 
    }

    // ΚΛΕΙΣΙΜΟ SVG
    svg += `</svg>`;
    container.innerHTML = svg;
    
    } else if (chassisPosition === 'rear') {
        // ==============================================================
        // --- 1. ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΠΙΣΩ ΣΑΣΙ (REAR) ---
        // ==============================================================
        const sW = parseFloat(inputs.shaftwidth);
        const sD = parseFloat(inputs.shaftdepth);
        const CO = parseFloat(inputs.anoigma_portas);
        const G = parseFloat(data.G_portas_val) || 0;
        
        const isCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";
        const isLeftOpen = (inputs.kateuthinsi_anoigmatos === "Αριστερά"); 
        
        const isAdjacent = (inputs.cabin_doors === '2_gwniako');
        const side2 = inputs.thesi_second_door; // 'left' ή 'right'
        const dir2 = inputs.dir_second_door; // 'panw' ή 'katw'

        const apiLeftLampa = parseFloat(data.Apostasi_ar_lampa) || 0;
        const apiRightLampa = parseFloat(data.Apostasi_dek_lampa) || (sW - apiLeftLampa - CO);

        let doorStartX = apiLeftLampa;
        if (!isCentral && !isLeftOpen) {
            doorStartX = apiRightLampa;
        }
        
        const y_rear = parseFloat(data.Apostasi_toixou_odhgou_y_rear);
        const rY_axis = y_rear;

        const cW = parseFloat(data.Platos_thalamou);
        const cD = parseFloat(data.Vathos_Thalamou);
        const dist_x_ar = parseFloat(data.Apostasi_thalamou_toixou_ar_rear); 
        
        const cX = dist_x_ar; 
        const dbg = parseFloat(data.Anoigma_odhgwn);
        const dist_cabin_rail = parseFloat(data.Apostasi_thalamou_odhgou_rear);
        const t = 90; 

        let rawModel = (inputs.Odhgoi_Type || "T89/A").toString().trim().toUpperCase();
        const railModels = {
            "T50":      { baseW: 50,  baseThk: 5,  totalH: 50, bladeW: 5 },
            "T75":      { baseW: 75,  baseThk: 10, totalH: 62, bladeW: 10 },
            "T89/A":    { baseW: 89,  baseThk: 16, totalH: 62, bladeW: 16 },
            "T89/B":    { baseW: 89,  baseThk: 16, totalH: 62, bladeW: 16 },
            "T90/A":    { baseW: 90,  baseThk: 16, totalH: 75, bladeW: 16 },
            "T90/B":    { baseW: 90,  baseThk: 16, totalH: 75, bladeW: 16 },
            "T125/A":   { baseW: 125, baseThk: 16, totalH: 82, bladeW: 16 },
            "T125/B":   { baseW: 125, baseThk: 16, totalH: 82, bladeW: 16 },
            "T127-2/B": { baseW: 127, baseThk: 16, totalH: 89, bladeW: 16 }
        };
        let railDim = railModels[rawModel] || railModels["T89/A"];
        const railBaseW = railDim.baseW, railBaseThk = railDim.baseThk, bladeW = railDim.bladeW, h1 = railDim.totalH;

        const cY = rY_axis + dist_cabin_rail; 
        const cabinFrontY = cY + cD; 

        // Ορισμός Y-εκκίνησης για τη 2η πόρτα
        let doorStartY = 0;
        if (isAdjacent) {
            const isSecondDoorCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";
            // Ελέγχουμε αν έχει επιλεγεί Ημιαυτόματη πόρτα (τσεκάρουμε διάφορα πιθανά values για ασφάλεια)
            const isSemiAuto = inputs.tupos_portas === "Ημιαυτόματη" || inputs.tupos_portas === "semi_automatic" || inputs.tuposAnoigmatos === "Ημιαυτόματη";

            // Αν είναι Κεντρική Ή Ημιαυτόματη, κεντράρουμε την πόρτα και την τρύπα!
            if (isSecondDoorCentral || isSemiAuto) {
                // Ανεβάζουμε ΤΗΝ ΠΟΡΤΑ ΚΑΙ ΤΗΝ ΤΡΥΠΑ ΤΟΥ ΤΟΙΧΟΥ κατά 100mm για αποφυγή σύγκρουσης
                doorStartY = cY + (cD / 2) - (CO / 2) - 100;
            } else {
                // Αν είναι Πλαϊνή (Τηλεσκοπική), πάει στις άκρες
                doorStartY = (dir2 === 'panw') ? (cabinFrontY - 5 - CO) : (cY + 5);
            }
        }

        let svg = `<svg viewBox="-250 -250 ${sW + 650} ${sD + 650}" xmlns="http://www.w3.org/2000/svg" style="width:100%; background:#111827; border-radius:12px;">`;

        svg += `
            <defs>
                <pattern id="doorHatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="5" stroke="#475569" stroke-width="1" />
                </pattern>
                <pattern id="concretePattern" patternUnits="userSpaceOnUse" width="120" height="120">
                    <circle cx="10" cy="15" r="0.8" fill="#64748b" />
                    <circle cx="45" cy="10" r="0.5" fill="#64748b" />
                    <circle cx="90" cy="40" r="1" fill="#64748b" />
                    <circle cx="30" cy="80" r="0.7" fill="#64748b" />
                    <path d="M 60 70 L 68 65 L 72 75 L 62 80 Z" fill="none" stroke="#94a3b8" stroke-width="2" /> <circle cx="20" cy="40" r="3" fill="none" stroke="#94a3b8" stroke-width="1.5" /> <path d="M 100 90 L 110 95 L 105 105 Z" fill="#475569" /> <path d="M 40 30 L 50 30 L 45 38 Z" fill="none" stroke="#cbd5e1" stroke-width="1.8" />
                    <path d="M 80 15 L 88 15 L 84 22 Z" fill="none" stroke="#cbd5e1" stroke-width="1.2" />
                </pattern>
                <pattern id="pillarPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="0.8" />
                    <line x1="0" y1="0" x2="8" y2="0" stroke="#475569" stroke-width="0.8" />
                </pattern>
            </defs>
        `;

    // ==============================================================
    // --- 2. ΤΟΙΧΟΙ & ΦΡΕΑΤΙΟ (ΔΙΟΡΘΩΣΗ ΣΗΜΕΙΟΥ ΚΟΠΗΣ) ---
    // ==============================================================
        const pillarHeight = 120; // Το ύψος της κολώνας που χρησιμοποιείς

        let wallPath = ``;

        if (isAdjacent) {
            const rY_axis_temp = parseFloat(data.Apostasi_toixou_odhgou_y_rear) || 0;
            const dist_cabin_rail_temp = parseFloat(data.Apostasi_thalamou_odhgou_rear) || 0;
            const cY_temp = rY_axis_temp + dist_cabin_rail_temp;
            const cD_temp = parseFloat(data.Vathos_Thalamou) || 0;
        
        // Υπολογισμός του Seal (όπως ακριβώς τον έχεις στο Section 4)
            const currentLeaves = parseInt(inputs.arithmos_fyllon) || 2;
            const currentIsCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";
            const currentDoorCode = currentIsCentral ? 'pC' : 'pS';
            const currentDoorKey = currentLeaves + currentDoorCode;
            const currentSealDict = { "2pC": 54, "4pC": 90, "2pS": 90, "3pS": 135 };
            const currentSeal = currentSealDict[currentDoorKey];

    

        // ΤΟ ΔΙΟΡΘΩΜΕΝΟ ΣΗΜΕΙΟ:
        // Προσθέτουμε το currentSeal για να ξέρει ο τοίχος πόσο "βαθιά" είναι η κάσα της 3φυλλης (135mm)
            let cutPointTop = doorStartY - 120; 
            let cutPointBottom = doorStartY + CO + 120;

        // Αν δεις ότι πάλι υπάρχει κενό στην 3φυλλη, δοκίμασε να χρησιμοποιήσεις 
        // το currentSeal στον υπολογισμό αν η κάσα μετακινείται 

            if (side2 === 'left') {
                wallPath = `
                    M 0 ${cutPointTop} L 0 0 L ${sW} 0 L ${sW} ${sD} L ${sW+t} ${sD} L ${sW+t} ${-t} L ${-t} ${-t} L ${-t} ${cutPointTop} L 0 ${cutPointTop} Z
                    M 0 ${cutPointBottom} L ${-t} ${cutPointBottom} L ${-t} ${sD} L 0 ${sD} Z
                `;
            } else {
                wallPath = `
                    M ${sW} ${cutPointTop} L ${sW} 0 L 0 0 L 0 ${sD} L ${-t} ${sD} L ${-t} ${-t} L ${sW+t} ${-t} L ${sW+t} ${cutPointTop} L ${sW} ${cutPointTop} Z
                    M ${sW} ${cutPointBottom} L ${sW+t} ${cutPointBottom} L ${sW+t} ${sD} L ${sW} ${sD} Z
                `;
            }
        } else {
            wallPath = `M ${-t} ${sD} L ${-t} ${-t} L ${sW + t} ${-t} L ${sW + t} ${sD} L ${sW} ${sD} L ${sW} 0 L 0 0 L 0 ${sD} Z`;
        }
    
        svg += `<path d="${wallPath}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" stroke-linejoin="round" />`;
        if (isAdjacent) {
            // Ορίζουμε το πλάτος της πλαϊνής κολώνας
            let sidePillarW = t / 1.5; 
            
            // Αν είναι αριστερά, ξεκινάει από το -sidePillarW για να καταλήξει στο 0
            // Αν είναι δεξιά, ξεκινάει ακριβώς από το sW
            let rectX = (side2 === 'left') ? -sidePillarW : sW; 

            // Κολώνα Πάνω (πριν την πόρτα)
            svg += `<rect x="${rectX}" y="${doorStartY - 120}" width="${sidePillarW}" height="120" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
            
            // Κολώνα Κάτω (μετά την πόρτα)
            svg += `<rect x="${rectX}" y="${doorStartY + CO}" width="${sidePillarW}" height="120" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        }
        // Μπροστινοί τοίχοι και κολώνες 
        const pillarW = 120, pillarH = 60, pillarY = sD, frontWallH = t, frontWallY = sD;
        const leftWallW = doorStartX - pillarW; 
        if (leftWallW > 0) svg += `<rect x="0" y="${frontWallY}" width="${leftWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        
        svg += `<rect x="${doorStartX - pillarW}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        svg += `<rect x="${doorStartX + CO}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        
        const rightWallX = doorStartX + CO + pillarW; 
        const rightWallW = sW - rightWallX; 
        if (rightWallW > 0) svg += `<rect x="${rightWallX}" y="${frontWallY}" width="${rightWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        
        // ==============================================================
        // --- 3. ΖΩΓΡΑΦΙΚΗ ΜΗΧΑΝΙΚΩΝ (REAR) ---
        // ==============================================================
        const x_ar = parseFloat(data.Apostasi_toixou_odhgou_x_ar_rear) || 100;
        const x_dek = parseFloat(data.Apostasi_toixou_odhgou_x_dek_rear) || 100;
        const pahos_rear = parseFloat(data.pahos_sthrigmatos_rear) || 40;
        const bracketLength = 100; 
        const bracketHeight = 230; 

        const rail1BaseX = x_ar + pahos_rear; 
        const rail1TipX = rail1BaseX + h1;    
        const rail2BaseX = sW - x_dek - pahos_rear; 
        const rail2TipX = rail2BaseX - h1;          

        const drawSlot = (cx, cy, w, h) => `<rect x="${cx - w/2}" y="${cy - h/2}" width="${w}" height="${h}" rx="${w/2}" fill="#111827" opacity="0.6" />`;

        // ΑΡΙΣΤΕΡΟ ΣΤΗΡΙΓΜΑ & ΟΔΗΓΟΣ
        svg += `<rect x="${x_ar}" y="0" width="${pahos_rear}" height="${bracketHeight}" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
        const baseArX = x_ar - (bracketLength/2) + (pahos_rear/2);
        svg += `<rect x="${baseArX}" y="0" width="${bracketLength}" height="15" rx="2" fill="#64748b" stroke="#475569" stroke-width="1" />`;
        svg += drawSlot(x_ar + pahos_rear/2, 60, pahos_rear/2.5, 30);
        svg += drawSlot(x_ar + pahos_rear/2, 140, pahos_rear/2.5, 30);
        svg += drawSlot(baseArX + 20, 7.5, 15, 6);
        svg += drawSlot(baseArX + bracketLength - 20, 7.5, 15, 6);
        svg += `<rect x="${rail1BaseX}" y="${rY_axis - (railBaseW/2)}" width="${railBaseThk}" height="${railBaseW}" fill="#eab308" />`;
        svg += `<rect x="${rail1BaseX + railBaseThk}" y="${rY_axis - (bladeW/2)}" width="${h1 - railBaseThk}" height="${bladeW}" fill="#eab308" />`;

        // ΔΕΞΙΟ ΣΤΗΡΙΓΜΑ & ΟΔΗΓΟΣ
        svg += `<rect x="${sW - x_dek - pahos_rear}" y="0" width="${pahos_rear}" height="${bracketHeight}" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
        const baseDekX = sW - x_dek - (pahos_rear/2) - (bracketLength/2);
        svg += `<rect x="${baseDekX}" y="0" width="${bracketLength}" height="15" rx="2" fill="#64748b" stroke="#475569" stroke-width="1" />`;
        const xCenterDek = sW - x_dek - pahos_rear/2;
        svg += drawSlot(xCenterDek, 60, pahos_rear/2.5, 30);
        svg += drawSlot(xCenterDek, 140, pahos_rear/2.5, 30);
        svg += drawSlot(baseDekX + 20, 7.5, 15, 6);
        svg += drawSlot(baseDekX + bracketLength - 20, 7.5, 15, 6);
        svg += `<rect x="${rail2BaseX - railBaseThk}" y="${rY_axis - (railBaseW/2)}" width="${railBaseThk}" height="${railBaseW}" fill="#eab308" />`;
        svg += `<rect x="${rail2BaseX - h1}" y="${rY_axis - (bladeW/2)}" width="${h1 - railBaseThk}" height="${bladeW}" fill="#eab308" />`;

        // Έμβολο & Καμπίνα
        const pistonX = sW / 2;
        const pistonY = rY_axis;
        svg += `<circle cx="${pistonX}" cy="${pistonY}" r="22" fill="#f97316" stroke="#c2410c" stroke-width="2" /><circle cx="${pistonX}" cy="${pistonY}" r="10" fill="#fff7ed" />`;
        svg += `<rect x="${cX}" y="${cY}" width="${cW}" height="${cD}" fill="none" stroke="#0ea5e9" stroke-width="4" />`;
        
        // ==============================================================
        // --- 4Α. ΠΡΩΤΗ (ΜΠΡΟΣΤΙΝΗ) ΠΟΡΤΑ ---
        // ==============================================================
        const doorType = inputs.tupos_portas || 'Αυτόματη';
        const numLeaves = parseInt(inputs.arithmos_fyllon) || 2;
        const doorCode = isCentral ? 'pC' : 'pS';
        const doorKey = numLeaves + doorCode; 
        const sealDict = { "2pC": 54, "4pC": 90, "2pS": 90, "3pS": 135 };
        const seal = sealDict[doorKey] || 90; 
        const numRails = isCentral ? (numLeaves / 2) : numLeaves;
        const railThk = seal / numRails; 
        const endX = doorStartX + CO;

        if (doorType === 'Αυτόματη') {
            const landingDoorY = sD - seal;       
            const cabinDoorY = landingDoorY - 35 - seal; 
            const visualCabinAir = cabinDoorY - cabinFrontY; 

            // Κάσα Μπροστινή
            svg += `<line x1="${doorStartX}" y1="${cabinFrontY}" x2="${doorStartX}" y2="${cabinDoorY}" stroke="#64748b" stroke-width="2" />`;
            svg += `<line x1="${endX}" y1="${cabinFrontY}" x2="${endX}" y2="${cabinDoorY}" stroke="#64748b" stroke-width="2" />`;
            svg += `<rect x="${doorStartX}" y="${cabinFrontY}" width="${CO}" height="${cabinDoorY - cabinFrontY}" fill="#1e293b" opacity="0.4" />`;

            const doorsToDraw = [{ yBase: cabinDoorY }, { yBase: landingDoorY }];

            doorsToDraw.forEach((doorSet, setIndex) => {
                const baseY = doorSet.yBase;
                for (let i = 0; i < numRails; i++) {
                    const railY = baseY + (i * railThk);
                    let railX, railW;

                    if (isCentral) {
                        railX = doorStartX - G; railW = G + CO + G;
                        svg += `<rect x="${railX}" y="${railY}" width="${railW}" height="${railThk}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                        svg += `<line x1="${railX}" y1="${railY + railThk * 0.5}" x2="${railX + railW}" y2="${railY + railThk * 0.5}" stroke="#475569" stroke-width="1.5" />`;
                        const leafW = CO / 2;
                        svg += `<rect x="${doorStartX}" y="${railY + 2}" width="${leafW}" height="${railThk - 4}" fill="url(#doorHatch)" stroke="#677b96" stroke-width="1.5" />`;
                        svg += `<rect x="${doorStartX + leafW}" y="${railY + 2}" width="${leafW}" height="${railThk - 4}" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
                        svg += `<rect x="${doorStartX + (leafW/2) - 15}" y="${railY + (railThk/2) - 2}" width="30" height="4" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                        svg += `<rect x="${doorStartX + leafW + (leafW/2) - 15}" y="${railY + (railThk/2) - 2}" width="30" height="4" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                    } else {
                        let leafIndex;
                        if (isLeftOpen) {
                            railX = doorStartX - G; railW = G + CO;
                            leafIndex = (setIndex === 0) ? i : (numRails - 1 - i);
                        } else {
                            railX = doorStartX; railW = CO + G;
                            leafIndex = (setIndex === 0) ? (numRails - 1 - i) : i; 
                        }
                        svg += `<rect x="${railX}" y="${railY}" width="${railW}" height="${railThk}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                        svg += `<line x1="${railX}" y1="${railY + railThk * 0.5}" x2="${railX + railW}" y2="${railY + railThk * 0.5}" stroke="#475569" stroke-width="1.5" />`;
                        const leafW = CO / numLeaves;
                        const leafX = doorStartX + (leafIndex * leafW);
                        svg += `<rect x="${leafX}" y="${railY + 2}" width="${leafW}" height="${railThk - 4}" fill="url(#doorHatch)" stroke="#5d6d85" stroke-width="1.5" />`;
                        svg += `<rect x="${leafX + (leafW/2) - 15}" y="${railY + (railThk/2) - 2}" width="30" height="4" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                    }
                }
            });

            let dimX_internal, textAnchor, textX;
            if (isCentral) { dimX_internal = doorStartX - G - 25; textAnchor = "end"; textX = dimX_internal - 12; } 
            else {
                if (isLeftOpen) { dimX_internal = doorStartX + CO + 25; textAnchor = "start"; textX = dimX_internal + 16; } 
                else { dimX_internal = doorStartX - 25; textAnchor = "end"; textX = dimX_internal - 12; }
            }

            const drawHorizTick = (y) => `<line x1="${dimX_internal - 5}" y1="${y}" x2="${dimX_internal + 5}" y2="${y}" stroke="white" stroke-width="1.5" />`;
            svg += `<line x1="${dimX_internal}" y1="${cabinFrontY}" x2="${dimX_internal}" y2="${sD}" stroke="white" stroke-width="1" />`;
            svg += drawHorizTick(cabinFrontY) + drawHorizTick(cabinDoorY) + drawHorizTick(cabinDoorY + seal) + drawHorizTick(landingDoorY) + drawHorizTick(sD);       
            
            svg += `<text x="${textX}" y="${cabinFrontY + (visualCabinAir / 2)}" fill="white" font-size="16" dominant-baseline="middle" text-anchor="${textAnchor}">50</text>`;
            svg += `<text x="${textX}" y="${cabinDoorY + (seal / 2)}" fill="#fbbf24" font-size="18" font-weight="bold" dominant-baseline="middle" text-anchor="${textAnchor}">${seal}</text>`;
            svg += `<text x="${textX}" y="${landingDoorY - 17.5}" fill="white" font-size="16" dominant-baseline="middle" text-anchor="${textAnchor}">35</text>`;
            svg += `<text x="${textX}" y="${landingDoorY + (seal / 2)}" fill="#fbbf24" font-size="18" font-weight="bold" dominant-baseline="middle" text-anchor="${textAnchor}">${seal}</text>`;
            
        } else {
            // ΗΜΙΑΥΤΟΜΑΤΗ ΠΟΡΤΑ
            const landingDoorY = sD; 
            svg += `<line x1="${doorStartX}" y1="${cabinFrontY}" x2="${doorStartX}" y2="${sD}" stroke="#64748b" stroke-width="2" />`;
            svg += `<line x1="${doorStartX + CO}" y1="${cabinFrontY}" x2="${doorStartX + CO}" y2="${sD}" stroke="#64748b" stroke-width="2" />`;
            svg += `<rect x="${doorStartX}" y="${cabinFrontY}" width="${CO}" height="${sD - cabinFrontY}" fill="#1e293b" opacity="0.4" />`;

            svg += `<rect x="${doorStartX - G}" y="${landingDoorY}" width="${G + CO + G}" height="40" fill="#334155" stroke="#475569" stroke-width="2" />`;
            svg += `<rect x="${doorStartX}" y="${landingDoorY + 5}" width="${CO}" height="30" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
            svg += `<circle cx="${doorStartX + CO - 20}" cy="${landingDoorY + 20}" r="6" fill="#fbbf24" stroke="#d97706" stroke-width="2" />`;
        }

        // ==============================================================
        // --- 4Β. ΔΕΥΤΕΡΗ ΠΟΡΤΑ (ΓΩΝΙΑΚΗ ΣΧΕΔΙΑΣΜΕΝΗ ΚΑΘΕΤΑ) ---
        // ==============================================================
        if (isAdjacent) {
            const isSecondDoorCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";

            if (doorType === 'Αυτόματη') {
                
                // ======================================================
                // --- HARD SPLIT 1: ΑΥΤΟΜΑΤΗ ΚΕΝΤΡΙΚΟΥ ΑΝΟΙΓΜΑΤΟΣ ---
                // ======================================================
                if (isSecondDoorCentral) {
                    
                    // Κεντράρουμε την πόρτα στο βάθος της καμπίνας (Άξονας Υ) - 100 panw 
                    let centralDoorStartY = cY + (cD / 2) - (CO / 2) - 100;

                    // ΜΑΘΗΜΑΤΙΚΟΣ ΥΠΟΛΟΓΙΣΜΟΣ ΠΑΧΟΥΣ ΣΤΟΝ ΑΞΟΝΑ Χ (Όπως στην 1η πόρτα)
                    let landingDoorX, cabinDoorX, cabinFrontX, visualCabinAir;

                    if (side2 === 'left') {
                        landingDoorX = 0; // Κάσα ορόφου κολλάει στον αριστερό τοίχο
                        cabinDoorX = landingDoorX + seal + 35; // Κάσα καμπίνας 35mm πιο μέσα
                        cabinFrontX = cX;
                        visualCabinAir = cabinFrontX - (cabinDoorX + seal);
                    } else {
                        landingDoorX = sW - seal; // Κάσα ορόφου κολλάει στον δεξιό τοίχο
                        cabinDoorX = landingDoorX - 35 - seal; // Κάσα καμπίνας 35mm πιο μέσα
                        cabinFrontX = cX + cW;
                        visualCabinAir = cabinDoorX - cabinFrontX;
                    }

                    // Ζωγραφίζουμε τις Κάσες (Καμπίνας & Ορόφου) με το πραγματικό seal
                    svg += `<rect x="${cabinDoorX}" y="${centralDoorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;
                    svg += `<rect x="${landingDoorX}" y="${centralDoorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;

                    const sideDoorsToDraw = [
                        { xBase: cabinDoorX, isCabin: true },
                        { xBase: landingDoorX, isCabin: false }
                    ];

                    sideDoorsToDraw.forEach((doorSet) => {
                        const baseX = doorSet.xBase;
                        
                        for (let i = 0; i < numRails; i++) {
                            
                            // Η ράγα ξεκινάει πάντα από το baseX και "γεμίζει" το seal 
                            let railX = baseX + (i * railThk);

                            // Επειδή είναι Κεντρική, προεξέχει κατά G πάνω και κάτω
                            let rY = centralDoorStartY - G; 
                            let rH = G + CO + G;

                            // Ζωγραφική Ράγας
                            svg += `<rect x="${railX}" y="${rY}" width="${railThk}" height="${rH}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                            svg += `<line x1="${railX + railThk * 0.5}" y1="${rY}" x2="${railX + railThk * 0.5}" y2="${rY + rH}" stroke="#475569" stroke-width="1.5" />`;
                            
                            // Ζωγραφική 2 Φύλλων (Πάχος = railThk - 4, όπως στην 1η πόρτα)
                            const leafW = railThk - 4; 
                            const leafH = CO / 2;

                            // Πάνω φύλλο
                            svg += `<rect x="${railX + 2}" y="${centralDoorStartY}" width="${leafW}" height="${leafH}" fill="url(#doorHatch)" stroke="#677b96" stroke-width="1.5" />`;
                            svg += `<rect x="${railX + (railThk/2) - 2}" y="${centralDoorStartY + (leafH/2) - 15}" width="4" height="30" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;

                            // Κάτω φύλλο
                            svg += `<rect x="${railX + 2}" y="${centralDoorStartY + CO - leafH}" width="${leafW}" height="${leafH}" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
                            svg += `<rect x="${railX + (railThk/2) - 2}" y="${centralDoorStartY + CO - leafH + (leafH/2) - 15}" width="4" height="30" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                        }
                    });

                    // Σκιές & Γραμμές Τοίχου-Καμπίνας
                    let wallLineX = (side2 === 'left') ? 0 : sW;
                    svg += `<line x1="${wallLineX}" y1="${centralDoorStartY}" x2="${cabinFrontX}" y2="${centralDoorStartY}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<line x1="${wallLineX}" y1="${centralDoorStartY + CO}" x2="${cabinFrontX}" y2="${centralDoorStartY + CO}" stroke="#64748b" stroke-width="2" />`;
                    
                    let shadowX = Math.min(wallLineX, cabinFrontX);
                    let shadowW = Math.abs(cabinFrontX - wallLineX);
                    svg += `<rect x="${shadowX}" y="${centralDoorStartY}" width="${shadowW}" height="${CO}" fill="#1e293b" opacity="0.3" />`;

                    // ==============================================================
                    // Οπτικά Κείμενα Επαλήθευσης (Ακριβώς όπως στην πρώτη πόρτα)
                    // ==============================================================
                    let textY = centralDoorStartY - 15;
                    
                    if (side2 === 'left') {
                        svg += `<text x="${landingDoorX + seal/2}" y="${textY}" fill="#fbbf24" font-size="16" font-weight="bold" dominant-baseline="middle" text-anchor="middle">${seal}</text>`;
                        svg += `<text x="${landingDoorX + seal + 17.5}" y="${textY}" fill="white" font-size="14" dominant-baseline="middle" text-anchor="middle">35</text>`;
                        svg += `<text x="${cabinDoorX + seal/2}" y="${textY}" fill="#fbbf24" font-size="16" font-weight="bold" dominant-baseline="middle" text-anchor="middle">${seal}</text>`;
                        svg += `<text x="${cabinDoorX + seal + visualCabinAir/2}" y="${textY}" fill="white" font-size="14" dominant-baseline="middle" text-anchor="middle">${Math.round(visualCabinAir)}</text>`;
                    } else {
                        svg += `<text x="${landingDoorX + seal/2}" y="${textY}" fill="#fbbf24" font-size="16" font-weight="bold" dominant-baseline="middle" text-anchor="middle">${seal}</text>`;
                        svg += `<text x="${cabinDoorX + seal + 17.5}" y="${textY}" fill="white" font-size="14" dominant-baseline="middle" text-anchor="middle">35</text>`;
                        svg += `<text x="${cabinDoorX + seal/2}" y="${textY}" fill="#fbbf24" font-size="16" font-weight="bold" dominant-baseline="middle" text-anchor="middle">${seal}</text>`;
                        svg += `<text x="${cabinFrontX + visualCabinAir/2}" y="${textY}" fill="white" font-size="14" dominant-baseline="middle" text-anchor="middle">${Math.round(visualCabinAir)}</text>`;
                    }
                } 
                // ======================================================
                // --- HARD SPLIT 2: ΑΥΤΟΜΑΤΗ ΠΛΑΪΝΟΥ ΑΝΟΙΓΜΑΤΟΣ ---
                // ======================================================
                else {
                    const lDoorX_min = (side2 === 'left') ? 0 : (sW - seal);
                    const cDoorX_min = (side2 === 'left') ? (cX - 50 - seal) : (cX + cW + 50);

                    // Κάσα Καμπίνας (Γκρι Φόντο)
                    svg += `<line x1="${cDoorX_min}" y1="${doorStartY}" x2="${cDoorX_min + seal}" y2="${doorStartY}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<line x1="${cDoorX_min}" y1="${doorStartY + CO}" x2="${cDoorX_min + seal}" y2="${doorStartY + CO}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<rect x="${cDoorX_min}" y="${doorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;
                    
                    // Κάσα Ορόφου (Γκρι Φόντο)
                    svg += `<line x1="${lDoorX_min}" y1="${doorStartY}" x2="${lDoorX_min + seal}" y2="${doorStartY}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<line x1="${lDoorX_min}" y1="${doorStartY + CO}" x2="${lDoorX_min + seal}" y2="${doorStartY + CO}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<rect x="${lDoorX_min}" y="${doorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;

                    const sideDoorsToDraw = [
                        { xBase: cDoorX_min, isCabin: true },
                        { xBase: lDoorX_min, isCabin: false }
                    ];

                    sideDoorsToDraw.forEach((doorSet, setIndex) => {
                        const baseX = doorSet.xBase;
                        for (let i = 0; i < numRails; i++) {
                            // Βρίσκουμε το X της κάθε ράγας
                            let railX = (side2 === 'left') ? (baseX + seal - railThk - (i * railThk)) : (baseX + (i * railThk));

                            // Μήκος ράγας ανάλογα με τον τύπο ανοίγματος (Τηλεσκοπική)
                            let rY = doorStartY;
                            let rH = CO;
                            if (dir2 === 'panw') { rY = doorStartY - G; rH = G + CO; }
                            else if (dir2 === 'katw') { rY = doorStartY; rH = CO + G; }

                            // Ζωγραφική Ράγας
                            svg += `<rect x="${railX}" y="${rY}" width="${railThk}" height="${rH}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                            svg += `<line x1="${railX + railThk * 0.5}" y1="${rY}" x2="${railX + railThk * 0.5}" y2="${rY + rH}" stroke="#475569" stroke-width="1.5" />`;

                            // Ζωγραφική Φύλλων
                            const leafH = CO / numLeaves;
                            let leafIndex = (setIndex === 0) ? i : (numRails - 1 - i); 
                            let leafY = (dir2 === 'panw') ? (doorStartY + (leafIndex * leafH)) : (doorStartY + CO - leafH - (leafIndex * leafH));
                            
                            svg += `<rect x="${railX + 2}" y="${leafY}" width="${railThk - 4}" height="${leafH}" fill="url(#doorHatch)" stroke="#5d6d85" stroke-width="1.5" />`;
                            let handleY = (dir2 === 'panw') ? (leafY + leafH - 30) : leafY;
                            svg += `<rect x="${railX + railThk/2 - 2}" y="${handleY}" width="4" height="30" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                        }
                    });
                }
            } 
            // ======================================================
            // --- SPLIT 3: ΗΜΙΑΥΤΟΜΑΤΗ ΠΟΡΤΑ ---
            // ====================================================
            else {
                let cFrontX = (side2 === 'left') ? cX : cX + cW;
                let wallX = (side2 === 'left') ? 0 : sW;
                let rectX = Math.min(wallX, cFrontX);
                let rectW = Math.abs(cFrontX - wallX);
                
                svg += `<line x1="${wallX}" y1="${doorStartY}" x2="${cFrontX}" y2="${doorStartY}" stroke="#64748b" stroke-width="2" />`;
                svg += `<line x1="${wallX}" y1="${doorStartY + CO}" x2="${cFrontX}" y2="${doorStartY + CO}" stroke="#64748b" stroke-width="2" />`;
                svg += `<rect x="${rectX}" y="${doorStartY}" width="${rectW}" height="${CO}" fill="#1e293b" opacity="0.4" />`;
                
                let hX = (side2 === 'left') ? -40 : sW;
                svg += `<rect x="${hX}" y="${doorStartY - G}" width="40" height="${G + CO + G}" fill="#334155" stroke="#475569" stroke-width="2" />`;
                
                let hatchX = (side2 === 'left') ? -30 : sW + 5;
                svg += `<rect x="${hatchX}" y="${doorStartY}" width="30" height="${CO}" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
                
                let handleX = (side2 === 'left') ? -15 : sW + 15;
                let handleY = (dir2 === 'panw') ? (doorStartY + CO - 20) : (doorStartY + 20);
                svg += `<circle cx="${handleX}" cy="${handleY}" r="6" fill="#fbbf24" stroke="#d97706" stroke-width="2" />`;
            }
            
            // ======================================================
            // Κοινό Γραφικό Κομμάτι (Γραμμές Καμπίνας & Σκιά)
            // ======================================================
            let wallLineX = (side2 === 'left') ? 0 : sW;
            let cabinLineX = (side2 === 'left') ? cX : cX + cW;

            svg += `<line x1="${wallLineX}" y1="${doorStartY}" x2="${cabinLineX}" y2="${doorStartY}" stroke="#64748b" stroke-width="2" />`;
            svg += `<line x1="${wallLineX}" y1="${doorStartY + CO}" x2="${cabinLineX}" y2="${doorStartY + CO}" stroke="#64748b" stroke-width="2" />`;

            let shadowX = Math.min(wallLineX, cabinLineX);
            let shadowW = Math.abs(cabinLineX - wallLineX);
            svg += `<rect x="${shadowX}" y="${doorStartY}" width="${shadowW}" height="${CO}" fill="#1e293b" opacity="0.3" />`;
        }

        // ==============================================================
        // --- 5. ΕΞΩΤΕΡΙΚΕΣ ΔΙΑΣΤΑΣΕΙΣ (REAR) ---
        // ==============================================================
        
        const drawDimV = (x, y1, y2, value, labelOffset = -25) => {
            let dimSvg = `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#ffffff" stroke-width="2" />`;
            dimSvg += `<line x1="${x}" y1="${y1}" x2="${x + 130}" y2="${y1}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
            dimSvg += `<line x1="${x}" y1="${y2}" x2="${x + 130}" y2="${y2}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
            dimSvg += `<line x1="${x - 8}" y1="${y1 + 8}" x2="${x + 8}" y2="${y1 - 8}" stroke="#ffffff" stroke-width="2.5" />`;
            dimSvg += `<line x1="${x - 8}" y1="${y2 + 8}" x2="${x + 8}" y2="${y2 - 8}" stroke="#ffffff" stroke-width="2.5" />`;
            const midY = (y1 + y2) / 2;
            dimSvg += `<text x="${x + labelOffset}" y="${midY}" fill="#ffffff" font-size="22" font-family="Arial" font-weight="bold" text-anchor="middle" transform="rotate(-90, ${x + labelOffset}, ${midY})">${Math.round(value)}</text>`;
            return dimSvg;
        };

        const drawDimH = (x1, x2, y, value, wallY, labelColor = "#ffffff", fontWeight = "normal", fontSize = "20") => {
            let dimSvg = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#ffffff" stroke-width="2" />`;
            dimSvg += `<line x1="${x1}" y1="${wallY}" x2="${x1}" y2="${y}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
            dimSvg += `<line x1="${x2}" y1="${wallY}" x2="${x2}" y2="${y}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
            dimSvg += `<line x1="${x1 - 8}" y1="${y + 8}" x2="${x1 + 8}" y2="${y - 8}" stroke="#ffffff" stroke-width="2.5" />`;
            dimSvg += `<line x1="${x2 - 8}" y1="${y + 8}" x2="${x2 + 8}" y2="${y - 8}" stroke="#ffffff" stroke-width="2.5" />`;
            const midX = (x1 + x2) / 2;
            dimSvg += `<text x="${midX}" y="${y - 15}" fill="${labelColor}" font-size="${fontSize}" font-family="Arial" font-weight="${fontWeight}" text-anchor="middle">${Math.round(value)}</text>`;
            return dimSvg;
        };
        
        // --- Κάθετες Αριστερά (Άξονας Υ) ---
        const dimLeftX = -130;
        svg += drawDimV(dimLeftX, 0, rY_axis, rY_axis); 
        svg += drawDimV(dimLeftX, rY_axis, cY, dist_cabin_rail); 
        svg += drawDimV(dimLeftX, cY, cY + cD, cD); 

        //  Οριζόντιες Πάνω (Άξονας Χ) 
        const dimTopY = -140;
        svg += drawDimH(0, rail1TipX, dimTopY, rail1TipX, 0, "#ffffff", "normal", "18");
        svg += drawDimH(rail1TipX, rail2TipX, dimTopY, dbg, 0, "#fbbf24", "bold", "24");
        const rightRailToWall = sW - rail2TipX;
        svg += drawDimH(rail2TipX, sW, dimTopY, rightRailToWall, 0, "#ffffff", "normal", "18");

        // --- Οριζόντιες Κάτω (Αλυσίδα Πόρτας & Λαμπάδων) ---
        const dimDoorY = sD + 150;
        const leftLampa = doorStartX;
        const rightLampa = sW - (doorStartX + CO);

        if (leftLampa > 0) {
            svg += drawDimH(0, leftLampa, dimDoorY, leftLampa, sD, "#ffffff", "normal", "18");
        }
        
        svg += drawDimH(leftLampa, leftLampa + CO, dimDoorY, CO, sD, "#fbbf24", "bold", "24");
        
        if (rightLampa > 0) {
            svg += drawDimH(leftLampa + CO, sW, dimDoorY, rightLampa, sD, "#ffffff", "normal", "18");
        }

        // Κλείσιμο SVG
        svg += `</svg>`;
        container.innerHTML = svg;
    }
}
// ==========================================
// 3. ΕΜΦΑΝΙΣΗ ΑΠΟΤΕΛΕΣΜΑΤΩΝ (TABLE/DIV)
// ==========================================

function displayResults(data) {
    const resDiv = document.getElementById('resultsTable');
    
    // === ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΜΟΡΦΟΠΟΙΗΣΗΣ ===
    // Στρογγυλοποίηση στην ΚΑΤΩ ΔΕΚΑΔΑ (χωρίς δεκαδικά)
    const fmt = (val) => {
        const n = parseFloat(val);
        if (isNaN(n)) return val;

        // Παράδειγμα: Έστω n = 1258.9
        // n / 10       -> 125.89
        // Math.floor() -> 125
        // * 10         -> 1250
        return Math.floor(n / 10) * 10; 
    };

    // Προσοχή: Το εμβαδόν (m2) συνήθως το θέλουμε με 2 δεκαδικά, 
    // οπότε φτιάχνουμε μια ξεχωριστή για αυτό, αν θες.
    const fmtArea = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? val : n.toFixed(2);
    };

    let bracket = "";

    if(data.thesi_sassi === "rear"){
        bracket = data.Bracket_Deksia_Side;
    } else{
        bracket = data.Bracket_Door_Side;
    }

    

    
    resDiv.innerHTML = `
        <div style="background: #ffffff; padding: 25px; border-radius: 12px; border: 2px solid #22c55e; margin-top: 20px; font-family: 'Inter', sans-serif; color: #1a1a1a;">
            <h3 style="color: #166534; margin-top: 0; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
                ✅ Τεχνικά Χαρακτηριστικά
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <p style="margin: 0;"><strong>Πλάτος Θαλάμου:</strong> <span style="color: #0284c7;">${fmt(data.Platos_thalamou)} mm</span></p>
                <p style="margin: 0;"><strong>Βάθος Θαλάμου:</strong> <span style="color: #0284c7;">${fmt(data.Vathos_Thalamou)} mm</span></p>
                
                <p style="margin: 0;"><strong>Σασί:</strong> ${data.Sassi_Model}</p>
                <p style="margin: 0;"><strong>Οδηγοί:</strong> ${data.Odhgoi_Type}</p>
                
                <p style="margin: 0;"><strong>Εμβαδόν:</strong> ${fmtArea(data.cabin_area)} m²</p>
                
                <p style="margin: 0;"><strong>Στήριγμα:</strong> ${bracket}</p>

                <div style="grid-column: span 2; font-size: 0.8em; color: #666; margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;">
                    <small>Raw Values: W=${data.Platos_thalamou}, D=${data.Vathos_Thalamou}</small>
                </div>
            </div>
        </div>
    `;
}







// ====================================================================================
// ==================================PLAGIA OPSI (SIDE)================================
// ====================================================================================




function drawplagiaopsi(inputs, data_horiz, data_vert) {

    const vathos_puthmena = parseFloat(inputs.vathos_puthmena);
    const vathos_thalamou = parseFloat(data_horiz.Vathos_Thalamou);
    const ipsos_tel_orofou = parseFloat(inputs.ipsos_tel_orofou);
    const diadromi_anelkistira = parseFloat(inputs.diadromi_anelkistira);
    const ekswteriko_ipsos_thalamou = parseFloat(data_vert.Ekswteriko_Ipsos_Thalamou);
    const vathos_freatiou = parseFloat(inputs.shaftdepth);
    

    const totalHeight = ipsos_tel_orofou + diadromi_anelkistira + vathos_puthmena;
    

    

    // 1. Βρίσκουμε το κείμενο (placeholder) και το κρύβουμε
    const placeholder = document.getElementById('side-view-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // 2. Βρίσκουμε το SVG (το γυαλί) και το εμφανίζουμε
    const svgElement = document.getElementById('elevator-svg-side');
    svgElement.style.display = 'block'; 
    
    const padding = 300; // einai o aeras pou theloume gyrw apo to sxedio
    // Αυτή η γραμμή λέει στο SVG: "Μην κεντράρεις το περιεχόμενο, 
    // βάλε το τέρμα αριστερά (xMin) και τέρμα πάνω (yMin)"
    svgElement.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    


    svgElement.setAttribute('viewBox', `${-padding} ${-padding} ${vathos_freatiou + (2*padding)} ${totalHeight + (2*padding)}`);
    
    const y_top_floor = ipsos_tel_orofou;
    const y_bottom_floor = ipsos_tel_orofou + diadromi_anelkistira;

    const cabinXstart = 300;
    const cabinOrofi = y_bottom_floor - ekswteriko_ipsos_thalamou;
    const dapedo = parseFloat(data_vert.dapedo);
    const aeras = parseFloat(data_vert.aeras);
    const provolos = parseFloat(data_vert.provolos);
    const staseis = parseFloat(inputs.staseis);
    const ipsos_orofou = diadromi_anelkistira / (staseis - 1);
    
    
    // tha orisw ta kena orofwn xwris ton teleutaio orofo, ara exw staseis - 1 diaforetika y gia kathe orofo, kai tha ta xwriso isotima ston diadromi_anelkistira
   
    const floorsGap = diadromi_anelkistira / (staseis - 1);
   
    // <rect x="${vathos_freatiou-200}" y="0" width="200" height="100" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>

    if (staseis > 2) {
    svgElement.innerHTML = `
        <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#ffffffcb" stroke-width="4" />
            </pattern>
        </defs>

        <rect x="0" y="0" width="200" height="${totalHeight}" fill="url(#hatch)" stroke="#edeff1" stroke-width="2" />

        <rect x="0" y="0" width="${vathos_freatiou}" height="${200}" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" />

        <rect x="${vathos_freatiou-200}" y="200" width="200" height="100" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" />
    
        <rect x="0" y="${totalHeight}" width="${vathos_freatiou}" height="200" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" />
        
        <rect x="0" y="${totalHeight}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5" />
         
        <rect x="0" y="0" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>

        <rect x="${vathos_freatiou-200}" y="${totalHeight}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>
 
        

        <rect x="${vathos_freatiou-200}" y="300" width="100" height="${ekswteriko_ipsos_thalamou}"  fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/>

        <rect x="${vathos_freatiou-200}" y="${300 + ekswteriko_ipsos_thalamou}" width="900" height="150" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>

        <rect x="${vathos_freatiou-200}" y="${300 + ekswteriko_ipsos_thalamou + 150}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>




        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena}" width="200" height="${vathos_puthmena}" fill="#b6b46444" stroke="#ffffff" stroke-width="5"/>
        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena}" width="200" height="${vathos_puthmena}" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2"/>
    
        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena - 150}" width="900" height="150" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
    
        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena - 150 - ekswteriko_ipsos_thalamou}" width="100" height="${ekswteriko_ipsos_thalamou}" rx="20" ry="20" fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/>

        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena - ipsos_orofou}" width="200" height="${ipsos_orofou - ekswteriko_ipsos_thalamou - 150}" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
    `;


    const drawFloorspackage = (ipsos_orofou, orofos) => {
        
        

        return `

            <rect x="${vathos_freatiou-200}" y="${totalHeight-vathos_puthmena - orofos*ipsos_orofou}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>
           
            <rect x="${vathos_freatiou-200}" y="${totalHeight-150-vathos_puthmena - orofos*ipsos_orofou}" width="900" height="150" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
           
            <rect x="${vathos_freatiou-200}" y="${totalHeight-150-vathos_puthmena - ekswteriko_ipsos_thalamou - orofos*ipsos_orofou}" width="100" height="${ekswteriko_ipsos_thalamou}" rx="20" ry="20" fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/>

            <rect x="${vathos_freatiou-200}" y="${totalHeight-vathos_puthmena - ipsos_orofou - orofos*ipsos_orofou}" width="200" height="${ipsos_orofou-ekswteriko_ipsos_thalamou}" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>

        `;

    }

    
    let floorsHTML = "";


    for (let i = 1; i < staseis - 1; i++) {
        floorsHTML += drawFloorspackage(diadromi_anelkistira / (staseis-1), i);
    }


    svgElement.innerHTML += `
        <g id="all-floors">
            ${floorsHTML}
        </g>
    `;
    }

    if (staseis == 2){
        svgElement.innerHTML = `
        <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#ffffffcb" stroke-width="4" />
            </pattern>
        </defs>

        <rect x="0" y="0" width="200" height="${totalHeight}" fill="url(#hatch)" stroke="#edeff1" stroke-width="2" />

        <rect x="0" y="0" width="${vathos_freatiou}" height="${200}" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" />

        <rect x="${vathos_freatiou-200}" y="200" width="200" height="100" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" />
    
        <rect x="0" y="${totalHeight}" width="${vathos_freatiou}" height="200" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" />
        
        <rect x="0" y="${totalHeight}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5" />
         
        <rect x="0" y="0" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>

        <rect x="${vathos_freatiou-200}" y="${totalHeight}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>
 
        

        <rect x="${vathos_freatiou-200}" y="300" width="100" height="${ekswteriko_ipsos_thalamou}"  fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/>

        <rect x="${vathos_freatiou-200}" y="${300 + ekswteriko_ipsos_thalamou}" width="900" height="150" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>

        <rect x="${vathos_freatiou-200}" y="${300 + ekswteriko_ipsos_thalamou + 150}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>




        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena}" width="200" height="${vathos_puthmena}" fill="#b6b46444" stroke="#ffffff" stroke-width="5"/>
        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena}" width="200" height="${vathos_puthmena}" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2"/>
    
        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena - 150}" width="900" height="150" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
    
        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena - 150 - ekswteriko_ipsos_thalamou}" width="100" height="${ekswteriko_ipsos_thalamou}" rx="20" ry="20" fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/>

        <rect x="${vathos_freatiou-200}" y="${totalHeight - vathos_puthmena - ipsos_orofou + 250}" width="200" height="${ipsos_orofou - ekswteriko_ipsos_thalamou - 400}" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
    `;

    }







}

    
