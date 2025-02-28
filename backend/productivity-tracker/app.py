from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
from main import ProductivityTracker
import threading
import io
from bson.objectid import ObjectId
import logging
import json
import zipfile
import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('productivity_api')

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

tracker = ProductivityTracker()

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
        if result["status"] == "success" and "report_id" in result:
            return jsonify({
                "status": "success",
                "message": "Session ended successfully",
                "report_id": result["report_id"]
            })
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in end-session: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "Failed to end session"
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
        # Get settings from database, or return defaults
        settings_doc = tracker.db['user_settings'].find_one({'type': 'privacy_settings'})
        
        if settings_doc:
            logger.debug(f"Retrieved privacy settings: {settings_doc.get('settings')}")
            return jsonify(settings_doc.get('settings', {}))
        else:
            # Return default settings
            default_settings = {
                'enableScreenshots': True,
                'screenshotInterval': 15,
                'enableTextExtraction': True,
                'enableAiAnalysis': True
            }
            logger.debug(f"No settings found, returning defaults: {default_settings}")
            return jsonify(default_settings)
    except Exception as e:
        logger.error(f"Error getting privacy settings: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/privacy-settings', methods=['POST'])
def update_privacy_settings():
    logger.info("API CALL: /privacy-settings [POST]")
    try:
        data = request.get_json()
        logger.debug(f"Updating privacy settings: {data}")
        
        # Validate settings
        required_keys = ['enableScreenshots', 'screenshotInterval', 'enableTextExtraction', 'enableAiAnalysis']
        if not all(key in data for key in required_keys):
            logger.warning(f"Invalid settings format: {data}")
            return jsonify({"error": "Invalid settings format"}), 400
            
        # Update settings in database
        tracker.db['user_settings'].update_one(
            {'type': 'privacy_settings'},
            {'$set': {'settings': data}},
            upsert=True
        )
        
        logger.debug("Privacy settings updated successfully")
        return jsonify({"status": "success", "message": "Privacy settings updated"})
    except Exception as e:
        logger.error(f"Error updating privacy settings: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/delete-data', methods=['POST'])
def delete_user_data():
    logger.info("API CALL: /delete-data")
    try:
        data = request.get_json()
        delete_type = data.get('type', 'all')
        
        if delete_type == 'all':
            logger.warning("Deleting all user data")
            # Delete all collections
            tracker.screenshots_collection.delete_many({})
            tracker.sessions_collection.delete_many({})
            tracker.reports_collection.delete_many({})
            
            return jsonify({"status": "success", "message": "All user data deleted"})
        elif delete_type == 'screenshots':
            logger.warning("Deleting all screenshots")
            tracker.screenshots_collection.delete_many({})
            return jsonify({"status": "success", "message": "All screenshots deleted"})
        else:
            return jsonify({"error": "Invalid delete type"}), 400
    except Exception as e:
        logger.error(f"Error deleting user data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
        

@app.route('/export-data', methods=['GET'])
def export_user_data():
    logger.info("API CALL: /export-data")
    try:
        # Create an in-memory file-like object to store the ZIP
        memory_file = io.BytesIO()
        
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Export sessions
            sessions = list(tracker.sessions_collection.find({}, {'_id': False}))
            zipf.writestr('sessions.json', json.dumps(sessions, default=str, indent=2))
            
            # Export screenshots metadata (not the actual images)
            screenshots = list(tracker.screenshots_collection.find({}, {'_id': False, 'text': True, 'session_id': True, 'timestamp': True}))
            zipf.writestr('screenshots_metadata.json', json.dumps(screenshots, default=str, indent=2))
            
            # Export reports metadata
            reports = list(tracker.reports_collection.find({}, {'_id': True, 'session_id': True, 'created_at': True, 'filename': True}))
            zipf.writestr('reports_metadata.json', json.dumps(reports, default=str, indent=2))
            
            # Export privacy settings
            settings = tracker.db['user_settings'].find_one({'type': 'privacy_settings'})
            if settings:
                zipf.writestr('privacy_settings.json', json.dumps(settings, default=str, indent=2))
        
        # Move to the beginning of the file-like object
        memory_file.seek(0)
        
        # Set up the response
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        response = make_response(memory_file.getvalue())
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Disposition'] = f'attachment; filename=virtutask_data_export_{timestamp}.zip'
        
        logger.debug("Data export generated successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500        
    
if __name__ == '__main__':
    logger.info("Starting tracking thread...")
    tracking_thread = threading.Thread(target=tracker.update_tracking, daemon=True)
    tracking_thread.start()
    
    logger.info("Starting Flask app on port 5000...")
    app.run(port=5000, debug=True, threaded=True, host='127.0.0.1')