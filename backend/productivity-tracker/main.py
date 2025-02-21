# backend/main.py

import os
import time
import pymongo
from dotenv import load_dotenv
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

#load env
load_dotenv()

class ProductivityTracker:
    def __init__(self):
        # MongoDB Connection
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        self.client = pymongo.MongoClient(mongodb_uri)
        self.db = self.client['productivity_tracker']
        
        # Initialize collections
        self.sessions_collection = self.db['user_sessions']
        self.screenshots_collection = self.db['screenshots']
        self.reports_collection = self.db['reports']
        
        # Initialize session state
        self.current_session = None
        self.session_active = False
        self.screenshot_thread = None
        
        # Setup indexes for performance
        self._setup_indexes()
        
        # Initialize other components
        self.window_tracker = WindowTracker()
        self.ai_classifier = AIClassifier()
        
        # Load Gemini API Key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("Gemini API Key not found!")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    def _setup_indexes(self):
        """Setup MongoDB indexes for performance and data cleanup"""
        # Index for session start time with TTL
        self.sessions_collection.create_index(
            [("start_time", pymongo.ASCENDING)],
            expireAfterSeconds=14 * 24 * 60 * 60  # 14 days TTL
        )
        
        # Add user_id index
        self.sessions_collection.create_index([("user_id", pymongo.ASCENDING)])
        self.screenshots_collection.create_index([("user_id", pymongo.ASCENDING)])
        self.reports_collection.create_index([("user_id", pymongo.ASCENDING)])


    def _restore_active_session(self):
        """Restore active session from MongoDB if exists"""
        try:
            active_session = self.sessions_collection.find_one({
                "end_time": None
            }, sort=[("start_time", -1)])
            
            if active_session:
                self.current_session = active_session
                self.session_active = True
                
                # Restart screenshot thread if needed
                if not self.screenshot_thread or not self.screenshot_thread.is_alive():
                    self.screenshot_thread = threading.Thread(target=self._screenshot_loop)
                    self.screenshot_thread.daemon = True
                    self.screenshot_thread.start()
        except Exception as e:
            print(f"Error restoring session: {e}")    

    def get_current_session_data(self):
        """Get data for current active session only"""
        if not self.current_session or not self.session_active:
            return {
                'productive_time': 0,
                'unproductive_time': 0,
                'window_details': {},
                'session_active': False
            }
        
        # Return current session data
        return {
            'productive_time': self.current_session.get('productive_time', 0),
            'unproductive_time': self.current_session.get('unproductive_time', 0),
            'window_details': self.current_session.get('window_details', {}),
            'session_active': True
        }        

        
    def start_session(self, session_name, user_id=None):
        """Start a new tracking session"""
        # End any existing session
        if self.session_active:
            self.end_session()
            
        # Create new session document
        self.current_session = {
            'name': session_name,
            'user_id': user_id,  # This will be used when user authentication is added
            'start_time': datetime.now(),
            'end_time': None,
            'productive_time': 0,
            'unproductive_time': 0,
            'window_details': {},
            'screenshots': []
        }
        
        # Insert new session and store its ID
        result = self.sessions_collection.insert_one(self.current_session)
        self.current_session['_id'] = result.inserted_id
        
        self.session_active = True
        
        # Start screenshot thread
        self.screenshot_thread = threading.Thread(target=self._screenshot_loop)
        self.screenshot_thread.daemon = True
        self.screenshot_thread.start()
        
        return {"status": "success", "message": "Session started", "session_id": str(result.inserted_id)}
    

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
        """Generate AI summary from session screenshots"""
        try:
            # Get screenshots only for current session
            screenshots = list(self.screenshots_collection.find({
                "session_id": str(self.current_session['_id'])
            }).sort("timestamp", 1))  # Sort by timestamp
            
            all_text = "\n".join(doc.get('text', '') for doc in screenshots)
            
            prompt = f"""
            Please analyze this work session based on the following extracted text and create a brief summary:
            
            Session Name: {self.current_session['name']}
            Duration: {(datetime.now() - self.current_session['start_time']).total_seconds() / 3600:.2f} hours
            Text: {all_text}
            
            Focus on:
            1. Main tasks and activities
            2. Tools and applications used
            3. Key accomplishments
            
            Keep the summary concise and professional.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"AI Summary generation error: {e}")
            return "Unable to generate AI summary due to an error."

    def _screenshot_loop(self):
        """Take screenshots every 15 minutes and extract text"""
        while self.session_active and self.current_session:  # Add check for current_session
            try:
                # Take screenshot
                screenshot = pyautogui.screenshot()
                timestamp = datetime.now()
                
                # Save screenshot temporarily
                temp_path = f"temp_screenshot_{timestamp.timestamp()}.png"
                screenshot.save(temp_path)
                
                # Extract text
                extracted_text = pytesseract.image_to_string(Image.open(temp_path))
                
                # Save to MongoDB with session_id
                screenshot_doc = {
                    "session_id": str(self.current_session['_id']),  # Ensure session association
                    "timestamp": timestamp,
                    "text": extracted_text,
                    "user_id": self.current_session.get('user_id')  # Add user_id if present
                }
                self.screenshots_collection.insert_one(screenshot_doc)
                
                # Clean up temp file
                os.remove(temp_path)
                
                time.sleep(120)  # 15 minutes (set to 2 minutes for testing)
                
            except Exception as e:
                print(f"Screenshot error: {e}")
                time.sleep(60)

    def _generate_and_store_report(self, summary):
        """Generate PDF report and store it in MongoDB"""
        try:
            # Create PDF in memory
            report_buffer = io.BytesIO()
            report_generator = ReportGenerator()
            report_generator.generate_report_to_buffer(self.current_session, summary, report_buffer)
            
            # Store in MongoDB with session and user info
            report_doc = {
                'session_id': self.current_session['_id'],
                'user_id': self.current_session.get('user_id'),  # Add user_id if present
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
            report = self.reports_collection.find_one({
                '_id': ObjectId(report_id),
                'user_id': self.current_session.get('user_id')  # Add user_id check if present
            })
            
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
                    
                    # Update MongoDB for this specific session
                    try:
                        self.sessions_collection.update_one(
                            {"_id": self.current_session['_id']},  # Target specific session
                            {"$set": {
                                "productive_time": self.current_session['productive_time'],
                                "unproductive_time": self.current_session['unproductive_time'],
                                "window_details": self.current_session['window_details']
                            }}
                        )
                        consecutive_errors = 0
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


    def get_daily_summary(self, user_id=None):
        """Retrieve daily productivity summary from MongoDB"""
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        # Query filter
        query = {
            'start_time': {
                '$gte': today_start,
                '$lt': today_end
            }
        }
        
        # Add user_id filter if provided
        if user_id:
            query['user_id'] = user_id

        # Get today's sessions
        today_sessions = list(self.sessions_collection.find(query))

        # Calculate totals
        total_productive_time = 0
        total_unproductive_time = 0
        window_times = {}

        for session in today_sessions:
            total_productive_time += session.get('productive_time', 0)
            total_unproductive_time += session.get('unproductive_time', 0)

            # Aggregate window times per session
            for window, details in session.get('window_details', {}).items():
                if window not in window_times:
                    window_times[window] = {
                        'window': window,
                        'active_time': 0,
                        'productive': details.get('productive', False)
                    }
                window_times[window]['active_time'] += details.get('active_time', 0)

        return {
            'total_productive_time': total_productive_time,
            'total_unproductive_time': total_unproductive_time,
            'productive_windows': sorted(
                list(window_times.values()),
                key=lambda x: x['active_time'],
                reverse=True
            )
        }
                                                                          


                                                                                                                                                                            