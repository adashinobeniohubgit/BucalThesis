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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Top section
    school_year = db.Column(db.String(20))
    grade_level = db.Column(db.String(20))
    has_lrn = db.Column(db.String(5))
    is_returning = db.Column(db.String(5))

    # Learner information
    psa_no = db.Column(db.String(50))
    lrn_no = db.Column(db.String(12))
    last_name = db.Column(db.String(100))
    first_name = db.Column(db.String(100))
    middle_name = db.Column(db.String(100))
    extension_name = db.Column(db.String(20))
    birthdate = db.Column(db.Date)
    place_of_birth = db.Column(db.String(150))
    mother_tongue = db.Column(db.String(100))
    sex = db.Column(db.String(10))
    age = db.Column(db.Integer)

    # IP Community
    is_ip = db.Column(db.String(5))
    ip_specify = db.Column(db.String(150))

    # 4Ps
    is_4ps = db.Column(db.String(5))
    fourps_id = db.Column(db.String(50))

    # Disability
    with_disability = db.Column(db.String(5))
    disability_type = db.Column(db.Text)  # comma-separated list

    # Current Address
    current_house_no = db.Column(db.String(100))
    current_street = db.Column(db.String(150))
    current_barangay = db.Column(db.String(100))
    current_city = db.Column(db.String(100))
    current_province = db.Column(db.String(100))
    current_country = db.Column(db.String(100))
    current_zip = db.Column(db.String(20))

    # Permanent Address
    same_as_current = db.Column(db.String(5))
    permanent_house_no = db.Column(db.String(100))
    permanent_street = db.Column(db.String(150))
    permanent_barangay = db.Column(db.String(100))
    permanent_city = db.Column(db.String(100))
    permanent_province = db.Column(db.String(100))
    permanent_country = db.Column(db.String(100))
    permanent_zip = db.Column(db.String(20))

    # Returning / Transfer learner
    balik_aral_grade_level = db.Column(db.String(50))
    balik_aral_last_school_attended = db.Column(db.String(150))
    balik_aral_last_school_year_completed = db.Column(db.String(20))
    balik_school_id = db.Column(db.String(20))

    # Distance learning modality
    learning_modality = db.Column(db.Text)  # comma-separated list