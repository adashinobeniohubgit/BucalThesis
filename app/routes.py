from flask import Blueprint, render_template, redirect, request
from app.models import myTask
from app import db

main_bp = Blueprint('main', __name__)


# 1. Dashboard/Base View
@main_bp.route("/")
def index():
    return render_template('dashboard.html')

# 2. Enrollment View
@main_bp.route("/enrollment")
def enrollment():
    return render_template('enrollment.html')

# 3. Grades View
@main_bp.route("/grades")
def grades():
    return render_template('grades.html')