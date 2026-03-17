import mysql.connector

def connect_db():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='6970264073Ar',
            database='minosltd',
            charset='utf8mb4'
        )
        if connection.is_connected():
         connection.cursor().execute("USE minosltd")
         print("Connection to the database was successful.")
         return connection
        else:
         print("Failed to connect to the database.")
         return None

    except mysql.connector.Error as err:
        # Αν υπάρξει σφάλμα (π.χ., λάθος κωδικός, λάθος host)
        print(f" Σφάλμα κατά τη σύνδεση στη βάση δεδομένων: {err}")
        return None



# ανακτά όλες τις στήλες για ένα συγκεκριμένο εξάρτημα
def fetch_component_data(db_connection, table_name, component_id, id_column_name):
    if db_connection is None:
        print("Σφάλμα: Η σύνδεση με τη βάση δεδομένων δεν είναι ενεργή.")
        return None
    try:
        cursor = db_connection.cursor(dictionary=True, buffered=True)
        query = f"SELECT * FROM {table_name} WHERE {id_column_name} = %s"
        cursor.execute(query, (component_id,))
        
        result = cursor.fetchone()
        cursor.close()
        return result
        
    except Exception as e:
        print(f"Σφάλμα ανάκτησης δεδομένων για {table_name} / {component_id}: {e}")
        return None

# ανακτά όλα τα διαθέσιμα IDs από έναν πίνακα    
def fetch_all_component_ids(db, table_name, id_column):
    cursor = None
    try:
        cursor = db.cursor(buffered=True)
        
        # Εφαρμόζουμε ταξινόμηση ΜΟΝΟ αν πρόκειται για οδηγούς
        # έτσι δεν θα σκάσει στους άλλους πίνακες που δεν έχουν στήλη 'h1'
        if table_name == 'Odhgoi':
            query = f"SELECT {id_column} FROM {table_name} ORDER BY h1 DESC"
        else:
            query = f"SELECT {id_column} FROM {table_name}"
            
        cursor.execute(query)
        results = cursor.fetchall()
        return [row[0] for row in results]
    except Exception as e:
        print(f"Error fetching IDs from {table_name}: {e}")
        return []
    finally:
        if cursor:
            cursor.close()

def fetch_suitable_stirigma(db, min_distance_required):
    
    # Η μεταβλητή Python για την απόσταση
    MIN_DIST_REQUIRED = min_distance_required 
    
    # Προσθέτουμε τον τύπο που αναζητούμε
    BRACKET_TYPE = 'Normal' 
    
    cursor = db.cursor(dictionary=True)
    
    # ΠΡΟΣΟΧΗ: Χρησιμοποιούμε %s για τους placeholders
    query = """
        SELECT 
            * FROM 
            Sthrigmata
        WHERE 
            Tupos_Stirigmatos = %s 
            AND
            Max_apostasi_toixou >= %s 
        ORDER BY
            Max_apostasi_toixou ASC 
        LIMIT 1
    """
    
    try:
        # Εκτέλεση με ασφαλή τρόπο (Περνάμε τις τιμές ως tuple)
        # ΠΡΟΣΟΧΗ στη σειρά: Tupos_Stirigmatos, μετά Max_apostasi_toixou
        cursor.execute(query, (BRACKET_TYPE, MIN_DIST_REQUIRED))
        result = cursor.fetchone()
        cursor.close()
        return result
        
    except Exception as e:
        print(f"Σφάλμα κατά την επιλογή στηρίγματος (MySQL): {e}")
        cursor.close()
        return None
    

    
def fetch_max_wall_bracket(db, apostasi_min, apostasi_max):

    
    # Η μεταβλητή Python που θα περάσουμε στο execute
    MIN_PERMITTED_LENGTH = apostasi_min
    MAX_PERMITTED_LENGTH = apostasi_max
    
    
    cursor = db.cursor(dictionary=True, buffered=True)
    
   
    query = """
        SELECT * FROM Sthrigmata
        WHERE Tupos_Stirigmatos = 'Wall'
          AND Max_apostasi_toixou >= %s 
        ORDER BY Max_apostasi_toixou ASC
        LIMIT 1
    """
    
    try:
        
        cursor.execute(query, (MIN_PERMITTED_LENGTH,))
        result = cursor.fetchone()
        cursor.close()
        return result
        
    except Exception as e:
        print(f"Σφάλμα κατά την επιλογή Wall Bracket (MySQL): {e}")
        cursor.close()
        return None
    



def fetch_suitable_door_ids(db_connection, required_opening, door_type, arithmos_fyllon=None, tupos_anoigmatos=None):
    table_name = 'Portes' 
    door_ids = []
    cursor = None
    
    try:
        cursor = db_connection.cursor(buffered=True)
        
       
        query = f"""
        SELECT Tupos_Portas_ID 
        FROM {table_name}
        WHERE CO_portas = %s 
          AND Tupos = %s
        """
        params = [required_opening, door_type]

        # Πρόσθετα φίλτρα ΜΟΝΟ αν η πόρτα είναι Αυτόματη
        if door_type == 'Αυτόματη':
            if arithmos_fyllon is not None:
                query += " AND Arithmos_fyllon = %s"
                params.append(arithmos_fyllon)
            
            if tupos_anoigmatos is not None:
                query += " AND Tupos_Anoigmatos = %s"
                params.append(tupos_anoigmatos)
        
        query += ";"
        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        
        return [row[0] for row in results]
        
    except Exception as e:
        print(f"SQL Error in Doors: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
    



def fetch_sassi_by_weight(db, atoma_input):
    cursor = None
    try:
        # Χρήση buffered=True για να μην μπερδεύεται η MySQL
        cursor = db.cursor(dictionary=True, buffered=True)
        query = "SELECT Sassi_ID FROM Sassi WHERE Atoma_limit >= %s ORDER BY Atoma_limit ASC"
        cursor.execute(query, (atoma_input,))
        results = cursor.fetchall()
        return [row['Sassi_ID'] for row in results]
    except Exception as e:
        print(f"SQL Error in fetch_sassi_by_weight: {e}")
        return [] # Επιστρέφει άδεια λίστα, όχι string
    finally:
        if cursor:
            cursor.close()


def fetch_bracket_by_id(db, bracket_id):
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM Sthrigmata WHERE Sthrigma_ID = %s"
    cursor.execute(query, (bracket_id,))
    result = cursor.fetchone()
    cursor.close()
    return result
