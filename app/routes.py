from flask import Blueprint, render_template, redirect, request, url_for, session, flash, jsonify
from app.models import User, Enrollment, YearlyMetric, CalendarEvent # Make sure to import your User model instead of or alongside myTask
from app import db
from datetime import datetime 
import pandas as pd
from sklearn.linear_model import LinearRegression

main_bp = Blueprint('main', __name__)

LOCK_BOUNDARY_YEAR = 2024
SCHOOL_YEAR_ROLLOVER_MONTH = 6

METRIC_FIELDS = [
    'enrollee_count', 'promotion_rate', 'cohort_survival_rate',
    'completion_rate', 'transition_rate', 'dropout_rate',
    'graduation_rate', 'retention_rate',
]

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

def get_current_start_year():

    # for testing date
    # today = datetime(2027, 6, 1)

    today = datetime.utcnow()
    return today.year if today.month >= SCHOOL_YEAR_ROLLOVER_MONTH else today.year - 1
 
 
def ensure_current_school_year_metric():
    latest = get_current_start_year()
 
    existing = {m.school_year.replace(' ', '') for m in YearlyMetric.query.all()}
 
    for start_year in range(LOCK_BOUNDARY_YEAR + 1, latest + 1):
        label = f"{start_year}-{start_year + 1}"
        if label not in existing:
            db.session.add(YearlyMetric(school_year=label))
 
    db.session.commit()

@main_bp.route("/metrics/<int:metric_id>/update", methods=['POST'])
def update_metric(metric_id):
    if 'user_id' not in session:
        return {'error': 'Unauthorized'}, 401
 
    metric = YearlyMetric.query.get_or_404(metric_id)
 
    
    start_year = int(metric.school_year.split('-')[0].strip())
    if start_year <= LOCK_BOUNDARY_YEAR:
        return {'error': 'This school year is locked and cannot be edited.'}, 403
 
    data = request.get_json(silent=True) or {}
    for field in METRIC_FIELDS:
        if field in data:
            setattr(metric, field, data[field])
 
    db.session.commit()
    return {'success': True}

@main_bp.route("/")
def index():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))

    ensure_current_school_year_metric()
    metrics = YearlyMetric.query.order_by(YearlyMetric.school_year.desc()).all()
        
    all_metrics_asc = YearlyMetric.query.order_by(YearlyMetric.school_year.asc()).all()
    data = []
    for m in all_metrics_asc:
        data.append({
            'school_year': m.school_year,
            'enrollee_count': m.enrollee_count,
            'promotion_rate': m.promotion_rate,
            'cohort_survival_rate': m.cohort_survival_rate,
            'completion_rate': m.completion_rate,
            'transition_rate': m.transition_rate,
            'dropout_rate': m.dropout_rate,
            'graduation_rate': m.graduation_rate,
            'retention_rate': m.retention_rate
        })
    
    df = pd.DataFrame(data)
    pred_next_year = None
    r2_score_val = None
    
    if not df.empty:
        df_clean = df[(df['enrollee_count'] > 0) & (df['promotion_rate'] > 0)].copy()
        
        df_clean['next_enrollee_count'] = df_clean['enrollee_count'].shift(-1)
        train_df = df_clean.dropna(subset=['next_enrollee_count'])
        
        features = [
            'enrollee_count', 'promotion_rate', 'cohort_survival_rate', 'completion_rate',
            'transition_rate', 'dropout_rate', 'graduation_rate', 'retention_rate'
        ]
        
        if len(train_df) > 0:
            X = train_df[features]
            y = train_df['next_enrollee_count']
            
            model = LinearRegression()
            model.fit(X, y)
            
            r2_score_val = round(float(model.score(X, y)), 4)
            
            latest_record = df.iloc[-1]
            if latest_record['promotion_rate'] == 0 and len(df) > 1:
                latest_features = df.iloc[-2][features].values.reshape(1, -1)
            else:
                latest_features = latest_record[features].values.reshape(1, -1)
                
            prediction = model.predict(latest_features)[0]
            pred_next_year = round(float(prediction))

    return render_template(
        'dashboard.html', 
        username=session['username'], 
        metrics=metrics, 
        pred_next_year=pred_next_year,
        r2_score=r2_score_val
    )

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
                four_ps_id_no=request.form.get('four_ps_id_no'),
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

# Enrolled Student View
@main_bp.route("/enrolled")
def enrolled():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    
    students = Enrollment.query.order_by(Enrollment.id.desc()).all()

    # Display number of enrollees in terminal for testing
    # print(f"DEBUG: found {len(students)} enrollments")

    return render_template('enrolled.html', students=students)

@main_bp.route("/enrolled/<int:student_id>")
def student_detail(student_id):
    if 'user_id' not in session:
        return redirect(url_for('main_login'))

    student = Enrollment.query.get_or_404(student_id)
    return render_template('student.html', student=student)


# Grade View
@main_bp.route("/grades")
def grades():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    
    return render_template('grades.html')

# Calendar View
@main_bp.route("/calendar")
def calendar():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))

    return render_template('calendar.html')


CALENDAR_TAGS = {'holiday', 'event', 'exam'}
 
 
def _parse_calendar_payload(data):
    """Validate and clean the JSON body. Returns (values, error)."""
    tag = (data.get('tag') or '').strip().lower()
    if tag not in CALENDAR_TAGS:
        return None, 'Invalid tag.'
 
    try:
        event_date = datetime.strptime(data.get('date', ''), '%Y-%m-%d').date()
    except ValueError:
        return None, 'Invalid date.'
 
    description = (data.get('description') or '').strip()[:500]
    return {'event_date': event_date, 'tag': tag, 'description': description}, None
 
 
@main_bp.route("/calendar/events", methods=['GET', 'POST'])
def calendar_events():
    if 'user_id' not in session:
        return {'error': 'Unauthorized'}, 401
 
    if request.method == 'GET':
        events = CalendarEvent.query.order_by(CalendarEvent.event_date.asc(), CalendarEvent.id.asc()).all()
        return jsonify([e.to_dict() for e in events])
 
    values, error = _parse_calendar_payload(request.get_json(silent=True) or {})
    if error:
        return {'error': error}, 400
 
    event = CalendarEvent(**values)
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201
 
 
@main_bp.route("/calendar/events/<int:event_id>", methods=['PUT', 'DELETE'])
def calendar_event_detail(event_id):
    if 'user_id' not in session:
        return {'error': 'Unauthorized'}, 401
 
    event = CalendarEvent.query.get_or_404(event_id)
 
    if request.method == 'DELETE':
        db.session.delete(event)
        db.session.commit()
        return {'success': True}
 
    values, error = _parse_calendar_payload(request.get_json(silent=True) or {})
    if error:
        return {'error': error}, 400
 
    event.event_date = values['event_date']
    event.tag = values['tag']
    event.description = values['description']
    db.session.commit()
    return jsonify(event.to_dict())


@main_bp.route("/linkagefiles")
def linkagefiles():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    
    return render_template('linkagefiles.html')