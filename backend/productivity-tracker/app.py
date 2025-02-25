from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
from main import ProductivityTracker
import threading
import io
from bson.objectid import ObjectId
import logging

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
    
if __name__ == '__main__':
    logger.info("Starting tracking thread...")
    tracking_thread = threading.Thread(target=tracker.update_tracking, daemon=True)
    tracking_thread.start()
    
    logger.info("Starting Flask app on port 5000...")
    app.run(port=5000, debug=True, threaded=True, host='127.0.0.1')