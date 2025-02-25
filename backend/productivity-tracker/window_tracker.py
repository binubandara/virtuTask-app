import platform
import psutil
import win32gui
import win32process

class WindowTracker:
    def __init__(self):
        # List of window titles to exclude from tracking
        self.excluded_terms = ["VirtuTask"]
    
    def get_active_window(self):
        """
        Retrieve the currently active window's process name and title
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
        """Windows-specific window tracking"""
        try:
            hwnd = win32gui.GetForegroundWindow()
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            process = psutil.Process(pid)
            
            window_title = win32gui.GetWindowText(hwnd)
            return f"{process.name()}:{window_title}"
        except Exception as e:
            print(f"Windows tracking error: {e}")
            return "Unknown:Unknown"
    
    def _get_mac_active_window(self):
        """macOS window tracking (placeholder)"""
        # Implement macOS-specific tracking
        return "Unknown:Unknown"
    
    def _get_linux_active_window(self):
        """Linux window tracking (placeholder)"""
        # Implement Linux-specific tracking
        return "Unknown:Unknown"