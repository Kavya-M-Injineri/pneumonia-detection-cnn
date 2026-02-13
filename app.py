from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.middleware.proxy_fix import ProxyFix
from tensorflow.keras.models import load_model
from utils import preprocess_image, predict_result
import os
import werkzeug
import json
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = 'super_secret_medical_key' # Change for production

# Fix for running behind Hugging Face's reverse proxy
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Session cookie settings for Hugging Face Spaces (HTTPS behind proxy)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Configuration
MODEL_PATH = 'models/pneumonia_model.h5'
UPLOAD_FOLDER = 'static/uploads'
REPORTS_FILE = 'data/reports.json'
USERS_FILE = 'data/users.json'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Global variable for model
model = None

# Ensure data directory exists
os.makedirs('data', exist_ok=True)
if not os.path.exists(REPORTS_FILE):
    with open(REPORTS_FILE, 'w') as f:
        json.dump([], f)

# Initialize users.json with default accounts if it doesn't exist
DEFAULT_USERS = {
    'admin': {'password': 'admin123', 'role': 'admin', 'name': 'Dr. House (Admin)'},
    'radiologist': {'password': 'rad123', 'role': 'radiologist', 'name': 'Dr. Wilson'},
    'guest': {'password': 'guest', 'role': 'viewer', 'name': 'Guest Viewer'}
}

if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump(DEFAULT_USERS, f, indent=4)

def load_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except:
        return DEFAULT_USERS

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

def load_inference_model():
    global model
    if os.path.exists(MODEL_PATH):
        print(f"Loading model from {MODEL_PATH}...")
        try:
            model = load_model(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}. Prediction will fail.")

# Login Decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            print(f"[DEBUG] Unauthorized access to {request.path} - Redirecting to login")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Role Decorator
def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] not in roles:
                return "Access Denied: You do not have permission to view this page.", 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
        else:
            username = request.form.get('username')
            password = request.form.get('password')

        users = load_users()
        user = users.get(username)
        print(f"[DEBUG] Login attempt: {username}")
        if user and user['password'] == password:
            print(f"[DEBUG] Login successful for {username}")
            session['user_id'] = username
            session['role'] = user['role']
            session['name'] = user['name']
            
            target = '/dashboard'
            if user['role'] == 'admin':
                target = '/reports'
                
            return jsonify({'success': True, 'redirect': target})
        else:
            print(f"[DEBUG] Login failed for {username}")
            return jsonify({'success': False, 'message': 'Invalid credentials. Please check your username and password.'}), 401
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form
    
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip()
    role = data.get('role', 'radiologist')
    
    if not username or not password or not name:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400
    
    if len(password) < 4:
        return jsonify({'success': False, 'message': 'Password must be at least 4 characters.'}), 400
    
    users = load_users()
    if username in users:
        print(f"[DEBUG] Registration failed: {username} already exists")
        return jsonify({'success': False, 'message': 'Username already exists. Please choose another.'}), 409
    
    # Create new user
    users[username] = {
        'password': password,
        'role': role,
        'name': name
    }
    save_users(users)
    print(f"[DEBUG] User registered successfully: {username} ({role})")
    
    return jsonify({'success': True, 'message': f'Account created for {name}! You can now log in.'})

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=session)

@app.route('/reports')
@login_required
def reports():
    # Load reports
    try:
        with open(REPORTS_FILE, 'r') as f:
            all_reports = json.load(f)
    except:
        all_reports = []
    
    # Filter for non-admins (only see own reports)
    # Admin sees all, Radiologist sees own
    if session['role'] != 'admin':
        display_reports = [r for r in all_reports if r['user'] == session['user_id']]
    else:
        display_reports = all_reports
        
    return render_template('reports.html', reports=display_reports, user=session)

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        filename = werkzeug.utils.secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        if model is None:
            load_inference_model()
            if model is None:
                return jsonify({'error': 'Model not available'}), 500
        
        processed_img = preprocess_image(filepath)
        if processed_img is None:
            return jsonify({'error': 'Failed to process image'}), 500
            
        result = predict_result(model, processed_img)
        
        # Save Report
        report_entry = {
            'id': f"XR-{int(datetime.now().timestamp())}",
            'date': datetime.now().strftime("%Y-%m-%d %H:%M"),
            'user': session['user_id'],
            'radiologist': session['name'],
            'image': filename,
            'diagnosis': result['class'],
            'confidence': f"{result['confidence']*100:.1f}%",
            'pathogen': result['details'].get('pathogen_type', 'N/A')
        }
        
        try:
            with open(REPORTS_FILE, 'r+') as f:
                data = json.load(f)
                data.insert(0, report_entry) # Prepend
                f.seek(0)
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Error saving report: {e}")
            # Continue even if save fails
        
        return jsonify(result)

if __name__ == '__main__':
    load_inference_model()
    # Hugging Face Spaces defaults to port 7860
    port = int(os.environ.get('PORT', 7860))
    app.run(debug=True, host='0.0.0.0', port=port)
