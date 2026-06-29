function updateDoorLogic() {
    const doorType = document.getElementById('doortype').value;
    const doorLeaves = document.getElementById('doorLeaves');
    const openingType = document.getElementById('tuposAnoigmatos');
    const openingDirection = document.getElementById('kateuthinsiAnoigmatos');
    const chassisPosition = document.getElementById('thesi_sassi').value; 
    const cabinDoorsSelect = document.getElementById('cabinDoors');
    const secondContainer = document.getElementById('secondDoorPosContainer');
    const dirSecondDoor = document.getElementById('secondDoorDir');

    const currentCabinDoorsVal = cabinDoorsSelect.value;

    if (chassisPosition === 'rear') {
        if (!cabinDoorsSelect.innerHTML.includes('2_gwniako')) {
            cabinDoorsSelect.innerHTML = `
                <option value="1">1 Πόρτα</option>
                <option value="2_gwniako">2 Πόρτες (γωνιακό)</option>
            `;
            if (currentCabinDoorsVal === '2_gwniako') cabinDoorsSelect.value = '2_gwniako';
            else cabinDoorsSelect.value = '1';
        }
    } else {
        if (!cabinDoorsSelect.innerHTML.includes('2_opposite')) {
            cabinDoorsSelect.innerHTML = `
                <option value="1">1 Πόρτα</option>
                <option value="2_opposite">2 Πόρτες (διαμπερές)</option>
            `;
            if (currentCabinDoorsVal === '2_opposite') cabinDoorsSelect.value = '2_opposite';
            else cabinDoorsSelect.value = '1';
        }
    }

    if (cabinDoorsSelect.value === '2_gwniako') {
        secondContainer.style.display = 'block';
    } else {
        secondContainer.style.display = 'none';
    }

    if (doorType === 'semi_automatic') {
        doorLeaves.innerHTML = '<option value="1">1 Φύλλο</option>';
        doorLeaves.value = "1";
        doorLeaves.disabled = true;

        openingType.innerHTML = '<option value="Ημιαυτόματη">Ημιαυτόματη</option>';
        openingType.value = "Ημιαυτόματη";
        openingType.style.pointerEvents = "none";
    } 
    else {
        doorLeaves.disabled = false;
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
            openingType.style.pointerEvents = "auto";
            const prevVal = openingType.value; 
            
            openingType.innerHTML = `
                <option value="Κεντρικό">Κεντρικό</option>
                <option value="Πλαϊνό">Πλαϊνό</option>
            `;
            
            if (prevVal === "Πλαϊνό" || prevVal === "Κεντρικό") {
                openingType.value = prevVal;
            } else {
                openingType.value = (chassisPosition === 'rear') ? "Κεντρικό" : "Πλαϊνό";
            }
        }
    }
    
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

    if (dirSecondDoor) { 
        if (cabinDoorsSelect.value === '2_gwniako' && (openingType.value === "Κεντρικό" || openingType.value === "Ημιαυτόματη")) {
            dirSecondDoor.disabled = true;
            dirSecondDoor.innerHTML = '<option value="Default">Default</option>';
            dirSecondDoor.style.opacity = '0.5';
        } else {
            dirSecondDoor.disabled = false;
            dirSecondDoor.style.opacity = '1';
            if (!dirSecondDoor.innerHTML.includes('panw')) {
                dirSecondDoor.innerHTML = `
                    <option value="panw">Πάνω</option>
                    <option value="katw">Κάτω</option>
                `;
            }
        }
    }
    
    populateDoorOpenings();
}

function populateDoorOpenings() {
    const doorType = document.getElementById('doortype').value;
    const leaves = document.getElementById('doorLeaves').value;
    const openingType = document.getElementById('tuposAnoigmatos').value;
    const openingSelect = document.getElementById('doorOpening');
    
    openingSelect.innerHTML = ''; 
    let options = []; 

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
    
    const cabinDoorsSelect = document.getElementById('cabinDoors');
    const currentCabinDoorsVal = cabinDoorsSelect.value;
    const optionExists = Array.from(cabinDoorsSelect.options).some(opt => opt.value === currentCabinDoorsVal);
    if (optionExists) {
        cabinDoorsSelect.value = currentCabinDoorsVal;
    } else {
        cabinDoorsSelect.value = "1";
    }

    const secondDoorPosContainer = document.getElementById('secondDoorPosContainer');
    if (cabinDoorsSelect.value === '2_gwniako') {
        secondDoorPosContainer.style.display = 'block'; 
    } else {
        secondDoorPosContainer.style.display = 'none';  
    }
}

document.getElementById('doortype').addEventListener('change', updateDoorLogic); 
document.getElementById('doorLeaves').addEventListener('change', updateDoorLogic);
document.getElementById('tuposAnoigmatos').addEventListener('change', updateDoorLogic);
document.getElementById('thesi_sassi').addEventListener('change', updateDoorLogic);
document.getElementById('cabinDoors').addEventListener('change', updateDoorLogic);
document.getElementById('secondDoorDir').addEventListener('change', updateDoorLogic);

window.addEventListener('load', updateDoorLogic);

async function solveElevator() {
    const container = document.getElementById('elevator-plan-container'); 
    const resultsTable = document.getElementById('resultsTable'); 
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

    const data = {
        shaftwidth: parseFloat(document.getElementById('shaftWidth').value) || 0,
        shaftdepth: parseFloat(document.getElementById('shaftDepth').value) || 0,
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
        ekswteriko_ipsos_thalamou: parseFloat(document.getElementById('ekswteriko_ipsos_thalamou').value),
        diadromi_anelkistira: parseFloat(document.getElementById('diadromi_anelkistira').value),
        staseis: parseInt(document.getElementById('staseis').value)
    };

    data.real_chassis = actualChassis;

    if (container) {
        container.innerHTML = `<div class="loader"></div><p>Αναζήτηση βέλτιστης λύσης Z3...</p>`; 
    }

    try {
        const response = await fetch('https://elevatordesignapi.minos1972.com/solve', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json(); 

        if (result.status === "success") {
            const best_horiz = result.data ? result.data.best_solution : result.best_solution;
            const best_vert = result.data ? result.data.plagia_opsi : result.plagia_opsi;
            
            if (best_horiz) {
                // ΝΕΟ: Αποθηκεύουμε τα δεδομένα της λύσης σε global μεταβλητές 
                // και ΜΗΔΕΝΙΖΟΥΜΕ τα στηρίγματα (γιατί είναι νέα λύση)
                window.currentElevatorInputs = data;
                window.currentElevatorHoriz = best_horiz;
                window.currentElevatorVert = best_vert;
                window.bracketOffsets = {}; 
                
                displayResults(best_horiz);
                drawElevatorSVG(data, best_horiz); 
                drawplagiaopsi(data, best_horiz, best_vert);
            } else {
                if (container) container.innerHTML = `<p style="color: orange;">⚠️ Τα δεδομένα της λύσης είναι κενά.</p>`;
            }
        } 
        else {
            if (container) {
                container.innerHTML = `<p style="color: red;">❌ Δεν βρέθηκε λύση: ${result.message || 'Άγνωστο σφάλμα'}</p>`;
            }
        }
    } catch (error) {
        if (container) {
            container.innerHTML = `<p style="color: red;">❌ Σφάλμα συστήματος: ${error.message}</p>`;
        }
        console.error('Error Details:', error);
    }
}

function drawElevatorSVG(inputs, data) {
    const container = document.getElementById('elevator-plan-container');
    if (!container) return;
    
    // Αρχικοποίηση μνήμης στηριγμάτων αν δεν υπάρχει
    window.bracketOffsets = window.bracketOffsets || {};
   
    const chassisPosition = inputs.thesi_sassi; 
    let svg = '';

    if (chassisPosition === 'left' || chassisPosition === 'side') { 
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
        
        const t = 90; 

        svg = `<svg viewBox="-250 -250 ${sW + 650} ${sD + 650}" xmlns="http://www.w3.org/2000/svg" style="width:100%; background:#111827; border-radius:12px;">`;

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
            globalMirror = `transform="translate(${sW}, 0) scale(-1, 1)"`;
        }

        svg += `<g ${globalMirror}>`;

        const isThroughCar = (inputs.cabin_doors === '2_opposite');
        let wallPath = ``;
        if (isThroughCar) {
            wallPath = `
                M ${-t} ${sD} L ${-t} 0 L 0 0 L 0 ${sD} Z
                M ${sW} ${sD} L ${sW} 0 L ${sW + t} 0 L ${sW + t} ${sD} Z
            `;
        } else {
            wallPath = `
                M ${-t} ${sD} L ${-t} ${-t} L ${sW + t} ${-t} L ${sW + t} ${sD} L ${sW} ${sD} L ${sW} 0 L 0 0 L 0 ${sD} Z
            `;
        }
        svg += `<path d="${wallPath}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" stroke-linejoin="round" />`;
        
        const pillarW = 120, pillarH = 60, pillarY = sD, frontWallH = t, frontWallY = sD;
        const leftWallW = doorStartX - pillarW;
        if (leftWallW > 0) svg += `<rect x="0" y="${frontWallY}" width="${leftWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        svg += `<rect x="${doorStartX - pillarW}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        svg += `<rect x="${doorStartX + CO}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        
        const rightWallX = doorStartX + CO + pillarW;
        const rightWallW = sW - rightWallX;
        if (rightWallW > 0) svg += `<rect x="${rightWallX}" y="${frontWallY}" width="${rightWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;

        if (isThroughCar) {
            const backWallY = -t, backPillarY = -pillarH; 
            if (leftWallW > 0) svg += `<rect x="0" y="${backWallY}" width="${leftWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
            svg += `<rect x="${doorStartX - pillarW}" y="${backPillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
            svg += `<rect x="${doorStartX + CO}" y="${backPillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
            if (rightWallW > 0) svg += `<rect x="${rightWallX}" y="${backWallY}" width="${rightWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        }

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

        function drawOneDoor(isFront) {
            let localSvg = "";
            let cFrontY, doorWallY, lDoorY, cDoorY, visualAir;
            
            if (isFront) {
                cFrontY = cY + cD; 
                doorWallY = sD;    
                lDoorY = doorWallY - seal; 
                cDoorY = lDoorY - 35 - seal; 
                visualAir = cDoorY - cFrontY; 
            } else {
                cFrontY = cY; 
                doorWallY = 0; 
                lDoorY = doorWallY; 
                cDoorY = lDoorY + seal + 35; 
                visualAir = cFrontY - (cDoorY + seal); 
            }

            const endX = doorStartX + CO;

            if (doorType === 'Αυτόματη') {
                localSvg += `<line x1="${doorStartX}" y1="${cFrontY}" x2="${doorStartX}" y2="${isFront ? cDoorY : cDoorY + seal}" stroke="#64748b" stroke-width="2" />`;
                localSvg += `<line x1="${endX}" y1="${cFrontY}" x2="${endX}" y2="${isFront ? cDoorY : cDoorY + seal}" stroke="#64748b" stroke-width="2" />`;
                localSvg += `<rect x="${doorStartX}" y="${isFront ? cFrontY : cDoorY + seal}" width="${CO}" height="${Math.abs(cFrontY - (isFront ? cDoorY : cDoorY + seal))}" fill="#1e293b" opacity="0.4" />`;

                const doorsToDraw = [{ yBase: cDoorY, label: "Cabin Door" }, { yBase: lDoorY, label: "Landing Door" }];

                doorsToDraw.forEach((doorSet, setIndex) => {
                    const baseY = doorSet.yBase;
                    for (let i = 0; i < numRails; i++) {
                        const railY = baseY + (i * railThk);
                        let railX, railW;

                        if (isCentral) {
                            railX = doorStartX - G; railW = G + CO + G;
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
                                railX = doorStartX - G; railW = G + CO;
                                leafIndex = (setIndex === 0) ? i : (numRails - 1 - i);
                            } else {
                                railX = doorStartX; railW = CO + G;
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

                if (isFront) {
                    let dimX_internal, textAnchor, textX;
                    if (isCentral) {
                        dimX_internal = doorStartX - G - 25; textAnchor = "end"; textX = dimX_internal - 12;
                    } else {
                        if (isLeftOpen) {
                            dimX_internal = doorStartX + CO + 25; textAnchor = "start"; textX = dimX_internal + 16;
                        } else {
                            dimX_internal = doorStartX - 25; textAnchor = "end"; textX = dimX_internal - 12;
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

        svg += drawOneDoor(true);
        if (hasTwoDoors) svg += drawOneDoor(false);

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
        
        const thkDoor = parseFloat(data.pahos_sthrigmatos_door) || 40;
        const thkOpposite = parseFloat(data.pahos_sthrigmatos_opposite) || 40;
        const bracketLenX = 240;
        const rY2 = parseFloat(data.Apostasi_toixou_odhgou_y2); 

        // ==============================================================
        // ΝΕΟ: ΕΦΑΡΜΟΓΗ OFFSETS ΑΠΟ ΤΟ DRAG (SIDE CHASSIS)
        // ==============================================================
        const off1 = window.bracketOffsets.rail1 || 0;
        const off2 = window.bracketOffsets.rail2 || 0;

        const base_br1TopY = sD - rY1 - thkDoor;       
        const br1TopY = base_br1TopY + off1;
        const rail1BaseY = br1TopY;                 
        const rail1TipY = rail1BaseY - h1;          

        const base_br2TopY = rY2;
        const br2TopY = base_br2TopY + off2;                        
        const br2BottomY = br2TopY + thkOpposite;   
        const rail2BaseY = br2BottomY;              
        const rail2TipY = rail2BaseY + h1;          

        // Υπολογισμός Ορίων (Τοίχοι)
        const br1_min = Math.max(-200, -base_br1TopY);
        const br1_max = Math.min(200, rY1);

        const br2_min = Math.max(-200, -base_br2TopY);
        const br2_max = Math.min(200, sD - base_br2TopY - thkOpposite);

        // Labels
        const label1 = off1 > 0 ? `+${Math.round(off1)} mm` : (off1 < 0 ? `${Math.round(off1)} mm` : "");
        const label2 = off2 > 0 ? `+${Math.round(off2)} mm` : (off2 < 0 ? `${Math.round(off2)} mm` : "");


        svg += `<rect x="${cX}" y="${cY}" width="${cW}" height="${cD}" fill="none" stroke="#0ea5e9" stroke-width="4" />`;
        svg += `<rect x="${cX + 15}" y="${cY + 15}" width="${cW - 30}" height="${cD - 30}" fill="rgba(14, 165, 233, 0.05)" stroke="#0ea5e9" stroke-width="1" />`;

        const fixTextTransform = isRightChassis ? ` transform="scale(-1, 1)"` : ``;
        const labelX = isRightChassis ? -(bracketLenX + 20) : (bracketLenX + 20);
        const labelAnchor = isRightChassis ? "end" : "start";

        // Κάτω Στήριγμα
        svg += `<g id="rail1" class="draggable-support" data-axis="y" data-min="${br1_min}" data-max="${br1_max}" style="cursor: grab;">`;
        svg += `<rect x="0" y="${br1TopY}" width="${bracketLenX}" height="${thkDoor}" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
        svg += `<rect x="40" y="${br1TopY + (thkDoor/2) - 4}" width="80" height="8" rx="4" fill="#111827" />`;
        svg += `<rect x="${rX - (railBaseW / 2)}" y="${rail1BaseY - railBaseThk}" width="${railBaseW}" height="${railBaseThk}" fill="#eab308" />`;
        svg += `<rect x="${rX - (bladeW / 2)}" y="${rail1TipY}" width="${bladeW}" height="${h1 - railBaseThk}" fill="#eab308" />`;
        svg += `<text class="drag-label" x="${labelX}" y="${br1TopY + (thkDoor/2) + 6}" fill="#0ea5e9" font-size="22" font-weight="bold" text-anchor="${labelAnchor}"${fixTextTransform}>${label1}</text>`;
        svg += `</g>`;

        // Πάνω Στήριγμα
        svg += `<g id="rail2" class="draggable-support" data-axis="y" data-min="${br2_min}" data-max="${br2_max}" style="cursor: grab;">`;
        svg += `<rect x="0" y="${br2TopY}" width="${bracketLenX}" height="${thkOpposite}" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
        svg += `<rect x="40" y="${br2TopY + (thkOpposite/2) - 4}" width="80" height="8" rx="4" fill="#111827" />`;
        svg += `<rect x="${rX - (railBaseW / 2)}" y="${rail2BaseY}" width="${railBaseW}" height="${railBaseThk}" fill="#eab308" />`;
        svg += `<rect x="${rX - (bladeW / 2)}" y="${rail2BaseY + railBaseThk}" width="${bladeW}" height="${h1 - railBaseThk}" fill="#eab308" />`;
        svg += `<text class="drag-label" x="${labelX}" y="${br2TopY + (thkOpposite/2) + 6}" fill="#0ea5e9" font-size="22" font-weight="bold" text-anchor="${labelAnchor}"${fixTextTransform}>${label2}</text>`;
        svg += `</g>`;

        // ΝΕΟ: Το Έμβολο μπαίνει ΠΑΝΤΑ ακριβώς στη μέση!
        const pistonY = (rail1TipY + rail2TipY) / 2;
        svg += `<circle cx="${rX}" cy="${pistonY}" r="22" fill="#f97316" stroke="#c2410c" stroke-width="2" />`;
        svg += `<circle cx="${rX}" cy="${pistonY}" r="10" fill="#fff7ed" />`;

        svg += `</g>`;

        const isRight = (inputs.real_chassis === 'right');
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

        svg += drawDimH(0, sW, -180, sW, 0);

        if (isRight) svg += drawDimV(-180, 0, sD, sD); 
        else svg += drawDimVRight(sW + 180, 0, sD, sD); 

        // ΝΕΟ: Υπολογισμός δυναμικού DBG!
        const dimRailX = isRight ? (sW + 130) : -130; 
        const currentDbg = rail1TipY - rail2TipY;
        
        if (isRight) {
            svg += drawDimVRight(dimRailX, sD, rail1TipY, sD - rail1TipY);
            svg += drawDimVRight(dimRailX, rail1TipY, rail2TipY, currentDbg);
            svg += drawDimVRight(dimRailX, rail2TipY, 0, rail2TipY);
        } else {
            svg += drawDimV(dimRailX, sD, rail1TipY, sD - rail1TipY);
            svg += drawDimV(dimRailX, rail1TipY, rail2TipY, currentDbg);
            svg += drawDimV(dimRailX, rail2TipY, 0, rail2TipY);
        }

        const dimDoorY = sD + 150; 
        const apiLeftLampa = parseFloat(data.Apostasi_ar_lampa) || doorStartX;
        const apiRightLampa = parseFloat(data.Apostasi_dek_lampa) || (sW - (apiLeftLampa + CO));

        const visLeftLampa = isRight ? apiRightLampa : apiLeftLampa;
        const visRightLampa = isRight ? apiLeftLampa : apiRightLampa;

        if (visLeftLampa > 0) svg += drawDimH(0, visLeftLampa, dimDoorY, visLeftLampa, sD, "#ffffff", "normal", "18");
        svg += drawDimH(visLeftLampa, visLeftLampa + CO, dimDoorY, CO, sD, "#fbbf24", "bold", "24");
        if (visRightLampa > 0) svg += drawDimH(visLeftLampa + CO, sW, dimDoorY, visRightLampa, sD, "#ffffff", "normal", "18");

        const dimTopY = -140; 
        const distRailCabin = cX - rX; 

        if (isRight) {
            let currX = 0;
            if (dist_x > 0) { 
                svg += drawDimH(currX, currX + dist_x, dimTopY, dist_x, 0, "#ffffff", "normal", "18");
                currX += dist_x;
            }
            svg += drawDimH(currX, currX + cW, dimTopY, cW, cY, "#fbbf24", "bold", "26"); 
            currX += cW;
            if (distRailCabin > 0) { 
                svg += drawDimH(currX, currX + distRailCabin, dimTopY, distRailCabin, cY, "#ffffff", "normal", "18");
                currX += distRailCabin;
            }
            svg += drawDimH(currX, sW, dimTopY, rX, 0, "#ffffff", "normal", "18"); 
            svg += `<line x1="${currX}" y1="${rail2TipY}" x2="${currX}" y2="${dimTopY}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
        } else {
            let currX = 0;
            svg += drawDimH(0, rX, dimTopY, rX, 0, "#ffffff", "normal", "18"); 
            svg += `<line x1="${rX}" y1="${rail2TipY}" x2="${rX}" y2="${dimTopY}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,2" />`;
            currX += rX;
            if (distRailCabin > 0) { 
                svg += drawDimH(currX, currX + distRailCabin, dimTopY, distRailCabin, cY, "#ffffff", "normal", "18");
                currX += distRailCabin;
            }
            svg += drawDimH(currX, currX + cW, dimTopY, cW, cY, "#fbbf24", "bold", "26"); 
            currX += cW;
            if (dist_x > 0) { 
                svg += drawDimH(currX, sW, dimTopY, dist_x, 0, "#ffffff", "normal", "18");
            }
        }

        if (isRight) {
            const dimCabinD_X = -150; 
            svg += drawDimV(dimCabinD_X, cY, cY + cD, cD);
            if (cY > 0) svg += drawDimV(dimCabinD_X, 0, cY, cY, 25); 
        } else {
            const dimCabinD_X = sW + 150; 
            svg += drawDimVRight(dimCabinD_X, cY, cY + cD, cD);
            if (cY > 0) svg += drawDimVRight(dimCabinD_X, 0, cY, cY, 25); 
        }

    } else if (chassisPosition === 'rear') {
        const sW = parseFloat(inputs.shaftwidth);
        const sD = parseFloat(inputs.shaftdepth);
        const CO = parseFloat(inputs.anoigma_portas);
        const G = parseFloat(data.G_portas_val) || 0;
        
        const isCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";
        const isLeftOpen = (inputs.kateuthinsi_anoigmatos === "Αριστερά"); 
        const isAdjacent = (inputs.cabin_doors === '2_gwniako');
        const side2 = inputs.thesi_second_door; 
        const dir2 = inputs.dir_second_door; 

        const apiLeftLampa = parseFloat(data.Apostasi_ar_lampa) || 0;
        const apiRightLampa = parseFloat(data.Apostasi_dek_lampa) || (sW - apiLeftLampa - CO);

        let doorStartX = apiLeftLampa;
        if (!isCentral && !isLeftOpen) doorStartX = apiRightLampa;
        
        const y_rear = parseFloat(data.Apostasi_toixou_odhgou_y_rear);
        const rY_axis = y_rear;

        const cW = parseFloat(data.Platos_thalamou);
        const cD = parseFloat(data.Vathos_Thalamou);
        const dist_x_ar = parseFloat(data.Apostasi_thalamou_toixou_ar_rear); 
        const cX = dist_x_ar; 
        const dist_cabin_rail = parseFloat(data.Apostasi_thalamou_odhgou_rear);
        const t = 90; 

        let rawModel = (inputs.Odhgoi_Type || "T89/A").toString().trim().toUpperCase();
        const railModels = {
            "T50":      { baseW: 50,  baseThk: 5,  totalH: 50, bladeW: 5 },
            "T75":      { baseW: 75,  baseThk: 10, totalH: 62, bladeW: 10 },
            "T89/A":    { baseW: 89,  baseThk: 16, totalH: 62, bladeW: 16 },
            "T90/A":    { baseW: 90,  baseThk: 16, totalH: 75, bladeW: 16 },
            "T125/A":   { baseW: 125, baseThk: 16, totalH: 82, bladeW: 16 }
        };
        let railDim = railModels[rawModel] || railModels["T89/A"];
        const railBaseW = railDim.baseW, railBaseThk = railDim.baseThk, bladeW = railDim.bladeW, h1 = railDim.totalH;

        const cY = rY_axis + dist_cabin_rail; 
        const cabinFrontY = cY + cD; 

        let doorStartY = 0;
        if (isAdjacent) {
            const isSecondDoorCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";
            const isSemiAuto = inputs.tupos_portas === "Ημιαυτόματη" || inputs.tupos_portas === "semi_automatic" || inputs.tuposAnoigmatos === "Ημιαυτόματη";

            if (isSecondDoorCentral || isSemiAuto) {
                doorStartY = cY + (cD / 2) - (CO / 2) - 100;
            } else {
                doorStartY = (dir2 === 'panw') ? (cabinFrontY - 5 - CO) : (cY + 5);
            }
        }

        svg = `<svg viewBox="-250 -250 ${sW + 650} ${sD + 650}" xmlns="http://www.w3.org/2000/svg" style="width:100%; background:#111827; border-radius:12px;">`;

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

        let wallPath = ``;

        if (isAdjacent) {
            let cutPointTop = doorStartY - 120; 
            let cutPointBottom = doorStartY + CO + 120;

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
            let sidePillarW = t / 1.5; 
            let rectX = (side2 === 'left') ? -sidePillarW : sW; 
            svg += `<rect x="${rectX}" y="${doorStartY - 120}" width="${sidePillarW}" height="120" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
            svg += `<rect x="${rectX}" y="${doorStartY + CO}" width="${sidePillarW}" height="120" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        }
        
        const pillarW = 120, pillarH = 60, pillarY = sD, frontWallH = t, frontWallY = sD;
        const leftWallW = doorStartX - pillarW; 
        if (leftWallW > 0) svg += `<rect x="0" y="${frontWallY}" width="${leftWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        
        svg += `<rect x="${doorStartX - pillarW}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        svg += `<rect x="${doorStartX + CO}" y="${pillarY}" width="${pillarW}" height="${pillarH}" fill="url(#pillarPattern)" stroke="#475569" stroke-width="2" />`;
        
        const rightWallX = doorStartX + CO + pillarW; 
        const rightWallW = sW - rightWallX; 
        if (rightWallW > 0) svg += `<rect x="${rightWallX}" y="${frontWallY}" width="${rightWallW}" height="${frontWallH}" fill="url(#concretePattern)" stroke="#64748b" stroke-width="3" />`;
        
        // ==============================================================
        // ΝΕΟ: ΕΦΑΡΜΟΓΗ OFFSETS ΑΠΟ ΤΟ DRAG (REAR CHASSIS)
        // ==============================================================
        const offL = window.bracketOffsets.rearLeft || 0;
        const offR = window.bracketOffsets.rearRight || 0;

        const base_x_ar = parseFloat(data.Apostasi_toixou_odhgou_x_ar_rear) || 100;
        const x_ar = base_x_ar + offL;

        const base_x_dek = parseFloat(data.Apostasi_toixou_odhgou_x_dek_rear) || 100;
        const pahos_rear = parseFloat(data.pahos_sthrigmatos_rear) || 40;
        
        const rightBracketX = sW - base_x_dek - pahos_rear + offR;

        const bracketLength = 100; 
        const bracketHeight = 230; 

        const rail1BaseX = x_ar + pahos_rear; 
        const rail1TipX = rail1BaseX + h1;    
        const rail2BaseX = rightBracketX; 
        const rail2TipX = rail2BaseX - h1;          

        // Υπολογισμός Ορίων (Τοίχοι)
        const rearL_min = Math.max(-200, -base_x_ar);
        const rearL_max = Math.min(200, sW - base_x_ar - pahos_rear);

        const rearR_min = Math.max(-200, -(sW - base_x_dek - pahos_rear)); 
        const rearR_max = Math.min(200, base_x_dek);

        const labelL = offL > 0 ? `+${Math.round(offL)} mm` : (offL < 0 ? `${Math.round(offL)} mm` : "");
        const labelR = offR > 0 ? `+${Math.round(offR)} mm` : (offR < 0 ? `${Math.round(offR)} mm` : "");

        const drawSlot = (cx, cy, w, h) => `<rect x="${cx - w/2}" y="${cy - h/2}" width="${w}" height="${h}" rx="${w/2}" fill="#111827" opacity="0.6" />`;

        // ΑΡΙΣΤΕΡΟ ΣΤΗΡΙΓΜΑ & ΟΔΗΓΟΣ
        svg += `<g id="rearLeft" class="draggable-support" data-axis="x" data-min="${rearL_min}" data-max="${rearL_max}" style="cursor: grab;">`;
        svg += `<rect x="${x_ar}" y="0" width="${pahos_rear}" height="${bracketHeight}" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
        const baseArX = x_ar - (bracketLength/2) + (pahos_rear/2);
        svg += `<rect x="${baseArX}" y="0" width="${bracketLength}" height="15" rx="2" fill="#64748b" stroke="#475569" stroke-width="1" />`;
        svg += drawSlot(x_ar + pahos_rear/2, 60, pahos_rear/2.5, 30);
        svg += drawSlot(x_ar + pahos_rear/2, 140, pahos_rear/2.5, 30);
        svg += drawSlot(baseArX + 20, 7.5, 15, 6);
        svg += drawSlot(baseArX + bracketLength - 20, 7.5, 15, 6);
        svg += `<rect x="${rail1BaseX}" y="${rY_axis - (railBaseW/2)}" width="${railBaseThk}" height="${railBaseW}" fill="#eab308" />`;
        svg += `<rect x="${rail1BaseX + railBaseThk}" y="${rY_axis - (bladeW/2)}" width="${h1 - railBaseThk}" height="${bladeW}" fill="#eab308" />`;
        svg += `<text class="drag-label" x="${x_ar + pahos_rear/2}" y="-20" fill="#0ea5e9" font-size="22" font-weight="bold" text-anchor="middle">${labelL}</text>`;
        svg += `</g>`;

        // ΔΕΞΙΟ ΣΤΗΡΙΓΜΑ & ΟΔΗΓΟΣ
        svg += `<g id="rearRight" class="draggable-support" data-axis="x" data-min="${rearR_min}" data-max="${rearR_max}" style="cursor: grab;">`;
        svg += `<rect x="${rightBracketX}" y="0" width="${pahos_rear}" height="${bracketHeight}" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="2" />`;
        const baseDekX = rightBracketX + (pahos_rear/2) - (bracketLength/2);
        svg += `<rect x="${baseDekX}" y="0" width="${bracketLength}" height="15" rx="2" fill="#64748b" stroke="#475569" stroke-width="1" />`;
        const xCenterDek = rightBracketX + pahos_rear/2;
        svg += drawSlot(xCenterDek, 60, pahos_rear/2.5, 30);
        svg += drawSlot(xCenterDek, 140, pahos_rear/2.5, 30);
        svg += drawSlot(baseDekX + 20, 7.5, 15, 6);
        svg += drawSlot(baseDekX + bracketLength - 20, 7.5, 15, 6);
        svg += `<rect x="${rail2BaseX - railBaseThk}" y="${rY_axis - (railBaseW/2)}" width="${railBaseThk}" height="${railBaseW}" fill="#eab308" />`;
        svg += `<rect x="${rail2BaseX - h1}" y="${rY_axis - (bladeW/2)}" width="${h1 - railBaseThk}" height="${bladeW}" fill="#eab308" />`;
        svg += `<text class="drag-label" x="${xCenterDek}" y="-20" fill="#0ea5e9" font-size="22" font-weight="bold" text-anchor="middle">${labelR}</text>`;
        svg += `</g>`;

        // ΝΕΟ: Το Έμβολο μπαίνει ΠΑΝΤΑ στη μέση!
        const pistonX = (rail1TipX + rail2TipX) / 2;
        const pistonY = rY_axis;
        svg += `<circle cx="${pistonX}" cy="${pistonY}" r="22" fill="#f97316" stroke="#c2410c" stroke-width="2" /><circle cx="${pistonX}" cy="${pistonY}" r="10" fill="#fff7ed" />`;
        svg += `<rect x="${cX}" y="${cY}" width="${cW}" height="${cD}" fill="none" stroke="#0ea5e9" stroke-width="4" />`;
        
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
            const landingDoorY = sD; 
            svg += `<line x1="${doorStartX}" y1="${cabinFrontY}" x2="${doorStartX}" y2="${sD}" stroke="#64748b" stroke-width="2" />`;
            svg += `<line x1="${doorStartX + CO}" y1="${cabinFrontY}" x2="${doorStartX + CO}" y2="${sD}" stroke="#64748b" stroke-width="2" />`;
            svg += `<rect x="${doorStartX}" y="${cabinFrontY}" width="${CO}" height="${sD - cabinFrontY}" fill="#1e293b" opacity="0.4" />`;

            svg += `<rect x="${doorStartX - G}" y="${landingDoorY}" width="${G + CO + G}" height="40" fill="#334155" stroke="#475569" stroke-width="2" />`;
            svg += `<rect x="${doorStartX}" y="${landingDoorY + 5}" width="${CO}" height="30" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
            svg += `<circle cx="${doorStartX + CO - 20}" cy="${landingDoorY + 20}" r="6" fill="#fbbf24" stroke="#d97706" stroke-width="2" />`;
        }

        if (isAdjacent) {
            const isSecondDoorCentral = inputs.tuposAnoigmatos === "Κεντρικό" || inputs.tupos_anoigmatos === "Κεντρικό";

            if (doorType === 'Αυτόματη') {
                if (isSecondDoorCentral) {
                    let centralDoorStartY = cY + (cD / 2) - (CO / 2) - 100;
                    let landingDoorX, cabinDoorX, cabinFrontX, visualCabinAir;

                    if (side2 === 'left') {
                        landingDoorX = 0; 
                        cabinDoorX = landingDoorX + seal + 35; 
                        cabinFrontX = cX;
                        visualCabinAir = cabinFrontX - (cabinDoorX + seal);
                    } else {
                        landingDoorX = sW - seal; 
                        cabinDoorX = landingDoorX - 35 - seal; 
                        cabinFrontX = cX + cW;
                        visualCabinAir = cabinDoorX - cabinFrontX;
                    }

                    svg += `<rect x="${cabinDoorX}" y="${centralDoorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;
                    svg += `<rect x="${landingDoorX}" y="${centralDoorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;

                    const sideDoorsToDraw = [
                        { xBase: cabinDoorX, isCabin: true },
                        { xBase: landingDoorX, isCabin: false }
                    ];

                    sideDoorsToDraw.forEach((doorSet) => {
                        const baseX = doorSet.xBase;
                        for (let i = 0; i < numRails; i++) {
                            let railX = baseX + (i * railThk);
                            let rY = centralDoorStartY - G; 
                            let rH = G + CO + G;

                            svg += `<rect x="${railX}" y="${rY}" width="${railThk}" height="${rH}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                            svg += `<line x1="${railX + railThk * 0.5}" y1="${rY}" x2="${railX + railThk * 0.5}" y2="${rY + rH}" stroke="#475569" stroke-width="1.5" />`;
                            
                            const leafW = railThk - 4; 
                            const leafH = CO / 2;

                            svg += `<rect x="${railX + 2}" y="${centralDoorStartY}" width="${leafW}" height="${leafH}" fill="url(#doorHatch)" stroke="#677b96" stroke-width="1.5" />`;
                            svg += `<rect x="${railX + (railThk/2) - 2}" y="${centralDoorStartY + (leafH/2) - 15}" width="4" height="30" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;

                            svg += `<rect x="${railX + 2}" y="${centralDoorStartY + CO - leafH}" width="${leafW}" height="${leafH}" fill="url(#doorHatch)" stroke="#94a3b8" stroke-width="1.5" />`;
                            svg += `<rect x="${railX + (railThk/2) - 2}" y="${centralDoorStartY + CO - leafH + (leafH/2) - 15}" width="4" height="30" rx="1" fill="#111827" stroke="#94a3b8" stroke-width="0.5" />`;
                        }
                    });

                    let wallLineX = (side2 === 'left') ? 0 : sW;
                    svg += `<line x1="${wallLineX}" y1="${centralDoorStartY}" x2="${cabinFrontX}" y2="${centralDoorStartY}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<line x1="${wallLineX}" y1="${centralDoorStartY + CO}" x2="${cabinFrontX}" y2="${centralDoorStartY + CO}" stroke="#64748b" stroke-width="2" />`;
                    
                    let shadowX = Math.min(wallLineX, cabinFrontX);
                    let shadowW = Math.abs(cabinFrontX - wallLineX);
                    svg += `<rect x="${shadowX}" y="${centralDoorStartY}" width="${shadowW}" height="${CO}" fill="#1e293b" opacity="0.3" />`;

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
                else {
                    const lDoorX_min = (side2 === 'left') ? 0 : (sW - seal);
                    const cDoorX_min = (side2 === 'left') ? (cX - 50 - seal) : (cX + cW + 50);

                    svg += `<line x1="${cDoorX_min}" y1="${doorStartY}" x2="${cDoorX_min + seal}" y2="${doorStartY}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<line x1="${cDoorX_min}" y1="${doorStartY + CO}" x2="${cDoorX_min + seal}" y2="${doorStartY + CO}" stroke="#64748b" stroke-width="2" />`;
                    svg += `<rect x="${cDoorX_min}" y="${doorStartY}" width="${seal}" height="${CO}" fill="#1e293b" opacity="0.4" />`;
                    
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
                            let railX = (side2 === 'left') ? (baseX + seal - railThk - (i * railThk)) : (baseX + (i * railThk));
                            let rY = doorStartY;
                            let rH = CO;
                            if (dir2 === 'panw') { rY = doorStartY - G; rH = G + CO; }
                            else if (dir2 === 'katw') { rY = doorStartY; rH = CO + G; }

                            svg += `<rect x="${railX}" y="${rY}" width="${railThk}" height="${rH}" fill="#1f2937" stroke="#475569" stroke-width="1" />`;
                            svg += `<line x1="${railX + railThk * 0.5}" y1="${rY}" x2="${railX + railThk * 0.5}" y2="${rY + rH}" stroke="#475569" stroke-width="1.5" />`;

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
            
            let wallLineX = (side2 === 'left') ? 0 : sW;
            let cabinLineX = (side2 === 'left') ? cX : cX + cW;

            svg += `<line x1="${wallLineX}" y1="${doorStartY}" x2="${cabinLineX}" y2="${doorStartY}" stroke="#64748b" stroke-width="2" />`;
            svg += `<line x1="${wallLineX}" y1="${doorStartY + CO}" x2="${cabinLineX}" y2="${doorStartY + CO}" stroke="#64748b" stroke-width="2" />`;

            let shadowX = Math.min(wallLineX, cabinLineX);
            let shadowW = Math.abs(cabinLineX - wallLineX);
            svg += `<rect x="${shadowX}" y="${doorStartY}" width="${shadowW}" height="${CO}" fill="#1e293b" opacity="0.3" />`;
        }

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
        
        const dimLeftX = -130;
        svg += drawDimV(dimLeftX, 0, rY_axis, rY_axis); 
        svg += drawDimV(dimLeftX, rY_axis, cY, dist_cabin_rail); 
        svg += drawDimV(dimLeftX, cY, cY + cD, cD); 

        // ΝΕΟ: Υπολογισμός δυναμικού DBG!
        const currentDbg = rail2TipX - rail1TipX;
        const dimTopY = -140;
        svg += drawDimH(0, rail1TipX, dimTopY, rail1TipX, 0, "#ffffff", "normal", "18");
        svg += drawDimH(rail1TipX, rail2TipX, dimTopY, currentDbg, 0, "#fbbf24", "bold", "24");
        const rightRailToWall = sW - rail2TipX;
        svg += drawDimH(rail2TipX, sW, dimTopY, rightRailToWall, 0, "#ffffff", "normal", "18");

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
    }

    svg += `</svg>`;
    container.innerHTML = svg;
}

function displayResults(data) {
    const resDiv = document.getElementById('resultsTable');
    
    const fmt = (val) => {
        const n = parseFloat(val);
        if (isNaN(n)) return val;
        return Math.floor(n / 10) * 10; 
    };

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

function drawplagiaopsi(inputs, data_horiz, data_vert) {

    const vathos_puthmena = parseFloat(inputs.vathos_puthmena);
    const vathos_thalamou = parseFloat(data_horiz.Vathos_Thalamou);
    const ipsos_tel_orofou = parseFloat(data_vert.Ipsos_tel_orofou);
    const diadromi_anelkistira = parseFloat(inputs.diadromi_anelkistira);
    const ekswteriko_ipsos_thalamou = parseFloat(inputs.ekswteriko_ipsos_thalamou);
    const vathos_freatiou = parseFloat(inputs.shaftdepth);
    
    const totalHeight = ipsos_tel_orofou + diadromi_anelkistira + vathos_puthmena + 100;
    
    const placeholder = document.getElementById('side-view-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    const svgElement = document.getElementById('elevator-svg-side');
    svgElement.style.display = 'block'; 
    
    const padding = 300; 
    const viewGap = 2000; 
    svgElement.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svgElement.setAttribute('viewBox', `${-padding} ${-padding} ${(vathos_freatiou * 2) + viewGap + (2*padding)} ${totalHeight + (2*padding)}`);
    
    const staseis = parseFloat(inputs.staseis);
    const ipsos_orofou = diadromi_anelkistira / (staseis - 1);
    
    const shaft_dX_0 = 0; 
    const shaft_dX_top = vathos_freatiou + viewGap; 

    const internal_left = 200;
    const provolos_thickness = vathos_puthmena - 150;
    const buffer_height = 50;
    const sasi_width = 150; 
    const provolos_width = vathos_thalamou + sasi_width - 100;

    const getCabinComplexHTML = (dX, current_thalamos_y) => {
        const final_internal_left = internal_left + dX;
        const final_thalamos_x = final_internal_left + 200;
        const sasi_left = final_thalamos_x - sasi_width - 10; 
        const sasi_bottom = current_thalamos_y + ekswteriko_ipsos_thalamou + 100;

        const current_buffer_y = current_thalamos_y + ekswteriko_ipsos_thalamou;
        const current_provolos_y = current_buffer_y + buffer_height;

        return `
            <line x1="${final_internal_left + 80}" y1="0" x2="${final_internal_left + 80}" y2="${totalHeight}" stroke="#0055ff" stroke-width="2"/>
            <line x1="${final_internal_left + 95}" y1="0" x2="${final_internal_left + 95}" y2="${totalHeight}" stroke="#0055ff" stroke-width="2"/>
            <line x1="${final_internal_left + 110}" y1="0" x2="${final_internal_left + 110}" y2="${totalHeight}" stroke="#0055ff" stroke-width="2"/>

            <rect x="${sasi_left}" y="${current_thalamos_y - 150}" width="${sasi_width}" height="${ekswteriko_ipsos_thalamou + 250}" fill="url(#hatch2)" stroke="#aab3bd" stroke-width="4"/>
            
            <circle cx="${sasi_left + (sasi_width / 2)}" cy="${current_thalamos_y - 80}" r="25" fill="none" stroke="#aab3bd" stroke-width="3"/>
            <circle cx="${sasi_left + (sasi_width / 2)}" cy="${sasi_bottom - 40}" r="25" fill="none" stroke="#aab3bd" stroke-width="3"/>
            
            <rect x="${sasi_left}" y="${current_thalamos_y + ekswteriko_ipsos_thalamou}" width="${provolos_width}" height="70" fill="#2a2d3a" stroke="#aab3bd" stroke-width="4"/>

            <rect x="${final_thalamos_x}" y="${current_thalamos_y}" width="${vathos_thalamou - 100}" height="${ekswteriko_ipsos_thalamou}" fill="#1e1e1e" stroke="#ff0000" stroke-width="4"/>
            
            <line x1="${final_thalamos_x}" y1="${current_thalamos_y + ekswteriko_ipsos_thalamou - 20}" x2="${final_thalamos_x + vathos_thalamou}" y2="${current_thalamos_y + ekswteriko_ipsos_thalamou - 20}" stroke="#ff0000" stroke-width="2"/>
            <line x1="${final_thalamos_x}" y1="${current_thalamos_y + ekswteriko_ipsos_thalamou - 40}" x2="${final_thalamos_x + vathos_thalamou}" y2="${current_thalamos_y + ekswteriko_ipsos_thalamou - 40}" stroke="#ff0000" stroke-width="2"/>

            <rect x="${sasi_left}" y="${current_provolos_y}" width="${provolos_width}" height="${provolos_thickness}" fill="url(#hatch2)" stroke="#ffffff" stroke-width="3"/>
            <text x="${sasi_left + 15}" y="${current_provolos_y + 65}" fill="#ffffff" font-size="20" font-weight="bold">ΠΡΟΒΟΛΟΣ</text>

            <rect x="${final_thalamos_x + 20}" y="${current_buffer_y}" width="80" height="${buffer_height}" fill="none" stroke="#0000ff" stroke-width="3"/>
            <line x1="${final_thalamos_x + 20}" y1="${current_buffer_y}" x2="${final_thalamos_x + 20 + 80}" y2="${current_buffer_y + buffer_height}" stroke="#0000ff" stroke-width="1"/>
            <line x1="${final_thalamos_x + 20 + 80}" y1="${current_buffer_y}" x2="${final_thalamos_x + 20}" y2="${current_buffer_y + buffer_height}" stroke="#0000ff" stroke-width="1"/>

            <rect x="${final_thalamos_x + vathos_thalamou - 200}" y="${current_buffer_y}" width="80" height="${buffer_height}" fill="none" stroke="#0000ff" stroke-width="3"/>
            <line x1="${final_thalamos_x + vathos_thalamou - 200}" y1="${current_buffer_y}" x2="${final_thalamos_x + vathos_thalamou - 20}" y2="${current_buffer_y + buffer_height}" stroke="#0000ff" stroke-width="1"/>
            <line x1="${final_thalamos_x + vathos_thalamou - 120}" y1="${current_buffer_y}" x2="${final_thalamos_x + vathos_thalamou - 100}" y2="${current_buffer_y + buffer_height}" stroke="#0000ff" stroke-width="1"/>
        `;
    };

    const getShaftHTML = (dX) => `
        <rect x="${0 + dX}" y="0" width="200" height="${totalHeight}" fill="url(#hatch)" stroke="#edeff1" stroke-width="2" />  
        <rect x="${0 + dX}" y="-200" width="${vathos_freatiou + 200}" height="200" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" /> 
        <rect x="${vathos_freatiou + dX}" y="0" width="200" height="${totalHeight - vathos_puthmena - 100 - ekswteriko_ipsos_thalamou - diadromi_anelkistira}" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" /> 
        <rect x="${0 + dX}" y="${totalHeight}" width="${vathos_freatiou + 200}" height="200" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2" /> 
        <rect x="${0 + dX}" y="${totalHeight}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5" /> 
        <rect x="${0 + dX}" y="-200" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena - diadromi_anelkistira - ekswteriko_ipsos_thalamou - 100}" width="100" height="${ekswteriko_ipsos_thalamou}"  fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena - diadromi_anelkistira - 100}" width="900" height="100" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena - diadromi_anelkistira }" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena + 100}" width="200" height="${vathos_puthmena-100}" fill="#b6b46444" stroke="#ffffff" stroke-width="5"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena + 100}" width="200" height="${vathos_puthmena-100}" fill="url(#hatch)" stroke="#c9ced6" stroke-width="2"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena}" width="900" height="100" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena - ekswteriko_ipsos_thalamou}" width="100" height="${ekswteriko_ipsos_thalamou}" rx="20" ry="20" fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/> 
        <rect x="${vathos_freatiou + dX}" y="${totalHeight - vathos_puthmena - ipsos_orofou}" width="200" height="${ipsos_orofou - ekswteriko_ipsos_thalamou}" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/> 
    `;

    const getSupportsHTML = (dX) => {
        let supportsHtml = "";
        const bracketX = dX + 200; 
        const bracketWidth = 80;   
        let index = 1;

        for(let currY = 500; currY < totalHeight - 500; currY += 2000) {
            // ΝΕΟ: Εφαρμόζουμε την ίδια λογική δυναμικών Offsets και εδώ!
            const id = `side_support_${dX}_${index}`;
            const offY = window.bracketOffsets[id] || 0;
            const finalY = currY + offY;
            const label = offY > 0 ? `+${Math.round(offY)} mm` : (offY < 0 ? `${Math.round(offY)} mm` : "");

            supportsHtml += `
                <g id="${id}" class="draggable-support" data-axis="y" data-min="-300" data-max="300" style="cursor: grab;">
                    <rect x="${bracketX}" y="${finalY}" width="${bracketWidth}" height="40" fill="#ffaa00" stroke="#000000" stroke-width="2"/>
                    <text class="drag-label" x="${bracketX + bracketWidth + 20}" y="${finalY + 25}" fill="#ffffff" font-size="22" font-weight="bold">${label}</text>
                </g>
            `;
            index++;
        }
        return supportsHtml;
    };

    let allHTML = `
        <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#ffffffcb" stroke-width="4" />
            </pattern>
            <pattern id="hatch2" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(30)">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff99" stroke-width="2" />
            </pattern>
        </defs>
    `;

    const floorsHTML_template = (ipsos_orofou, staseis_total) => {
        let htm = "";
        for (let i = 1; i < staseis_total - 1; i++) {
            htm += `
                <rect x="${vathos_freatiou}" y="${totalHeight-vathos_puthmena - i*ipsos_orofou}" width="200" height="200" fill="#2a2d3af3" stroke="#ffffff" stroke-width="5"/>
                <rect x="${vathos_freatiou}" y="${totalHeight-100-vathos_puthmena - i*ipsos_orofou}" width="900" height="100" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
                <rect x="${vathos_freatiou}" y="${totalHeight-100-vathos_puthmena - ekswteriko_ipsos_thalamou - i*ipsos_orofou}" width="100" height="${ekswteriko_ipsos_thalamou}" rx="20" ry="20" fill="#2a2d3a00" stroke="#ffffff" stroke-width="4"/>
                <rect x="${vathos_freatiou}" y="${totalHeight-vathos_puthmena - ipsos_orofou - i*ipsos_orofou}" width="200" height="${ipsos_orofou-ekswteriko_ipsos_thalamou -100}" fill="url(#hatch)" stroke="#ffffff" stroke-width="5"/>
            `;
        }
        return htm;
    };

    const floorsHTML_basic = floorsHTML_template(ipsos_orofou, staseis);

    const thalamos_y_pit = totalHeight - 50 - provolos_thickness - buffer_height - ekswteriko_ipsos_thalamou;

    allHTML += `
        <text x="${vathos_freatiou / 2 - 100}" y="${-50}" fill="#edeff1" font-size="25" font-weight="bold">ΚΑΜΠΙΝΑ ΣΤΟ ΙΣΟΓΕΙΟ</text>
        ${getShaftHTML(shaft_dX_0)}
        <g transform="translate(${shaft_dX_0}, 0)">
            ${floorsHTML_basic}
        </g>
        ${getSupportsHTML(shaft_dX_0)}
        ${getCabinComplexHTML(shaft_dX_0, thalamos_y_pit)}
    `;

    const topWalkingLevelY = totalHeight - vathos_puthmena - diadromi_anelkistira - 100;
    const thalamos_y_top = topWalkingLevelY - ekswteriko_ipsos_thalamou;

    allHTML += `
        <text x="${shaft_dX_top + vathos_freatiou / 2 - 100}" y="${-50}" fill="#edeff1" font-size="25" font-weight="bold">ΚΑΜΠΙΝΑ ΣΤΟΝ ΤΕΛ. ΟΡΟΦΟ</text>
        ${getShaftHTML(shaft_dX_top)}
        <g transform="translate(${shaft_dX_top}, 0)">
            ${floorsHTML_basic}
        </g>
        ${getSupportsHTML(shaft_dX_top)}
        ${getCabinComplexHTML(shaft_dX_top, thalamos_y_top)}
    `;

    svgElement.innerHTML = allHTML;
}


// =========================================================================
// Ο ΑΠΟΛΥΤΟΣ "SMART DRAG ENGINE" - STATE DRIVEN (ΑΝΑΝΕΩΝΕΙ ΤΟ SVG LIVE)
// ΔΙΟΡΘΩΜΕΝΟ ΓΙΑ DETACHED DOM MATRICES (ΧΩΡΙΣ ΚΟΛΛΗΜΑΤΑ)
// =========================================================================

if (!window.dragEngineInitialized) {
    window.dragEngineInitialized = true;
    
    let selectedDragId = null;
    let dragStartScreenPos = 0; // Κρατάμε pixels οθόνης!
    let dragInitialOffset = 0;
    let dragAxis = 'y';

    // 1. Πιάσιμο Στηρίγματος
    window.addEventListener('pointerdown', (evt) => {
        const target = evt.target.closest('.draggable-support');
        if (target) {
            selectedDragId = target.id;
            dragAxis = target.getAttribute('data-axis') || 'y';
            
            // Καταγράφουμε το πού κάναμε κλικ στην οθόνη (όχι στο SVG)
            dragStartScreenPos = (dragAxis === 'y') ? evt.clientY : evt.clientX;
            dragInitialOffset = window.bracketOffsets[selectedDragId] || 0;
            
            document.body.style.cursor = 'grabbing';
            window.addEventListener('pointermove', handleDrag);
            window.addEventListener('pointerup', endDragGlobal);
        }
    });

    // 2. Διπλό Κλικ (Επαναφορά στο 0)
    window.addEventListener('dblclick', (evt) => {
        const target = evt.target.closest('.draggable-support');
        if (target) {
            window.bracketOffsets[target.id] = 0;
            redrawAllSVG();
        }
    });

    // 3. Κατά την κίνηση
    function handleDrag(evt) {
        if (!selectedDragId) return;
        evt.preventDefault();
        
        // Βρίσκουμε το "φρέσκο" SVG από το DOM, γιατί το παλιό διαγράφηκε!
        const currentEl = document.getElementById(selectedDragId);
        if (!currentEl) return;
        
        const currentSvg = currentEl.closest('svg');
        if (!currentSvg) return;

        // Παίρνουμε την κλίμακα από το φρέσκο SVG
        const CTM = currentSvg.getScreenCTM();
        
        // Πόσα pixels κουνήθηκε το χέρι μας στην οθόνη;
        let currentScreenPos = (dragAxis === 'y') ? evt.clientY : evt.clientX;
        let screenDelta = currentScreenPos - dragStartScreenPos;
        
        // Μετατροπή pixels σε χιλιοστά (mm)
        let svgDelta = screenDelta / (dragAxis === 'y' ? CTM.d : CTM.a);
        let newOffset = dragInitialOffset + svgDelta;

        // Διαβάζουμε τα όρια που υπολογίστηκαν από τους τοίχους
        const min = parseFloat(currentEl.getAttribute('data-min')) || -200;
        const max = parseFloat(currentEl.getAttribute('data-max')) || 200;
        
        // Φρενάρισμα με απόλυτη ομαλότητα
        newOffset = Math.max(min, Math.min(max, newOffset));

        // Σώζουμε το offset στη μνήμη
        window.bracketOffsets[selectedDragId] = newOffset;
        
        // Επανασχεδιασμός σε 60 FPS
        redrawAllSVG();
    }

    // 4. Άφημα Στηρίγματος
    function endDragGlobal(evt) {
        selectedDragId = null;
        document.body.style.cursor = 'default';
        window.removeEventListener('pointermove', handleDrag);
        window.removeEventListener('pointerup', endDragGlobal);
    }
    
    // Η συνάρτηση που ξανακαλεί τα σχέδια με τις νέες τιμές
    function redrawAllSVG() {
        if (window.currentElevatorInputs && window.currentElevatorHoriz) {
            drawElevatorSVG(window.currentElevatorInputs, window.currentElevatorHoriz);
        }
        if (window.currentElevatorInputs && window.currentElevatorHoriz && window.currentElevatorVert) {
            drawplagiaopsi(window.currentElevatorInputs, window.currentElevatorHoriz, window.currentElevatorVert);
        }
    }
}