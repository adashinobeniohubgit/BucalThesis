from flask import Blueprint, render_template, redirect, request, url_for, session, flash
from app.models import User  # Make sure to import your User model instead of or alongside myTask
from app import db

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
        school_year = request.form.get('schoolYear')
        grade = request.form.get('schoolGrade')
        if grade == 'other':
            grade = request.form.get('schoolGradeOther')

        # TODO: validate and save to your database here
        # e.g. new_enrollment = Enrollment(school_year=school_year, grade=grade, user_id=session['user_id'])
        # db.session.add(new_enrollment)
        # db.session.commit()

        flash('Enrollment saved successfully!', 'success')
        return redirect(url_for('main.enrollment'))

    return render_template('enrollment.html')

# Grades View
@main_bp.route("/grades")
def grades():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
        
    return render_template('grades.html')