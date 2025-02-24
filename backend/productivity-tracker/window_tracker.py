#backend/window_tracker.py

import platform
import psutil
import win32gui
import win32process

class WindowTracker:
    def get_active_window(self):
        """
        Retrieve the currently active window's process name and title
        Supports cross-platform tracking
        """
        system = platform.system()
        
        if system == "Windows":
            return self._get_windows_active_window()
        elif system == "Darwin":  # macOS
            return self._get_mac_active_window()
        elif system == "Linux":
            return self._get_linux_active_window()
        else:
            raise NotImplementedError(f"Unsupported OS: {system}")
    
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