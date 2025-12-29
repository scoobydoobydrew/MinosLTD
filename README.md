Ο πίνακας ου έσβησα από την βάση 



CREATE TABLE Elevator_Designs (
Design_ID INT PRIMARY KEY AUTO_INCREMENT,
Elevator_type VARCHAR(30) NOT NULL,
Elevator_speed DECIMAL(3,1) NOT NULL,
Rated_Weight INT NOT NULL,
Apovaro INT  NOT NULL,
Anartisi_sasi ENUM('Amesi', '1:1', '2:1 panw', '2:1 katw', '4:1'),
Topothesia_emvolou VARCHAR(30) NOT NULL,
-- STOIXEIA FREATIOU
Platos_freatiou INT NOT NULL,
Vathos_freatiou INT NOT NULL,
Vathos_puthmena INT NOT NULL,
Ipsos_tel_orofou INT NOT NULL,
Diadromi_elevator INT NOT NULL,
Arithmos_stasewn INT NOT NULL,
Yliko_freatiou VARCHAR(20) NOT NULL,
Apostasi_ar_lampa INT NOT NULL,
Apostasi_dek_lampa INT NOT NULL,
-- STOIXEIA SASSI
Sassi_ID VARCHAR(50) NOT NULL,
Anoigma_odhgwn INT NOT NULL,
Tupos_odhgou VARCHAR(10) NOT NULL,
Apostasi_toixou_odhgou_x INT NOT NULL,
Apostasi_toixou_odhgou_y_1 INT NOT NULL,
Apostasi_toixou_odhgou_y_2 INT NOT NULL,
Apostasi_thalamou_odhgou INT NOT NULL,
-- STOIXEIA THALAMOU
Platos_thalamou INT NOT NULL,
Vathos_Thalamou INT NOT NULL,
Eks_ipsos_thalamou INT NOT NULL,
Apostasi_thalamou_toixou_x INT NOT NULL,
Apostasi_thalamou_toixou_y INT NOT NULL,
Emvadon_thalamou INT NOT NULL,
-- STOIXEIA EMVOLOU
Tupos_emvolou VARCHAR(20) NOT NULL,
-- Foreign Keys
FOREIGN KEY (Sassi_ID) REFERENCES Sassi(Sassi_ID),
FOREIGN KEY (Tupos_emvolou) REFERENCES Emvola(Tupos_Emvolou),
FOREIGN KEY (Tupos_odhgou) REFERENCES Odhgoi(Tupos_Odhgou)
);





παραμετροι json για το execute 
  "shaftwidth": 3000,
  "shaftdepth": 3000,
  "qLoad": 450,
  "thesi_sassi": "side",
  "anoigma_portas": 800,
  "tupos_portas": "Αυτόματη",
  "arithmos_fyllon": 2,
  "tupos_anoigmatos": "Κεντρικό"
