from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False) # Stores the scrambled password
    role = db.Column(db.String(20), default='admin') # e.g., admin, registrar

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    school_year = db.Column(db.String(20))
    grade_level = db.Column(db.String(20))
    has_lrn = db.Column(db.String(5))
    is_returning = db.Column(db.String(5))
    psa_birth_cert_no = db.Column(db.String(50))
    lrn_no = db.Column(db.String(12))

    last_name = db.Column(db.String(100))
    first_name = db.Column(db.String(100))
    middle_name = db.Column(db.String(100))
    extension_name = db.Column(db.String(20))

    birthdate = db.Column(db.Date)
    birth_place = db.Column(db.String(150))
    sex = db.Column(db.String(10))
    age = db.Column(db.Integer)
    mother_tongue = db.Column(db.String(50))

    is_ip = db.Column(db.String(5))
    ip_community = db.Column(db.String(100))
    is_4ps = db.Column(db.String(5))
    ps_4id_no = db.Column(db.String(20))

    is_lwd = db.Column(db.String(5))
    disabilities = db.Column(db.Text)

    current_house_no = db.Column(db.String(50))
    current_street_name = db.Column(db.String(100))
    current_barangay = db.Column(db.String(100))
    current_municipality_city = db.Column(db.String(100))
    current_province = db.Column(db.String(100))
    current_country = db.Column(db.String(100))
    current_zip_code = db.Column(db.String(4))

    same_address = db.Column(db.String(5))
    perm_house_no = db.Column(db.String(50))
    perm_street_name = db.Column(db.String(100))
    perm_barangay = db.Column(db.String(100))
    perm_municipality_city = db.Column(db.String(100))
    perm_province = db.Column(db.String(100))
    perm_country = db.Column(db.String(100))
    perm_zip_code = db.Column(db.String(4))

    father_last_name = db.Column(db.String(100))
    father_first_name = db.Column(db.String(100))
    father_middle_name = db.Column(db.String(100))
    father_contact_number = db.Column(db.String(20))

    mother_maiden_last_name = db.Column(db.String(100))
    mother_maiden_first_name = db.Column(db.String(100))
    mother_maiden_middle_name = db.Column(db.String(100))
    mother_maiden_contact_number = db.Column(db.String(20))

    legal_guardian_last_name = db.Column(db.String(100))
    legal_guardian_first_name = db.Column(db.String(100))
    legal_guardian_middle_name = db.Column(db.String(100))
    legal_guardian_contact_number = db.Column(db.String(20))

    last_grade_completed = db.Column(db.String(5))
    last_school_year_completed = db.Column(db.String(20))
    last_school_attended = db.Column(db.String(150))
    school_id = db.Column(db.String(6))

    semester = db.Column(db.String(20))
    track = db.Column(db.String(100))
    strand = db.Column(db.String(100))

    distance_learning_modalities = db.Column(db.Text)
    signature_data = db.Column(db.Text)

    parent_guardian_name = db.Column(db.String(150))
    date_signed = db.Column(db.Date)

    date_submitted = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Enrollment {self.last_name}, {self.first_name}>'
