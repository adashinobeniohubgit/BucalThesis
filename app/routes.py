from flask import Blueprint, render_template, redirect, request, url_for, session, flash
from app.models import User, Enrollment  # Make sure to import your User model instead of or alongside myTask
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

# Enrollment View
@main_bp.route("/enrollment", methods=['GET', 'POST'])
def enrollment():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))

    if request.method == 'POST':
        f = request.form

        # Parse birthdate safely (empty string -> None)
        birthdate_str = f.get('birthdate')
        birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date() if birthdate_str else None

        # Parse age safely
        age_str = f.get('age')
        age = int(age_str) if age_str else None

        new_enrollment = Enrollment(
            user_id=session['user_id'],

            school_year=f.get('schoolYear'),
            grade_level=f.get('schoolGrade'),
            has_lrn=f.get('has_lrn'),
            is_returning=f.get('is_returning'),

            psa_no=f.get('psa_No'),
            lrn_no=f.get('lrn_No'),
            last_name=f.get('last_name'),
            first_name=f.get('first_name'),
            middle_name=f.get('middle_name'),
            extension_name=f.get('extension_name'),
            birthdate=birthdate,
            place_of_birth=f.get('place_of_birth'),
            mother_tongue=f.get('mother_tongue'),
            sex=f.get('sex'),
            age=age,

            is_ip=f.get('is_ip'),
            ip_specify=f.get('ip_specify'),

            is_4ps=f.get('is_4ps'),
            fourps_id=f.get('fourps_id'),

            with_disability=f.get('with_disability'),
            disability_type=','.join(f.getlist('disability_type')),

            current_house_no=f.get('current_house_no'),
            current_street=f.get('current_street'),
            current_barangay=f.get('current_barangay'),
            current_city=f.get('current_city'),
            current_province=f.get('current_province'),
            current_country=f.get('current_country'),
            current_zip=f.get('current_zip'),

            same_as_current=f.get('same_as_current'),
            permanent_house_no=f.get('permanent_house_no'),
            permanent_street=f.get('permanent_street'),
            permanent_barangay=f.get('permanent_barangay'),
            permanent_city=f.get('permanent_city'),
            permanent_province=f.get('permanent_province'),
            permanent_country=f.get('permanent_country'),
            permanent_zip=f.get('permanent_zip'),

            balik_aral_grade_level=f.get('balik_aral_grade_level'),
            balik_aral_last_school_attended=f.get('balik_aral_last_school_attended'),
            balik_aral_last_school_year_completed=f.get('balik_aral_last_school_year_completed'),
            balik_school_id=f.get('balik_school_id'),

            learning_modality=','.join(f.getlist('learning_modality')),
        )

        db.session.add(new_enrollment)
        db.session.commit()

        flash('Enrollment saved successfully!', 'success')
        return redirect(url_for('main.enrollment'))

    return render_template('enrollment.html')


@main_bp.route("/grades")
def grades():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    return render_template('grades.html')