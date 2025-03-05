import platform
import psutil
import win32gui
import win32process
import re

class WindowTracker:
    def __init__(self):
        # List of window titles to exclude from tracking
        self.excluded_terms = ["VirtuTask"]
        
        # Mapping of known applications to their simplified names
        self.app_name_mapping = {
            'code.exe': 'Visual Studio Code',
            'chrome.exe': 'Google Chrome',
            'firefox.exe': 'Mozilla Firefox',
            'msedge.exe': 'Microsoft Edge',
            'ApplicationFrameHost.exe:WhatsApp': 'WhatsApp',
            'slack.exe': 'Slack',
            'teams.exe': 'Microsoft Teams',
            'discord.exe': 'Discord',
            'outlook.exe': 'Microsoft Outlook',
            'notion.exe': 'Notion',
            'rider64.exe': 'JetBrains Rider',
            'pycharm64.exe': 'PyCharm',
            'webstorm64.exe': 'WebStorm',
            'devenv.exe': 'Visual Studio',
            'notepad.exe': 'Notepad',
            'notepad++.exe': 'Notepad++',
            'explorer.exe': 'File Explorer'
        }
    
    def get_active_window(self):
        """
        Retrieve the currently active window's simplified name
        Supports cross-platform tracking
        Excludes windows that contain excluded terms
        """
        system = platform.system()
        
        if system == "Windows":
            window_info = self._get_windows_active_window()
        elif system == "Darwin":  # macOS
            window_info = self._get_mac_active_window()
        elif system == "Linux":
            window_info = self._get_linux_active_window()
        else:
            raise NotImplementedError(f"Unsupported OS: {system}")
        
        # Check if window should be excluded
        for term in self.excluded_terms:
            if term in window_info:
                return None  # Return None for excluded windows
                
        return window_info
    
    def _get_windows_active_window(self):
        """Windows-specific window tracking with simplified names"""
        try:
            hwnd = win32gui.GetForegroundWindow()
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            process = psutil.Process(pid)
            
            # Get process name and window title
            process_name = process.name().lower()
            window_title = win32gui.GetWindowText(hwnd)
            
            # Use mapping for known applications
            if process_name in self.app_name_mapping:
                return self.app_name_mapping[process_name]
            
            # For web browsers, try to extract primary website
            if process_name in ['chrome.exe', 'msedge.exe', 'firefox.exe']:
                # Extract website name from title
                website_match = re.search(r'([^-]+)', window_title)
                if website_match:
                    website = website_match.group(1).strip()
                    return website
            
            # Fallback to simple extraction
            simple_title = self._simplify_title(window_title, process_name)
            return simple_title
        
        except Exception as e:
            print(f"Windows tracking error: {e}")
            return "Unknown"
    
    def _simplify_title(self, window_title, process_name):
        """
        Simplify window title to extract the most relevant name
        
        Examples:
        - "authControllers.js - virtuTask-app - Visual Studio Code" → "virtuTask-app"
        - "WhatsApp" → "WhatsApp"
        """
        # Remove process name from title if present
        title = window_title.replace(process_name, '').strip()
        
        # Split by common separators and find the most meaningful part
        separators = [' - ', ' | ', ' • ']
        for sep in separators:
            parts = title.split(sep)
            
            # Prefer middle parts (likely to be meaningful)
            if len(parts) > 1:
                # Prioritize parts that seem like app or website names
                meaningful_parts = [
                    part for part in parts 
                    if len(part) > 2 and 
                    not part.lower().startswith(('file:', 'about:', 'new', 'untitled'))
                ]
                
                if meaningful_parts:
                    # Take the first meaningful part
                    return meaningful_parts[0].strip()
        
        # If no meaningful parts found, return original title or a cleaned version
        return title.strip() or process_name.replace('.exe', '')
    
    def _get_mac_active_window(self):
        """macOS window tracking (placeholder)"""
        # Implement macOS-specific tracking
        return "Unknown"
    
    def _get_linux_active_window(self):
        """Linux window tracking (placeholder)"""
        # Implement Linux-specific tracking
        return "Unknown"