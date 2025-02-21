import platform
import psutil
import re
import win32gui
import win32process

class WindowTracker:
    def get_active_window(self):
        """
        Retrieve the currently active window's process name and title
        Supports cross-platform tracking with cleaned title formatting.
        """
        system = platform.system()
        
        if system == "Windows":
            raw_title = self._get_windows_active_window()
        elif system == "Darwin":  # macOS
            raw_title = self._get_mac_active_window()
        elif system == "Linux":
            raw_title = self._get_linux_active_window()
        else:
            raise NotImplementedError(f"Unsupported OS: {system}")

        return self.clean_window_title(raw_title)

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
        return "Unknown:Unknown"

    def _get_linux_active_window(self):
        """Linux window tracking (placeholder)"""
        return "Unknown:Unknown"

    def clean_window_title(self, title):
        """Clean window title for better readability"""
        # Remove process name/exe references
        cleaned = re.sub(r'^[^:]+\.exe:', '', title)

        # Remove redundant path information
        cleaned = re.sub(r'\s+-\s+.*?\s+-\s+', ' - ', cleaned)

        # Trim excessive whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        return cleaned
