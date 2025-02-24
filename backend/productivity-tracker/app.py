from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
from main import ProductivityTracker
import threading
import io
from bson.objectid import ObjectId


app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

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

@app.route('/end-session', methods=['POST'])
def end_session():
    try:
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
            "message": "Failed to end session"
        }), 500



@app.route('/current-session')
def get_current_session():
    try:
        if not tracker.current_session or not tracker.session_active:
            return jsonify({
                "status": "error",
                "message": "No active session"
            }), 404
            
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
        
        return jsonify(current_data)
    except Exception as e:
        print(f"Error in current-session: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    print("Starting tracking thread...")
    tracking_thread = threading.Thread(target=tracker.update_tracking, daemon=True)
    tracking_thread.start()
    
    print("Starting Flask app...")
    app.run(port=5000, debug=True, threaded=True, host='127.0.0.1')