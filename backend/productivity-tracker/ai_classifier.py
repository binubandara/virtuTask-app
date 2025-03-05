import os
from dotenv import load_dotenv
import google.generativeai as genai
import time
from collections import deque
from datetime import datetime, timedelta
import re

class RateLimiter:
    """
    A class to manage API request rate limiting.
    
    Ensures that the number of requests does not exceed a specified limit per minute
    by tracking request times and implementing a waiting mechanism.
    """
    def __init__(self, requests_per_minute=60):
        """
        Initialize the RateLimiter with a specified requests per minute limit.
        
        Args:
            requests_per_minute (int): Maximum number of requests allowed per minute.
        """
        self.requests_per_minute = requests_per_minute
        self.request_times = deque()
        
    def wait_if_needed(self):
        """
        Wait if necessary to stay within rate limits.
        
        Removes requests older than 1 minute, checks if current request will exceed limit,
        and sleeps if needed to maintain the rate limit.
        """
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
    """
    A comprehensive AI-powered application productivity classifier.
    
    Uses multiple strategies to classify whether a window/application 
    is being used for productive or unproductive purposes.
    """
    def __init__(self):
        """
        Initialize the AIClassifier with API configuration, 
        predefined app lists, and classification strategies.
        """
        # Load environment variables
        load_dotenv()
        
        # Initialize rate limiter (adjust rate as needed)
        self.rate_limiter = RateLimiter(requests_per_minute=30)
        
        # Load Gemini API Key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("""
            Gemini API Key not found! 
            Please:ffffffffffffffffffffffff
            1. Create a .env file in the backend directory
            2. Add GEMINI_API_KEY=your_actual_key
            3. Get an API key from Google AI Studio (https://makersuite.google.com/app/apikey)
            """)
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-1.5-pro')
        
        # Enhanced predefined lists with more comprehensive coverage
        self.productive_apps = {
            # Development tools - expanded
            'code', 'Code', 'vscode', 'code.exe', 'Visual Studio Code', 'codium', 'vscodium', 
            'sublime_text', 'SublimeText', 'atom', 'notepad++', 'Notepad++',
            'intellij', 'IntelliJ', 'pycharm', 'PyCharm', 'webstorm', 'WebStorm', 'phpstorm', 'PhpStorm',
            'android studio', 'AndroidStudio', 'eclipse', 'Eclipse', 'netbeans', 'NetBeans',
            'vim', 'neovim', 'emacs', 'xcode', 'XCode', 'Xcode',
            'git', 'git-bash', 'github desktop', 'GitHubDesktop', 'sourcetree', 'SourceTree',
            
            # Browsers (consider productive by default)
            'chrome', 'Chrome', 'firefox', 'Firefox', 'edge', 'Edge', 'msedge', 'safari', 'Safari', 'opera', 'Opera', 'brave', 'Brave',
            
            # Office suites
            'word', 'Word', 'WINWORD', 'winword.exe', 'excel', 'Excel', 'EXCEL', 'excel.exe', 
            'powerpoint', 'PowerPoint', 'POWERPNT', 'powerpnt.exe', 'outlook', 'Outlook', 'OUTLOOK', 'outlook.exe',
            'onenote', 'OneNote', 'access', 'Access', 'publisher', 'Publisher',
            'libreoffice', 'LibreOffice', 'openoffice', 'OpenOffice',
            'pages', 'Pages', 'numbers', 'Numbers', 'keynote', 'Keynote',
            
            # Communication tools
            'teams', 'Teams', 'microsoft teams', 'slack', 'Slack', 'zoom', 'Zoom', 'skype', 'Skype',
            'meet', 'Meet', 'google meet', 'webex', 'Webex', 'discord', 'Discord',
            
            # Design tools
            'figma', 'Figma', 'sketch', 'Sketch', 'photoshop', 'Photoshop', 'illustrator', 'Illustrator',
            'indesign', 'InDesign', 'xd', 'XD', 'adobe xd', 'Adobe XD', 'gimp', 'GIMP', 'inkscape', 'Inkscape',
            'blender', 'Blender', 'unity', 'Unity', 'unreal', 'Unreal',
            
            # Note-taking and organization
            'notion', 'Notion', 'evernote', 'Evernote', 'onenote', 'OneNote', 'trello', 'Trello',
            'asana', 'Asana', 'jira', 'Jira', 'confluence', 'Confluence',
            
            # Command line and terminals
            'terminal', 'Terminal', 'cmd', 'cmd.exe', 'Command Prompt', 'powershell', 'PowerShell', 'powershell.exe',
            'bash', 'zsh', 'windowsterminal', 'WindowsTerminal', 'iterm', 'iTerm',
            
            # Database tools
            'mysql workbench', 'MySQLWorkbench', 'pgadmin', 'PGAdmin', 'dbeaver', 'DBeaver',
            'sqlitestudio', 'SQLiteStudio', 'mongodb compass', 'MongoDBCompass',
            
            # Remote access
            'ssh', 'putty', 'PuTTY', 'teamviewer', 'TeamViewer', 'anydesk', 'AnyDesk',
            
            # PDF and document readers
            'acrobat', 'Acrobat', 'adobe reader', 'AdobeReader', 'foxit', 'Foxit',
            'preview', 'Preview', 'drawboard', 'Drawboard',
            
            # Presentation tools
            'zoomit', 'ZoomIt', 'prezi', 'Prezi', 'zotero', 'Zotero', 'mendeley', 'Mendeley',
        }
        
        self.unproductive_apps = {
            # Streaming services
            'netflix', 'Netflix', 'hulu', 'Hulu', 'disney+', 'Disney+', 'prime video', 'Prime Video',
            'hbo max', 'HBO Max', 'peacock', 'Peacock', 'paramount+', 'Paramount+', 'appletv', 'AppleTV',
            
            # Video platforms (when not work-related)
            'youtube', 'YouTube', 'twitch', 'Twitch', 'tiktok', 'TikTok', 'vimeo', 'Vimeo',
            
            # Gaming
            'steam', 'Steam', 'epic games', 'Epic Games', 'battle.net', 'Battle.net', 'origin', 'Origin',
            'uplay', 'Uplay', 'xbox', 'Xbox', 'playstation', 'PlayStation', 'ea desktop', 'EA Desktop',
            'lol.launcher', 'LeagueClient', 'valorant', 'Valorant', 'fortnite', 'Fortnite',
            'minecraft', 'Minecraft', 'roblox', 'Roblox', 'apex legends', 'Apex Legends',
            'counter-strike', 'Counter-Strike', 'csgo', 'CSGO', 'dota', 'Dota', 'among us', 'Among Us',
            'genshin impact', 'Genshin Impact', 'warzone', 'Warzone', 'cod', 'CoD',
            
            # Social media
            'facebook', 'Facebook', 'instagram', 'Instagram', 'twitter', 'Twitter', 'reddit', 'Reddit',
            'pinterest', 'Pinterest', 'snapchat', 'Snapchat', 'whatsapp', 'WhatsApp', 'telegram', 'Telegram',
            'messenger', 'Messenger', 'signal', 'Signal', 'linkedin', 'LinkedIn',
            
            # Music and entertainment (when not work-related)
            'spotify', 'Spotify', 'apple music', 'Apple Music', 'itunes', 'iTunes', 'pandora', 'Pandora',
            'deezer', 'Deezer', 'tidal', 'Tidal', 'vlc', 'VLC', 'mpv', 'MPV',
            
            # Other entertainment
            'solitaire', 'Solitaire', 'minesweeper', 'Minesweeper', 'candy crush', 'Candy Crush',
            'chess.com', 'Chess.com', 'lichess', 'Lichess',
        }
        
        # AI misclassification correction dictionary
        self.known_corrections = {
            'vscode': True,
            'code.exe': True,
            'VS Code': True,
            'Visual Studio Code': True,
            'IntelliJ IDEA': True,
            'PyCharm': True,
            'Android Studio': True,
            'github': True,
            'GitKraken': True
        }
        
        # Domain-based classification patterns
        self.productive_domains = [
            r'github\.com',
            r'gitlab\.com',
            r'bitbucket\.org',
            r'stackoverflow\.com',
            r'docs\.python\.org',
            r'developer\.mozilla\.org',
            r'w3schools\.com',
            r'medium\.com',
            r'dev\.to',
            r'learn\.microsoft\.com',
            r'aws\.amazon\.com',
            r'cloud\.google\.com',
            r'docs\.aws\.amazon\.com',
            r'azure\.microsoft\.com',
            r'jira\.com',
            r'atlassian\.com',
            r'codepen\.io',
            r'replit\.com',
            r'kaggle\.com',
            r'freecodecamp\.org',
            r'udemy\.com',
            r'coursera\.org',
            r'edx\.org',
            r'linkedin\.com/learning',
            r'pluralsight\.com',
            r'educative\.io'
        ]
        
        self.unproductive_domains = [
            r'facebook\.com',
            r'instagram\.com',
            r'twitter\.com',
            r'reddit\.com',
            r'netflix\.com',
            r'hulu\.com',
            r'disney\.com',
            r'disneyplus\.com',
            r'youtube\.com/(?!.*tutorial|.*learn|.*education|.*programming|.*code|.*development)',
            r'twitch\.tv',
            r'tiktok\.com',
            r'pinterest\.com',
            r'snapchat\.com',
            r'tumblr\.com',
            r'9gag\.com',
            r'buzzfeed\.com',
            r'espn\.com',
            r'nfl\.com',
            r'nba\.com',
            r'mlb\.com'
        ]
        
        # Cache for AI classifications
        self.classification_cache = {}
        self.cache_duration = timedelta(hours=24)
        self.cache_cleanup_counter = 0
        
        # User feedback dictionary to learn from corrections
        self.user_feedback = {}
        
    def _clean_app_name(self, app_name):
        """Normalize app name for consistent matching"""
        return app_name.lower().strip()
    
    def _extract_app_and_title(self, window_info):
        """Extract app name and window title from window info string"""
        parts = window_info.split(':', 1)
        app_name = parts[0].strip()
        title = parts[1].strip() if len(parts) > 1 else ""
        return app_name, title
    
    def _check_domain_patterns(self, window_title):
        """Check if window title contains a productive or unproductive domain"""
        # Check against productive domains
        for pattern in self.productive_domains:
            if re.search(pattern, window_title, re.IGNORECASE):
                return True, True  # Found match, is productive
                
        # Check against unproductive domains
        for pattern in self.unproductive_domains:
            if re.search(pattern, window_title, re.IGNORECASE):
                return True, False  # Found match, is unproductive
                
        # No match found
        return False, None
    
    def _detect_productive_activities(self, window_title):
        """Detect specific productive activities in the window title"""
        productive_patterns = [
            r'\.py\b',  # Python files
            r'\.js\b',  # JavaScript files
            r'\.html\b',  # HTML files
            r'\.css\b',  # CSS files
            r'\.java\b',  # Java files
            r'\.cpp\b|\.c\b|\.h\b',  # C/C++ files
            r'\.php\b',  # PHP files
            r'\.sql\b',  # SQL files
            r'\.md\b',  # Markdown files
            r'\.json\b',  # JSON files
            r'\.xml\b',  # XML files
            r'\.yml\b|\.yaml\b',  # YAML files
            r'\.sh\b|\.bat\b|\.ps1\b',  # Shell scripts
            r'pull request|PR #|issue #|commit',  # Git operations
            r'debug|breakpoint|console|terminal',  # Development activities
            r'localhost|127\.0\.0\.1|0\.0\.0\.0',  # Local development
            r'ssh:|ftp:|sftp:',  # Remote connections
            r'database|db connection|query',  # Database work
            r'meeting notes|agenda|minutes',  # Meeting documentation
            r'report|analysis|dashboard',  # Business activities
            r'project plan|roadmap|sprint',  # Project management
            r'presentation|slides|deck',  # Presentations
            r'document|specification|requirements',  # Documentation
            r'learning|tutorial|course|training',  # Learning activities
        ]
        
        for pattern in productive_patterns:
            if re.search(pattern, window_title, re.IGNORECASE):
                return True
                
        return False
    
    def _check_productivity_keywords(self, window_title):
        """Check for productivity-related keywords in window title"""
        productive_keywords = [
            'work', 'project', 'task', 'meeting', 'email', 'code', 'develop', 'write', 'edit',
            'design', 'create', 'build', 'research', 'learn', 'study', 'review', 'analyse', 'analyze',
            'report', 'document', 'presentation', 'client', 'customer', 'planning', 'debug',
            'test', 'implement', 'deploy', 'database', 'server', 'api', 'cloud', 'git', 'terminal',
            'console', 'editor', 'ide', 'notebook', 'programming', 'development'
        ]
        
        for keyword in productive_keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', window_title, re.IGNORECASE):
                return True
                
        return False
        
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
    
    def add_user_feedback(self, window_info, is_productive):
        """Add user feedback for a misclassified window"""
        app_name, _ = self._extract_app_and_title(window_info)
        clean_app = self._clean_app_name(app_name)
        self.user_feedback[clean_app] = is_productive
        
        # Update the cache as well
        self.classification_cache[clean_app] = {
            'productive': is_productive,
            'timestamp': datetime.now(),
            'source': 'user_feedback'
        }
        
        # If there's significant user feedback, add it to the predefined lists
        if clean_app in self.user_feedback:
            if is_productive:
                self.productive_apps.add(clean_app)
                # Remove from unproductive if it was there
                if clean_app in self.unproductive_apps:
                    self.unproductive_apps.remove(clean_app)
            else:
                self.unproductive_apps.add(clean_app)
                # Remove from productive if it was there
                if clean_app in self.productive_apps:
                    self.productive_apps.remove(clean_app)
    
    def classify_window(self, window_info):
        """
        Enhanced classify window as productive or unproductive
        Uses multiple strategies for more accurate classification
        """
        try:
            # Extract and clean app name and title
            app_name, window_title = self._extract_app_and_title(window_info)
            clean_app = self._clean_app_name(app_name)
            
            # Strategy 1: Known correction check
            if app_name in self.known_corrections:
                return self.known_corrections[app_name]
                
            # Strategy 2: User feedback check
            if clean_app in self.user_feedback:
                return self.user_feedback[clean_app]
            
            # Strategy 3: Check predefined lists first
            if clean_app in self.productive_apps or app_name in self.productive_apps:
                return True
            if clean_app in self.unproductive_apps or app_name in self.unproductive_apps:
                return False
            
            # Strategy 4: Check for domain patterns in window title
            domain_match, is_productive = self._check_domain_patterns(window_title)
            if domain_match:
                return is_productive
                
            # Strategy 5: Check for productive activity patterns in window title
            if self._detect_productive_activities(window_title):
                return True
                
            # Strategy 6: Check for productivity keywords
            if self._check_productivity_keywords(window_title):
                return True
            
            # Strategy 7: Check cache
            if clean_app in self.classification_cache:
                cached_result = self.classification_cache[clean_app]
                if self._is_cached_classification_valid(cached_result):
                    return cached_result['productive']
            
            # Strategy 8: Context-aware AI classification
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    self.rate_limiter.wait_if_needed()
                    
                    # Enhanced prompt with more context
                    prompt = f"""
                    Classify if the application '{app_name}' with window title '{window_title}' is used for productive work purposes.
                    
                    Productive applications include:
                    - Development tools (VSCode, PyCharm, IntelliJ, Sublime, etc.)
                    - Office suites (Word, Excel, PowerPoint, etc.)
                    - Browsers when used for work/research
                    - Communication tools (Teams, Slack, Zoom, etc.)
                    - Design tools (Figma, Photoshop, etc.)
                    - Project management (Jira, Asana, etc.)
                    - Terminal/command line applications
                    - Database tools
                    - Learning platforms
                    
                    Unproductive applications include:
                    - Games and gaming platforms
                    - Social media platforms
                    - Streaming entertainment
                    - Non-work-related video platforms
                    - Messaging apps when not work-related
                    
                    Consider both the application name AND the window title context.
                    For example, VS Code showing a Python file would be productive.
                    
                    Respond with ONLY 'yes' if productive, 'no' if unproductive.
                    """
                    
                    response = self.model.generate_content(prompt)
                    is_productive = 'yes' in response.text.lower() and 'no' not in response.text.lower()
                    
                    # Cache the result
                    self.classification_cache[clean_app] = {
                        'productive': is_productive,
                        'timestamp': datetime.now(),
                        'source': 'ai'
                    }
                    
                    # Periodic cache cleanup
                    self._cleanup_cache()
                    
                    return is_productive
                    
                except Exception as e:
                    if attempt == max_retries - 1:
                        print(f"AI Classification failed after {max_retries} attempts: {e}")
                        # Default to productive for development tools when in doubt
                        return 'code' in clean_app or 'develop' in clean_app or 'studio' in clean_app
                    time.sleep(2 ** attempt)  # Exponential backoff
            
        except Exception as e:
            print(f"Window classification error: {e}")
            return False  # Default to unproductive for any unexpected errors