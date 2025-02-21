from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
from main import ProductivityTracker
import threading
import io
from bson.objectid import ObjectId


app = Flask(__name__)

# Configure CORS with specific origins
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Disposition"]
    }
})

tracker = ProductivityTracker()

@app.route('/daily-summary')
def get_daily_summary():
    try:
        print("Received request for daily-summary")
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
            'windowTimes': window_times
        }
        
        return jsonify(response_data)
    except Exception as e:
        print(f"Error in daily-summary: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

@app.route('/test')
def test():
    return jsonify({"status": "Server is running"})

@app.route('/start-session', methods=['POST'])
def start_session():
    try:
        data = request.get_json()
        return jsonify(tracker.start_session(data['session_name']))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download-report/<report_id>')
def download_report(report_id):
    try:
        report = tracker.get_report(report_id)
        if not report:
            return jsonify({
                "status": "error",
                "message": "Report not found"
            }), 404
            
        response = make_response(report['data'])
        response.headers['Content-Type'] = report['content_type']
        response.headers['Content-Disposition'] = f'attachment; filename={report["filename"]}'
        return response
        
    except Exception as e:
        print(f"Download error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to download report"
        }), 500
    

@app.route('/current-session')
def get_current_session():
    try:
        session_data = tracker.get_current_session_data()
        
        # Format window data similar to daily summary
        window_times = []
        for window, details in session_data.get('window_details', {}).items():
            window_times.append([
                window,
                details.get('active_time', 0),
                details.get('productive', False)
            ])             
            
        response_data = {
            'totalProductiveTime': session_data['productive_time'],
            'totalUnproductiveTime': session_data['unproductive_time'],
            'windowTimes': window_times,
            'sessionActive': session_data['session_active']
        }
        
        return jsonify(response_data)
    except Exception as e:
        print(f"Error in current-session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/end-session', methods=['POST'])
def end_session():
    try:
        # Get current session from MongoDB instead of relying on in-memory state
        current_session = tracker.sessions_collection.find_one({
            "end_time": None  # Find the active session
        }, sort=[("start_time", -1)])  # Get the most recent one
        
        if not current_session:
            return jsonify({
                "status": "error",
                "message": "No active session found"
            }), 404
            
        # Set the current session in tracker
        tracker.current_session = current_session
        tracker.session_active = True
        
        # Now end the session
        result = tracker.end_session()
        
        if result["status"] == "success" and "report_id" in result:
            return jsonify({
                "status": "success",
                "message": "Session ended successfully",
                "report_id": result["report_id"]
            })
        return jsonify(result)
    except Exception as e:
        print(f"End session error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Failed to end session: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("Starting tracking thread...")
    tracking_thread = threading.Thread(target=tracker.update_tracking, daemon=True)
    tracking_thread.start()
    
    print("Starting Flask app...")
    app.run(port=5000, debug=True, threaded=True, host='127.0.0.1')