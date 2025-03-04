import requests
from flask import Flask, jsonify, request, send_file, make_response, session
from flask_cors import CORS
from main import ProductivityTracker
import threading
import io
from bson.objectid import ObjectId
import logging
import json
import zipfile
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('productivity_api')

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Required for session management

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Initialize the tracker without employee_id
tracker = ProductivityTracker()

# endpoint to set employee_id
@app.route('/verify-token', methods=['POST'])
def verify_token():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                "status": "error",
                "message": "Token is required"
            }), 400
            
        # Call Node.js backend to verify token
        response = requests.post('http://localhost:5001/api/auth/verify-token', 
                                json={'token': token})
        
        if response.status_code != 200:
            return jsonify({
                "status": "error",
                "message": "Invalid token"
            }), 401
        
        # Extract employee_id from verification response
        user_data = response.json()
        employee_id = user_data.get('employeeId')
        
        if not employee_id:
            return jsonify({
                "status": "error",
                "message": "User does not have an employee ID"
            }), 400
            
        # Set the employee_id in the tracker instance
        tracker.set_employee_id(employee_id)
        
        # Store in session for persistence
        session['employee_id'] = employee_id
        
        return jsonify({
            "status": "success",
            "message": f"Verified as employee {employee_id}"
        })
    except Exception as e:
        logger.error(f"Error in token verification: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# Middleware to check for employee_id
@app.before_request
def check_authentication():
    # Skip for verification and test endpoints
    if request.path in ['/verify-token', '/test'] or request.method == 'OPTIONS':
        return
        
    # First check if employee_id is in session (for persistence between requests)
    employee_id = session.get('employee_id')
    
    # If not in session, check authorization header
    if not employee_id:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "status": "error",
                "message": "Not authenticated. Please login first."
            }), 401
            
        token = auth_header.split(' ')[1]
        
        # Verify token with Node.js backend
        try:
            response = requests.post('http://localhost:5001/api/auth/verify-token', 
                                    json={'token': token})
            
            if response.status_code != 200:
                return jsonify({
                    "status": "error",
                    "message": "Invalid token"
                }), 401
                
            # Extract employee_id from verification response
            user_data = response.json()
            employee_id = user_data.get('employeeId')
            
            if not employee_id:
                return jsonify({
                    "status": "error",
                    "message": "User does not have an employee ID"
                }), 400
                
            # Set the employee_id in the tracker instance
            tracker.set_employee_id(employee_id)
            
            # Store in session for persistence
            session['employee_id'] = employee_id
                
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}", exc_info=True)
            return jsonify({
                "status": "error",
                "message": "Authentication error"
            }), 500
    
    # If in session but not set in tracker (e.g., after server restart)
    if employee_id and not tracker.employee_id:
        tracker.set_employee_id(employee_id)
        logger.debug(f"Restored employee_id from session: {employee_id}")
    
    # If still not set, return error
    if not tracker.employee_id:
        return jsonify({
            "status": "error",
            "message": "Not authenticated. Please login first."
        }), 401
    

@app.route('/daily-summary')
def get_daily_summary():
    logger.info("API CALL: /daily-summary")
    try:
        logger.debug("Fetching daily summary from tracker")
        summary = tracker.get_daily_summary()
        
        window_times = [
            [
                window_info['window'],
                window_info['active_time'],
                window_info['productive']
            ]
            for window_info in summary.get('productive_windows', [])
        ]

        response_data = {
            'totalProductiveTime': summary['total_productive_time'],
            'totalUnproductiveTime': summary['total_unproductive_time'],
            'productivityScore': summary.get('productivity_score', 0),
            'windowTimes': window_times
        }
        
        logger.debug(f"Daily summary response: {response_data}")
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Error in daily-summary: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    
@app.route('/test')
def test():
    logger.info("API CALL: /test")
    logger.debug("Test endpoint called - server is running")
    return jsonify({"status": "Server is running"})

@app.route('/start-session', methods=['POST'])
def start_session():
    logger.info("API CALL: /start-session")
    try:
        data = request.get_json()
        logger.debug(f"Starting session with name: {data.get('session_name')}")
        result = tracker.start_session(data['session_name'])
        logger.debug(f"Session start result: {result}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in start-session: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/download-report/<report_id>')
def download_report(report_id):
    logger.info(f"API CALL: /download-report/{report_id}")
    try:
        logger.debug(f"Fetching report with ID: {report_id}")
        report = tracker.get_report(report_id)
        if not report:
            logger.warning(f"Report with ID {report_id} not found")
            return jsonify({
                "status": "error",
                "message": "Report not found"
            }), 404
            
        logger.debug(f"Report found, preparing download: {report.get('filename')}")
        response = make_response(report['data'])
        response.headers['Content-Type'] = report['content_type']
        response.headers['Content-Disposition'] = f'attachment; filename={report["filename"]}'
        return response
        
    except Exception as e:
        logger.error(f"Error in download-report: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "Failed to download report"
        }), 500

@app.route('/end-session', methods=['POST'])
def end_session():
    logger.info("API CALL: /end-session")
    try:
        logger.debug("Ending current session")
        result = tracker.end_session()
        logger.debug(f"Session end result: {result}")
        
        # Handle partial success case
        if result.get("status") == "partial":
            logger.warning(f"Session ended with warnings: {result.get('message')}")
            return jsonify(result), 207  # Return partial content status
            
        # Handle standard success
        if result.get("status") == "success" and "report_id" in result:
            return jsonify({
                "status": "success",
                "message": "Session ended successfully",
                "report_id": result["report_id"]
            })
            
        # Handle other results
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in end-session: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": f"Failed to end session: {str(e)}"
        }), 500

@app.route('/current-session')
def get_current_session():
    logger.info("API CALL: /current-session")
    try:
        if not tracker.current_session or not tracker.session_active:
            logger.warning("No active session found")
            return jsonify({
                "status": "error",
                "message": "No active session"
            }), 404
            
        logger.debug("Fetching current session details")
        current_data = {
            "session_name": tracker.current_session.get('name', ''),
            "productive_time": tracker.current_session.get('productive_time', 0),
            "unproductive_time": tracker.current_session.get('unproductive_time', 0),
            "window_details": [
                {
                    "window": window,
                    "active_time": details.get('active_time', 0),
                    "productive": details.get('productive', False)
                }
                for window, details in tracker.current_session.get('window_details', {}).items()
            ]
        }
        
        logger.debug(f"Current session data: {current_data}")
        return jsonify(current_data)
    except Exception as e:
        logger.error(f"Error in current-session: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/privacy-settings', methods=['GET'])
def get_privacy_settings():
    logger.info("API CALL: /privacy-settings")
    try:
        # Get settings from database for specific employee
        settings = tracker.get_privacy_settings()
        logger.debug(f"Retrieved privacy settings: {settings}")
        return jsonify(settings)
    except Exception as e:
        logger.error(f"Error getting privacy settings: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/privacy-settings', methods=['POST'])
def update_privacy_settings():
    logger.info("API CALL: /privacy-settings [POST]")
    try:
        data = request.get_json()
        logger.debug(f"Updating privacy settings: {data}")
        
        # Update settings using the tracker method
        result = tracker.update_privacy_settings(data)
        
        if result.get("status") == "error":
            logger.warning(f"Error updating settings: {result.get('message')}")
            return jsonify(result), 400
            
        logger.debug("Privacy settings updated successfully")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error updating privacy settings: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/delete-data', methods=['POST'])
def delete_user_data():
    logger.info("API CALL: /delete-data")
    try:
        data = request.get_json()
        delete_type = data.get('type', 'all')
        
        # Use the tracker method that filters by employee_id
        result = tracker.delete_user_data(delete_type)
        
        if result.get("status") == "error":
            logger.warning(f"Error deleting data: {result.get('message')}")
            return jsonify(result), 400
            
        logger.debug(f"User data deleted successfully: {delete_type}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error deleting user data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/export-data', methods=['GET'])
def export_user_data():
    logger.info("API CALL: /export-data")
    try:
        # Use the tracker method that filters by employee_id
        result = tracker.export_user_data()
        
        if result.get("status") == "error":
            logger.warning(f"Error exporting data: {result.get('message')}")
            return jsonify(result), 500
            
        # Set up the response
        response = make_response(result["data"])
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Disposition'] = f'attachment; filename={result["filename"]}'
        
        logger.debug("Data export generated successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    logger.info("API CALL: /logout")
    try:
        # Clear the employee ID from session
        session.pop('employee_id', None)
        
        # Reset the tracker's employee_id
        tracker.set_employee_id(None)
        
        logger.debug("User logged out successfully")
        return jsonify({
            "status": "success",
            "message": "Logged out successfully"
        })
    except Exception as e:
        logger.error(f"Error in logout: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting tracking thread...")
    tracking_thread = threading.Thread(target=tracker.update_tracking, daemon=True)
    tracking_thread.start()
    
    logger.info("Starting Flask app on port 5000...")
    app.run(port=5000, debug=True, threaded=True, host='127.0.0.1')