# backend/main.py

import os
import time
import pymongo
from window_tracker import WindowTracker
from ai_classifier import AIClassifier
from datetime import datetime, timedelta
import pyautogui
import pytesseract
from PIL import Image
import threading
from bson.binary import Binary
from bson.objectid import ObjectId
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import google.generativeai as genai
from report_generator import ReportGenerator

class ProductivityTracker:
    def __init__(self):
        # MongoDB Connection
        self.client = pymongo.MongoClient('mongodb://localhost:27017/')
        self.db = self.client['productivity_tracker']
        self.sessions_collection = self.db['user_sessions']
        self.screenshots_collection = self.db['screenshots']
        self.reports_collection = self.db['reports']
        
        # Trackers
        self.window_tracker = WindowTracker()
        self.ai_classifier = AIClassifier()
        
        # Session state
        self.current_session = None
        self.session_active = False
        self.screenshot_thread = None

        # Load Gemini API Key from environment
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            # Provide a more informative error
            raise ValueError("""
            Gemini API Key not found! 
            Please:
            1. Create a .env file in the backend directory
            2. Add GEMINI_API_KEY=your_actual_key
            3. Get an API key from Google AI Studio (https://makersuite.google.com/app/apikey)
            """)
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-1.5-pro')
        
    # Update in the ProductivityTracker class (main.py)

    def start_session(self, session_name):
        """Start a new tracking session"""
        # Reset session completely
        self.current_session = {
            'name': session_name,
            'start_time': datetime.now(),
            'end_time': None,
            'productive_time': 0,
            'unproductive_time': 0,
            'window_details': {},
            'screenshots': []
        }
        self.session_active = True
        
        # Insert new session and get the ID
        session_id = self.sessions_collection.insert_one(self.current_session).inserted_id
        self.current_session['_id'] = session_id

        # Create and START the screenshot thread
        self.screenshot_thread = threading.Thread(target=self._screenshot_loop)
        self.screenshot_thread.daemon = True
        self.screenshot_thread.start()
        
        return {"status": "success", "message": "Session started"}

    def end_session(self):
        if not self.current_session:
            return {"status": "error", "message": "No active session"}
            
        try:
            self.session_active = False
            if self.screenshot_thread and self.screenshot_thread.is_alive():
                self.screenshot_thread.join(timeout=5)
                
            # Update session end time
            self.current_session['end_time'] = datetime.now()
            
            # Generate AI summary from screenshots
            summary = self._generate_ai_summary()
            
            # Generate and store report
            report_id = self._generate_and_store_report(summary)
            
            return {
                "status": "success", 
                "message": "Session ended successfully",
                "report_id": str(report_id)
            }
        
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to end session: {str(e)}"
            }

    def _generate_ai_summary(self):
        """Generate AI summary based on privacy settings with detailed error handling"""
        try:
            # Get privacy settings
            settings_doc = self.db['user_settings'].find_one({'type': 'privacy_settings'}) or {}
            privacy_settings = settings_doc.get('settings', {
                'enableScreenshots': True,
                'screenshotInterval': 15,
                'enableTextExtraction': True,
                'enableAiAnalysis': True
            })
            
            # Skip AI analysis if disabled
            if not privacy_settings.get('enableAiAnalysis', True):
                print("AI analysis is disabled in privacy settings")
                return "AI analysis disabled in privacy settings."
            
            # Get all screenshots for this session
            print(f"Finding screenshots for session ID: {self.current_session['_id']}")
            screenshots = list(self.screenshots_collection.find({
                "session_id": str(self.current_session['_id'])
            }))
            
            if not screenshots:
                print("No screenshots found for this session")
                return "No screenshots were found for this session. Unable to generate AI summary."
            
            print(f"Found {len(screenshots)} screenshots")
            
            # Combine all extracted text
            all_text_list = [doc.get('text', '') for doc in screenshots]
            all_text = "\n".join(all_text_list)
            
            if not all_text or all_text.isspace():
                print("No text extracted from screenshots")
                return "No text was extracted from screenshots. Unable to generate AI summary."
            
            # Truncate text if it's too long for the API
            max_text_length = 30000  # Adjust based on Gemini's limitations
            if len(all_text) > max_text_length:
                print(f"Text too long ({len(all_text)} chars), truncating to {max_text_length}")
                all_text = all_text[:max_text_length] + "... [text truncated due to length]"
            
            # Generate summary using Gemini
            print("Preparing prompt for Gemini API")
            prompt = f"""
            Please analyze this work session based on the following extracted text and create a brief summary:
            
            Text: {all_text}
            
            Focus on:
            1. Main tasks and activities
            2. Tools and applications used
            3. Key accomplishments
            
            Keep the summary concise and professional.
            """
            
            try:
                print("Calling Gemini API")
                response = self.model.generate_content(prompt)
                print("Received response from Gemini API")
                return response.text
            except Exception as api_error:
                error_message = f"Gemini API error: {str(api_error)}"
                print(error_message)
                # Create a detailed error message for debugging
                return f"Error calling Gemini API: {str(api_error)}"
                
        except Exception as e:
            error_type = type(e).__name__
            error_message = f"AI Summary generation error ({error_type}): {str(e)}"
            print(error_message)
            
            # For debugging purposes, log the traceback
            import traceback
            print("Full traceback:")
            traceback.print_exc()
            
            # Return a detailed error message that will appear in the report
            return f"Unable to generate AI summary. Error type: {error_type}. Details: {str(e)}"

    def _screenshot_loop(self):
        """Take screenshots based on user privacy settings"""
        while self.session_active:
            try:
                # Get privacy settings from database
                settings_doc = self.db['user_settings'].find_one({'type': 'privacy_settings'}) or {}
                privacy_settings = settings_doc.get('settings', {
                    'enableScreenshots': True,
                    'screenshotInterval': 15,
                    'enableTextExtraction': True,
                    'enableAiAnalysis': True
                })
                
                # Check if screenshots are enabled
                if not privacy_settings.get('enableScreenshots', True):
                    time.sleep(60)  # Check settings again in a minute
                    continue
                    
                # Take screenshot
                screenshot = pyautogui.screenshot()
                timestamp = datetime.now()
                
                # Save screenshot temporarily
                temp_path = f"temp_screenshot_{timestamp.timestamp()}.png"
                screenshot.save(temp_path)
                
                # Extract text if enabled
                extracted_text = ""
                if privacy_settings.get('enableTextExtraction', True):
                    extracted_text = pytesseract.image_to_string(Image.open(temp_path))
                
                # Save to MongoDB
                self.screenshots_collection.insert_one({
                    "session_id": str(self.current_session['_id']),
                    "timestamp": timestamp,
                    "text": extracted_text
                })
                
                # Clean up temp file
                os.remove(temp_path)
                
                # Wait for the configured interval
                interval_minutes = privacy_settings.get('screenshotInterval', 15)
                time.sleep(interval_minutes * 60)  # Convert to seconds
                
            except Exception as e:
                print(f"Screenshot error: {e}")
                time.sleep(60)  # Wait a minute before retrying


    def _generate_and_store_report(self, summary):
        """Generate PDF report and store it in MongoDB"""
        try:
            # Create PDF in memory
            report_buffer = io.BytesIO()
            report_generator = ReportGenerator()
            report_generator.generate_report_to_buffer(self.current_session, summary, report_buffer)
            
            # Store in MongoDB
            report_doc = {
                'session_id': self.current_session['_id'],
                'created_at': datetime.now(),
                'filename': f"{self.current_session['name']}_{self.current_session['start_time'].strftime('%Y%m%d_%H%M')}.pdf",
                'data': Binary(report_buffer.getvalue())
            }
            
            result = self.reports_collection.insert_one(report_doc)
            return result.inserted_id
            
        except Exception as e:
            print(f"Error generating/storing report: {e}")
            raise

    def get_report(self, report_id):
        """Retrieve a report from MongoDB"""
        try:
            report = self.reports_collection.find_one({'_id': ObjectId(report_id)})
            if not report:
                return None
                
            return {
                'filename': report['filename'],
                'data': report['data'],
                'content_type': 'application/pdf'
            }
        except Exception as e:
            print(f"Error retrieving report: {e}")
            return None
            
    def update_tracking(self):
        """Continuously track and update window information"""
        print("Starting tracking loop...")

        last_update = time.time()
        consecutive_errors = 0

        while True:
            try:
                if not self.current_session or not self.session_active:
                    time.sleep(1)
                    continue                                                                               

                current_time = time.time()
                elapsed_seconds = int(current_time - last_update)

                if elapsed_seconds > 0:
                    active_window = self.window_tracker.get_active_window()
                    
                    # Skip processing if window is excluded (None is returned)
                    if active_window is None:
                        last_update = current_time
                        time.sleep(0.1)
                        continue

                    # Retry AI classification if it fails
                    retry_count = 3
                    is_productive = False

                    for _ in range(retry_count):
                        try:
                            is_productive = self.ai_classifier.classify_window(active_window)
                            break
                        except Exception as e:
                            print(f"AI Classification retry error: {e}")
                            time.sleep(1)

                    # Update times
                    if is_productive:
                        self.current_session['productive_time'] += elapsed_seconds
                    else:
                        self.current_session['unproductive_time'] += elapsed_seconds

                    # Update window details
                    if active_window not in self.current_session['window_details']:
                        self.current_session['window_details'][active_window] = {
                            'productive': is_productive,
                            'active_time': 0,
                            'idle_time': 0
                        }

                    self.current_session['window_details'][active_window]['active_time'] += elapsed_seconds

                    # Update MongoDB
                    try:
                        self.sessions_collection.update_one(
                            {"_id": self.current_session['_id']},
                            {"$set": {
                                "productive_time": self.current_session['productive_time'],
                                "unproductive_time": self.current_session['unproductive_time'],
                                "window_details": self.current_session['window_details']
                            }}
                        )
                        consecutive_errors = 0  # Reset error counter on successful update
                    except Exception as e:
                        print(f"MongoDB update error: {e}")
                        consecutive_errors += 1
                        if consecutive_errors > 5:
                            print("Too many consecutive errors, resetting session state...")
                            self.session_active = False
                            break

                    last_update = current_time

                time.sleep(0.1)

            except Exception as e:
                print(f"Error in tracking loop: {e}")
                consecutive_errors += 1
                if consecutive_errors > 5:
                    print("Too many consecutive errors, resetting session state...")
                    self.session_active = False
                    break
                time.sleep(1)

    def get_daily_summary(self):
        """
        Retrieve daily productivity summary from MongoDB
        Aggregates data for the current day's session  
        """
        # Get today's date
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        # Aggregate sessions for today
        today_sessions = list(self.sessions_collection.find({
            'start_time': {
                '$gte': today_start,
                '$lt': today_end
            }
        }))

        # Calculate total times and window details
        total_productive_time = 0
        total_unproductive_time = 0
        window_times = {}

        for session in today_sessions:
            total_productive_time += session.get('productive_time', 0)
            total_unproductive_time += session.get('unproductive_time', 0)

            # Aggregate window times
            for window, details in session.get('window_details', {}).items():
                if window not in window_times:
                    window_times[window] = {
                        'window': window,
                        'active_time': 0,
                        'productive': details.get('productive', False)
                    }
                window_times[window]['active_time'] += details.get('active_time', 0)

        # Calculate productivity score
        total_time = total_productive_time + total_unproductive_time
        productivity_score = 0
        if total_time > 0:
            productivity_score = (total_productive_time / total_time) * 100

        # Save the daily productivity score
        self.db['daily_scores'].update_one(
            {'date': today_start},
            {'$set': {
                'date': today_start,
                'productivity_score': productivity_score,
                'total_productive_time': total_productive_time,
                'total_unproductive_time': total_unproductive_time,
                'total_time': total_time
            }},
            upsert=True
        )

        # Convert window times to list and sort by active time
        productive_windows = sorted(
            [
                {
                    'window': details['window'],
                    'active_time': details['active_time'],
                    'productive': details['productive']
                } 
                for details in window_times.values()
            ],
            key=lambda x: x['active_time'],
            reverse=True
        )

        return {
            'total_productive_time': total_productive_time,
            'total_unproductive_time': total_unproductive_time,
            'productivity_score': productivity_score,
            'productive_windows': productive_windows
        }