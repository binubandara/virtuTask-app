import os
from dotenv import load_dotenv
import google.generativeai as genai
import time
from collections import deque
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, requests_per_minute=60):
        self.requests_per_minute = requests_per_minute
        self.request_times = deque()
        
    def wait_if_needed(self):
        """Wait if necessary to stay within rate limits"""
        now = datetime.now()
        
        # Remove requests older than 1 minute
        while self.request_times and (now - self.request_times[0]) > timedelta(minutes=1):
            self.request_times.popleft()
            
        # If at limit, wait until oldest request is more than 1 minute old
        if len(self.request_times) >= self.requests_per_minute:
            wait_time = (self.request_times[0] + timedelta(minutes=1) - now).total_seconds()
            if wait_time > 0:
                time.sleep(wait_time)
                
        # Add current request
        self.request_times.append(now)

class AIClassifier:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Initialize rate limiter (adjust rate as needed)
        self.rate_limiter = RateLimiter(requests_per_minute=30)
        
        # Load Gemini API Key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("""
            Gemini API Key not found! 
            Please:
            1. Create a .env file in the backend directory
            2. Add GEMINI_API_KEY=your_actual_key
            3. Get an API key from Google AI Studio (https://makersuite.google.com/app/apikey)
            """)
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Enhanced predefined lists
        self.productive_apps = {
            'code', 'vscode', 'visual studio code', 'sublime', 'intellij', 'pycharm',  # Dev tools
            'chrome', 'firefox', 'edge', 'safari',  # Browsers
            'word', 'excel', 'powerpoint', 'outlook',  # Office suite
            'teams', 'slack', 'zoom', 'meet',  # Communication
            'figma', 'sketch', 'photoshop', 'illustrator',  # Design
            'notion', 'evernote', 'onenote',  # Note-taking
            'terminal', 'cmd', 'powershell'  # Command line
        }
        
        self.unproductive_apps = {
            'netflix', 'hulu', 'disney+', 'prime video',  # Streaming
            'youtube', 'twitch', 'tiktok',  # Video platforms
            'steam', 'epic games', 'battle.net',  # Gaming
            'facebook', 'instagram', 'twitter', 'reddit',  # Social media
            'discord', 'whatsapp', 'messenger',  # Chat apps
            'spotify', 'apple music'  # Music (when not part of work)
        }
        
        # Cache for AI classifications
        self.classification_cache = {}
        self.cache_duration = timedelta(hours=24)
        self.cache_cleanup_counter = 0
        
    def _clean_app_name(self, app_name):
        """Normalize app name for consistent matching"""
        return app_name.lower().strip()
    
    def _is_cached_classification_valid(self, cached_result):
        """Check if cached classification is still valid"""
        return (datetime.now() - cached_result['timestamp']) < self.cache_duration
    
    def _cleanup_cache(self):
        """Periodically clean up expired cache entries"""
        self.cache_cleanup_counter += 1
        if self.cache_cleanup_counter >= 100:  # Cleanup every 100 classifications
            now = datetime.now()
            expired_keys = [
                key for key, value in self.classification_cache.items()
                if (now - value['timestamp']) > self.cache_duration
            ]
            for key in expired_keys:
                del self.classification_cache[key]
            self.cache_cleanup_counter = 0
    
    def classify_window(self, window_info):
        """
        Classify window as productive or unproductive with enhanced error handling
        and caching
        """
        try:
            # Extract and clean app name
            app_name = self._clean_app_name(window_info.split(':')[0])
            
            # Check predefined lists first
            if app_name in self.productive_apps:
                return True
            if app_name in self.unproductive_apps:
                return False
            
            # Check cache
            if app_name in self.classification_cache:
                cached_result = self.classification_cache[app_name]
                if self._is_cached_classification_valid(cached_result):
                    return cached_result['productive']
            
            # Rate limit and classify with AI
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    self.rate_limiter.wait_if_needed()
                    
                    prompt = f"""
                    Analyze if the application '{app_name}' is typically used for productive work purposes.
                    Consider:
                    - Is it commonly used in professional/work environments?
                    - Does it facilitate work tasks, communication, or learning?
                    - Is it primarily for entertainment or leisure?
                    
                    Respond with only 'yes' if productive, 'no' if unproductive.
                    """
                    
                    response = self.model.generate_content(prompt)
                    is_productive = 'yes' in response.text.lower()
                    
                    # Cache the result
                    self.classification_cache[app_name] = {
                        'productive': is_productive,
                        'timestamp': datetime.now()
                    }
                    
                    # Periodic cache cleanup
                    self._cleanup_cache()
                    
                    return is_productive
                    
                except Exception as e:
                    if attempt == max_retries - 1:
                        print(f"AI Classification failed after {max_retries} attempts: {e}")
                        return False  # Default to unproductive after max retries
                    time.sleep(2 ** attempt)  # Exponential backoff
            
        except Exception as e:
            print(f"Window classification error: {e}")
            return False  # Default to unproductive for any unexpected errors