from z3 import *






# ΣΤΑΘΕΡΟΙ ΓΕΝΙΚΟΙ ΚΑΝΟΝΙΣΜΟΙ
CONSTANT_rules = {
'Apostasi_thalamou_toixou_x_min' : 70,
'Apostasi_thalamou_toixou_y_min' :  70,
'LAMPA_Y_SEMI_MIN' : 120.0,
'LAMPA_Y_SEMI_MAX' : 200.0,
'LAMPA_Y_AUTO' : 50.0
}

def apply_constraints(solver, user_inputs, sassi_data, sthrigma_data, emvolo_data, odhgoi_data, door_data, 
                      DOOR_SIDE_BRACKET, OPPOSITE_SIDE_BRACKET, Apostasi_ar_lampa, Apostasi_dek_lampa, 
                      Anoigma_odhgwn_const, Apostasi_lampa_y, Apostasi_toixou_odhgou_x, 
                      Apostasi_toixou_odhgou_y_1, Apostasi_toixou_odhgou_y_2, Apostasi_thalamou_odhgou, 
                      Platos_thalamou, Vathos_Thalamou, Eks_ipsos_thalamou, 
                      Apostasi_thalamou_toixou_x, Apostasi_thalamou_toixou_y, 
                      Emvadon_thalamou, Emvadon_guro, Use_normal_bracket, PAHOS_PORTAS_CONST,
                      G_portas, CO_portas, pahos_sthrigmatos_door_var, pahos_sthrigmatos_opp_var, anoigma_portas, 
                      Apostasi_thalamou_toixou_ar_rear, Apostasi_thalamou_toixou_dek_rear, Apostasi_toixou_odhgou_y_rear,
                      Apostasi_thalamou_odhgou_rear, Apostasi_toixou_odhgou_x_dek_rear, Apostasi_toixou_odhgou_x_ar_rear, 
                      DEKSIA_SIDE_BRACKET, ARISTERA_SIDE_BRACKET, pahos_sthrigmatos_rear):
    
    current_inputs = user_inputs.copy()
    
    THE_SASSI_POSITION = user_inputs.get('Thesi_Sassi')
    Tupos_Anoigmatos = user_inputs.get('Tupos_Anoigmatos')
    DOOR_TYPE = current_inputs.get('Tupos_Portas')
    min_tolerance_door = 40.0
    min_tolerance_opposite = 0.0
    
    

    Pahos_portas = PAHOS_PORTAS_CONST
    Platos_freatiou = user_inputs['Platos_freatiou']
    Vathos_freatiou = user_inputs['Vathos_freatiou']
    Travel = user_inputs['Diadromi_Anelkystira']
    Rated_weight = user_inputs['Onomasthiko_Varos']
    Speed = user_inputs['Taxytita_Anelkystira']
    Vathos_puthmena = user_inputs['Vathos_Puthmena'] 
    Ipsos_telikou_orofou = user_inputs['Ypsos_Telikou_Orofou']


    solver.add(pahos_sthrigmatos_door_var >= DOOR_SIDE_BRACKET['Pahos_Min'])
    solver.add(pahos_sthrigmatos_door_var <= DOOR_SIDE_BRACKET['Pahos_Max'])
    solver.add(pahos_sthrigmatos_opp_var >= OPPOSITE_SIDE_BRACKET['Pahos_Min'])
    solver.add(pahos_sthrigmatos_opp_var <= OPPOSITE_SIDE_BRACKET['Pahos_Max'])



    muth_odhgou_door = odhgoi_data['h1'] # ΕΝΗΜΕΡΩΣΗ: ΟΡΙΖΟΥΜΕ apostasi_toixou_odhgou_y1 κλπ.. την απόσταση από τον τοίχο μέχρι την βάση του στηρίγματος, δηλαδγ χωρίς την μύτη
    muth_odhgou_opposite = odhgoi_data['h1']
    pahos_sthrigmatos_door = pahos_sthrigmatos_door_var
    pahos_sthrigmatos_opposite = pahos_sthrigmatos_opp_var

    solver.add(Emvadon_thalamou  ==  Platos_thalamou * Vathos_Thalamou)
    
    
    MIN_DGC = sassi_data['Distance_guiderail_cabin_min']
    MAX_DGC = sassi_data['Distance_Guiderail_cabin']
    
    MIN_DGW = sassi_data['Distance_wall_guiderail_min']
    MAX_DGW = sthrigma_data['max_wgd']

    solver.add(Apostasi_thalamou_odhgou >= MIN_DGC)
    solver.add(Apostasi_thalamou_odhgou <= MAX_DGC)
    # Όριο από το Σασί
    solver.add(Apostasi_toixou_odhgou_x >= sassi_data['Distance_wall_guiderail_min'])

    # Όρια από το Στήριγμα
    solver.add(Apostasi_toixou_odhgou_x >= sthrigma_data['min_wgd'])
    solver.add(Apostasi_toixou_odhgou_x <= sthrigma_data['max_wgd'])
    solver.add(Platos_thalamou <= Platos_freatiou - Apostasi_thalamou_odhgou - Apostasi_toixou_odhgou_x - Apostasi_thalamou_toixou_x)
    solver.add(Vathos_Thalamou <= Vathos_freatiou - Apostasi_thalamou_toixou_y - Apostasi_lampa_y)
    solver.add(Vathos_freatiou >= Anoigma_odhgwn_const + muth_odhgou_door + muth_odhgou_opposite + Apostasi_toixou_odhgou_y_1 + Apostasi_toixou_odhgou_y_2 + pahos_sthrigmatos_door + pahos_sthrigmatos_opposite)
    

    if DOOR_TYPE == 'Αυτόματη':
        required_opening = CO_portas
        solver.add(Platos_thalamou >= required_opening)
 
         
        if Tupos_Anoigmatos == 'Πλαϊνό':
            solver.add(Platos_freatiou >= min_tolerance_door + G_portas + required_opening + 120 + min_tolerance_opposite) # 120 είναι το μήκος της κολώνας

            if THE_SASSI_POSITION == 'Αριστερά':
                solver.add(Apostasi_ar_lampa >= G_portas + min_tolerance_door)
                solver.add(Apostasi_dek_lampa >= 120 + min_tolerance_opposite) # 120 είναι το ελάχιστο μήκος της κολώνας

            elif THE_SASSI_POSITION == 'Δεξιά':
                solver.add(Apostasi_dek_lampa >= G_portas + min_tolerance_door)
                solver.add(Apostasi_ar_lampa >= 120 + min_tolerance_opposite)

    
    else: # Ημιαυτόματη πόρτα
        required_opening = anoigma_portas
        solver.add(Platos_thalamou >= required_opening) 
        solver.add(required_opening <= Platos_freatiou - Apostasi_ar_lampa - Apostasi_dek_lampa)

 
    
    solver.add(Apostasi_thalamou_toixou_y >= CONSTANT_rules['Apostasi_thalamou_toixou_y_min'])
    solver.add(Apostasi_thalamou_toixou_x >= CONSTANT_rules['Apostasi_thalamou_toixou_x_min'] )
    

    Emvadon_guro = (Apostasi_thalamou_odhgou + Apostasi_toixou_odhgou_x) * Vathos_freatiou + Apostasi_thalamou_toixou_y * Platos_thalamou + Apostasi_thalamou_toixou_x * Vathos_freatiou + Apostasi_lampa_y * Platos_freatiou
    threshold = 190.0
    combined_apostasi = Apostasi_toixou_odhgou_y_1 + muth_odhgou_door + pahos_sthrigmatos_door
   
    
    
    Is_Y1_SEMI_Large = Bool('Is_Y1_Large')
    solver.add(Is_Y1_SEMI_Large == (combined_apostasi > 190.0))
    

    Large_Y_SEMI_Constraints = And(
    Apostasi_toixou_odhgou_y_1 == Apostasi_toixou_odhgou_y_2,   
    pahos_sthrigmatos_door == pahos_sthrigmatos_opposite, 
    muth_odhgou_door == muth_odhgou_opposite,
    Apostasi_toixou_odhgou_y_1 == (Vathos_freatiou - Anoigma_odhgwn_const - muth_odhgou_door - muth_odhgou_opposite - 2*pahos_sthrigmatos_door)/2 
    )
    

    Small_Y_SEMI_Constraints = And(
    Apostasi_toixou_odhgou_y_1 == Apostasi_toixou_odhgou_y_2,
    pahos_sthrigmatos_door == pahos_sthrigmatos_opposite,
    muth_odhgou_door == muth_odhgou_opposite,
    Apostasi_toixou_odhgou_y_1 == 0
    )


    Is_Y1_AUTO_Large = Bool('Is_Y1_AUTO_Large')
    solver.add(Is_Y1_AUTO_Large == ((combined_apostasi - Pahos_portas) > 190.0))

    Large_Y_AUTO_Constraints = And(
    Apostasi_toixou_odhgou_y_1 == Apostasi_toixou_odhgou_y_2,
    pahos_sthrigmatos_door == pahos_sthrigmatos_opposite,
    muth_odhgou_door == muth_odhgou_opposite,
    Apostasi_toixou_odhgou_y_1 == (Vathos_freatiou - Pahos_portas - muth_odhgou_door - muth_odhgou_opposite - 2*pahos_sthrigmatos_door)/2
    )

    Small_Y_AUTO_Constraints = And(
    Apostasi_toixou_odhgou_y_1 == (Vathos_freatiou - Anoigma_odhgwn_const - Pahos_portas - muth_odhgou_door - muth_odhgou_opposite - pahos_sthrigmatos_opposite - pahos_sthrigmatos_door),
    Apostasi_toixou_odhgou_y_2 == 0,
    )
    
    
    if DOOR_TYPE == 'Ημιαυτόματη':
        solver.add(Apostasi_lampa_y >= CONSTANT_rules['LAMPA_Y_SEMI_MIN'])
        solver.add(Apostasi_lampa_y <= CONSTANT_rules['LAMPA_Y_SEMI_MAX'])

        solver.add(Implies(Is_Y1_SEMI_Large, Large_Y_SEMI_Constraints))
        solver.add(Implies(Not(Is_Y1_SEMI_Large), Small_Y_SEMI_Constraints))

    elif DOOR_TYPE == 'Αυτόματη':
        solver.add(Apostasi_lampa_y == Pahos_portas + CONSTANT_rules['LAMPA_Y_AUTO'])
      
        solver.add(Implies(Is_Y1_AUTO_Large, Large_Y_AUTO_Constraints))
        solver.add(Implies(Not(Is_Y1_AUTO_Large), Small_Y_AUTO_Constraints))