# Import required libraries
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



logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Configure logging for detailed tracking and debugging
logging.basicConfig(
    level=logging.DEBUG, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('productivity_api')

# Initialize Flask application
app = Flask(__name__)
app.secret_key = '123VirtuTask'  # Required for session management

# Configure CORS to allow frontend access
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Initialize the productivity tracker without an employee ID
tracker = ProductivityTracker()

@app.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verify user authentication token and set employee ID.

    Expects a JSON payload with a token.
    Returns success/error based on token verification.
    """
    try:
        # Ensure request has JSON data
        data = request.get_json(silent=True)
        if not data or 'token' not in data:
            logger.warning("Token missing in request")
            return jsonify({
                "status": "error",
                "message": "Token is required"
            }), 400

        token = data['token']

        # Call external authentication service
        auth_url = 'http://localhost:5001/api/auth/verify-token'
        try:
            response = requests.post(auth_url, json={'token': token}, timeout=5)
            response.raise_for_status()  # This will raise an error for non-2xx responses
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Failed to reach auth service: {req_err}")
            return jsonify({
                "status": "error",
                "message": "Authentication service unavailable"
            }), 503  # 503: Service Unavailable

        # Check authentication response
        if response.status_code != 200:
            logger.warning(f"Invalid token: {response.text}")
            return jsonify({
                "status": "error",
                "message": "Invalid token"
            }), 401

        # Extract employee ID
        user_data = response.json()
        employee_id = user_data.get('employeeId')

        if not employee_id:
            logger.warning("User does not have an employee ID")
            return jsonify({
                "status": "error",
                "message": "User does not have an employee ID"
            }), 400

        # Set employee ID in session and tracker
        tracker.set_employee_id(employee_id)
        session['employee_id'] = employee_id

        logger.info(f"Token verified for employee {employee_id}")

        return jsonify({
            "status": "success",
            "message": f"Verified as employee {employee_id}"
        })

    except Exception as e:
        logger.error(f"Unexpected error in token verification: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500


def verify_token():
    """
    Verify user authentication token and set employee ID.

    Expects a JSON payload with a token.
    Returns success/error based on token verification.
    """
    try:
        # Ensure request has JSON data
        data = request.get_json(silent=True)
        if not data or 'token' not in data:
            logger.warning("Token missing in request")
            return jsonify({
                "status": "error",
                "message": "Token is required"
            }), 400

        token = data['token']

        # Call external authentication service
        auth_url = 'http://localhost:5001/api/auth/verify-token'
        try:
            response = requests.post(auth_url, json={'token': token}, timeout=5)
            response.raise_for_status()  # This will raise an error for non-2xx responses
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Failed to reach auth service: {req_err}")
            return jsonify({
                "status": "error",
                "message": "Authentication service unavailable"
            }), 503  # 503: Service Unavailable

        # Check authentication response
        if response.status_code != 200:
            logger.warning(f"Invalid token: {response.text}")
            return jsonify({
                "status": "error",
                "message": "Invalid token"
            }), 401

        # Extract employee ID
        user_data = response.json()
        employee_id = user_data.get('employeeId')

        if not employee_id:
            logger.warning("User does not have an employee ID")
            return jsonify({
                "status": "error",
                "message": "User does not have an employee ID"
            }), 400

        # Set employee ID in session and tracker
        tracker.set_employee_id(employee_id)
        session['employee_id'] = employee_id

        logger.info(f"Token verified for employee {employee_id}")

        return jsonify({
            "status": "success",
            "message": f"Verified as employee {employee_id}"
        })

    except Exception as e:
        logger.error(f"Unexpected error in token verification: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500

# Authentication Middleware
@app.before_request
def check_authentication():
    """
    Middleware to check authentication before processing requests
    Validates employee ID in session or via authorization header
    """
    # Skip authentication for specific routes
    if request.path in ['/verify-token', '/test'] or request.method == 'OPTIONS':
        return
    
    # Check for employee ID in session
    employee_id = session.get('employee_id')
    
    # Verify authentication via authorization header if not in session
    if not employee_id:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "status": "error",
                "message": "Not authenticated. Please login first."
            }), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token with external authentication service
            response = requests.post('http://localhost:5001/api/auth/verify-token', 
                                     json={'token': token})
            
            if response.status_code != 200:
                return jsonify({
                    "status": "error",
                    "message": "Invalid token"
                }), 401
            
            # Extract and set employee ID
            user_data = response.json()
            employee_id = user_data.get('employeeId')
            
            if not employee_id:
                return jsonify({
                    "status": "error",
                    "message": "User does not have an employee ID"
                }), 400
            
            tracker.set_employee_id(employee_id)
            session['employee_id'] = employee_id
                
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}", exc_info=True)
            return jsonify({
                "status": "error",
                "message": "Authentication error"
            }), 500
    
    # Ensure employee ID is set in tracker after session restoration
    if employee_id and not tracker.employee_id:
        tracker.set_employee_id(employee_id)
        logger.debug(f"Restored employee_id from session: {employee_id}")
    
    # Final authentication check
    if not tracker.employee_id:
        return jsonify({
            "status": "error",
            "message": "Not authenticated. Please login first."
        }), 401

# Application Routes
@app.route('/daily-summary')
def get_daily_summary():
    """
    Retrieve daily productivity summary
    Returns total productive/unproductive time and productivity score
    """
    logger.info("API CALL: /daily-summary")
    try:
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
    

@app.route('/productivity-score/<employee_id>', methods=['GET'])
def get_productivity_score(employee_id):
    """
    Get the productivity score for a specific employee
    """
    logger.info(f"API CALL: /productivity-score/{employee_id}")
    try:
        # Check if employee_id is valid
        if not employee_id:
            return jsonify({
                "status": "error",
                "message": "Employee ID is required"
            }), 400
        
        # Query the daily_scores collection for today's score
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Find the score for today for this employee
        score_record = tracker.db['daily_scores'].find_one({
            'date': today_start,
            'employee_id': employee_id
        })
        
        if not score_record:
            return jsonify({
                "productivityScore": 0,
                "message": "No productivity data found for today"
            })
        
        return jsonify({
            "productivityScore": score_record.get('productivity_score', 0),
            "totalProductiveTime": score_record.get('total_productive_time', 0),
            "totalUnproductiveTime": score_record.get('total_unproductive_time', 0)
        })
    except Exception as e:
        logger.error(f"Error retrieving productivity score: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500
    

@app.route('/test')
def test():
    """
    Simple health check endpoint to verify server is running
    """
    logger.info("API CALL: /test")
    logger.debug("Test endpoint called - server is running")
    return jsonify({"status": "Server is running"})

@app.route('/start-session', methods=['POST'])
def start_session():
    """
    Start a new productivity tracking session
    Requires session name in request payload
    """
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
    """
    Download a specific productivity report by report ID
    """
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
    """
    End the current productivity tracking session
    """
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
    """
    Retrieve details of the current active session
    """
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
    """
    Retrieve user privacy settings
    """
    logger.info("API CALL: /privacy-settings")
    try:
        settings = tracker.get_privacy_settings()
        logger.debug(f"Retrieved privacy settings: {settings}")
        return jsonify(settings)
    except Exception as e:
        logger.error(f"Error getting privacy settings: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/privacy-settings', methods=['POST'])
def update_privacy_settings():
    """
    Update user privacy settings
    """
    logger.info("API CALL: /privacy-settings [POST]")
    try:
        data = request.get_json()
        logger.debug(f"Updating privacy settings: {data}")
        
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
    """
    Delete user data based on specified type
    """
    logger.info("API CALL: /delete-data")
    try:
        data = request.get_json()
        delete_type = data.get('type', 'all')
        
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
    """
    Export user data as a zip file
    """
    logger.info("API CALL: /export-data")
    try:
        result = tracker.export_user_data()
        
        if result.get("status") == "error":
            logger.warning(f"Error exporting data: {result.get('message')}")
            return jsonify(result), 500
        
        # Set up the download response
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
    """
    Logout the current user
    Clear session and reset tracker
    """
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

# Main application entry point
if __name__ == '__main__':
    # Start background tracking thread
    logger.info("Starting tracking thread...")
    tracking_thread = threading.Thread(target=tracker.update_tracking, daemon=True)
    tracking_thread.start()
    
    # Launch Flask application
    logger.info("Starting Flask app on port 5000...")
    app.run(port=5000, debug=True, threaded=True, host='127.0.0.1')