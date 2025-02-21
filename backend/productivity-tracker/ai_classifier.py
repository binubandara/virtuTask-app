#backend/ai_classifier.py

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

class AIClassifier:
    def __init__(self):
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
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Predefined productive and unproductive app lists
        self.productive_apps = [
            'code', 'vscode', 'chrome', 'firefox', 
            'word', 'excel', 'teams', 'slack'
        ]
        self.unproductive_apps = [
            'netflix', 'youtube', 'gaming', 
            'social media', 'discord'
        ]
    
    def classify_window(self, window_info):
        """
        Classify window as productive or unproductive
        Returns boolean indicating productivity
        """
        app_name = window_info.split(':')[0].lower()
        
        # Direct match against predefined lists
        if app_name in self.productive_apps:
            return True 
        
        if app_name in self.unproductive_apps:                                       
            return False  
        
        # Use Gemini for uncertain classifications
        try:
            prompt = f"Is the application '{app_name}' typically considered productive for work?"
            response = self.model.generate_content(prompt)
            return "yes" in response.text.lower()
        except Exception as e:
            print(f"AI Classification error: {e}")
            return False  # Default to unproductive if classification fails
        

    