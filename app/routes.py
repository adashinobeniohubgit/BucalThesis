from flask import Blueprint, render_template, redirect, request, url_for, session, flash
from app.models import User, Enrollment # Make sure to import your User model instead of or alongside myTask
from app import db
from datetime import datetime 

main_bp = Blueprint('main', __name__)


@main_bp.route("/login", methods=['GET', 'POST'])
def login():
    # If the user is already logged in, skip the login page and send them to dashboard
    if 'user_id' in session:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Query the database for the user
        user = User.query.filter_by(username=username).first()

        # Check if user exists and password matches
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            flash('Login successful!', 'success')
            return redirect(url_for('main.index'))
        else:
            flash('Invalid username or password.', 'danger')

    return render_template('login.html')

@main_bp.route("/logout")
def logout():
    session.clear()  # Wipes out the login session completely
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.login'))


# Dashboard/Base View
@main_bp.route("/")
def index():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
        
    return render_template('dashboard.html', username=session['username'])

@main_bp.route("/test_signatures")
def test_signatures():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))

    enrollments = Enrollment.query.order_by(Enrollment.id.desc()).all()
    return render_template('test_signatures.html', enrollments=enrollments)

# Enrollment View
@main_bp.route("/enrollment", methods=['GET', 'POST'])
def enrollment():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))

    if request.method == 'POST':
        try:
            # Handle list inputs (checkboxes)
            disabilities_list = request.form.getlist('disabilities')
            modalities_list = request.form.getlist('distance_learning_modalities')

            # Parse birthdate
            birthdate_str = request.form.get('birthdate')
            birthdate_val = datetime.strptime(birthdate_str, '%Y-%m-%d').date() if birthdate_str else None

            # Parse date signed
            date_signed_str = request.form.get('date_signed')
            date_signed_val = None
            if date_signed_str:
                try:
                    date_signed_val = datetime.strptime(date_signed_str, '%Y-%m-%d').date()
                except ValueError:
                    # Alternative format fallback (e.g., MM/DD/YYYY)
                    date_signed_val = datetime.strptime(date_signed_str, '%m/%d/%Y').date()

            # Create new record
            new_enrollment = Enrollment(
                school_year=request.form.get('school_year'),
                grade_level=request.form.get('grade_level'),
                has_lrn=request.form.get('has_lrn'),
                is_returning=request.form.get('is_returning'),
                psa_birth_cert_no=request.form.get('psa_birth_cert_no'),
                lrn_no=request.form.get('lrn_no'),
                last_name=request.form.get('last_name'),
                first_name=request.form.get('first_name'),
                middle_name=request.form.get('middle_name'),
                extension_name=request.form.get('extension_name'),
                birthdate=birthdate_val,
                birth_place=request.form.get('birth_place'),
                sex=request.form.get('sex'),
                age=request.form.get('age'),
                mother_tongue=request.form.get('mother_tongue'),
                is_ip=request.form.get('is_ip'),
                ip_community=request.form.get('ip_community'),
                is_4ps=request.form.get('is_4ps'),
                ps_4id_no=request.form.get('4ps_id_no'),
                is_lwd=request.form.get('is_lwd'),
                disabilities=", ".join(disabilities_list),
                current_house_no=request.form.get('current_house_no'),
                current_street_name=request.form.get('current_street_name'),
                current_barangay=request.form.get('current_barangay'),
                current_municipality_city=request.form.get('current_municipality_city'),
                current_province=request.form.get('current_province'),
                current_country=request.form.get('current_country'),
                current_zip_code=request.form.get('current_zip_code'),
                same_address=request.form.get('same_address'),
                perm_house_no=request.form.get('perm_house_no'),
                perm_street_name=request.form.get('perm_street_name'),
                perm_barangay=request.form.get('perm_barangay'),
                perm_municipality_city=request.form.get('perm_municipality_city'),
                perm_province=request.form.get('perm_province'),
                perm_country=request.form.get('perm_country'),
                perm_zip_code=request.form.get('perm_zip_code'),
                father_last_name=request.form.get('father_last_name'),
                father_first_name=request.form.get('father_first_name'),
                father_middle_name=request.form.get('father_middle_name'),
                father_contact_number=request.form.get('father_contact_number'),
                mother_maiden_last_name=request.form.get('mother_maiden_last_name'),
                mother_maiden_first_name=request.form.get('mother_maiden_first_name'),
                mother_maiden_middle_name=request.form.get('mother_maiden_middle_name'),
                mother_maiden_contact_number=request.form.get('mother_maiden_contact_number'),
                legal_guardian_last_name=request.form.get('legal_guardian_last_name'),
                legal_guardian_first_name=request.form.get('legal_guardian_first_name'),
                legal_guardian_middle_name=request.form.get('legal_guardian_middle_name'),
                legal_guardian_contact_number=request.form.get('legal_guardian_contact_number'),
                last_grade_completed=request.form.get('last_grade_completed'),
                last_school_year_completed=request.form.get('last_school_year_completed'),
                last_school_attended=request.form.get('last_school_attended'),
                school_id=request.form.get('school_id'),
                semester=request.form.get('semester'),
                track=request.form.get('track'),
                strand=request.form.get('strand'),
                distance_learning_modalities=", ".join(modalities_list),
                signature_data=request.form.get('signature_data'),
                parent_guardian_name=request.form.get('parent_guardian_name'),
                date_signed=date_signed_val
            )

            db.session.add(new_enrollment)
            db.session.commit()

            flash('Enrollment application submitted successfully!', 'success')
            return redirect(url_for('main.enrollment'))

        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred while saving the data: {str(e)}', 'danger')
    return render_template('enrollment.html')


@main_bp.route("/grades")
def grades():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    
    return render_template('grades.html')