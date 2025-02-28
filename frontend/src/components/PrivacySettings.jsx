import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { productivityService } from '../services/api';

const PrivacySettings = () => {
  const [consentInfo, setConsentInfo] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    enableScreenshots: true,
    screenshotInterval: 15,
    enableTextExtraction: true,
    enableAiAnalysis: true
  });
  
  useEffect(() => {
    // Load consent information from localStorage
    const storedConsent = localStorage.getItem('virtutask_privacy_consent');
    if (storedConsent) {
        setConsentInfo(JSON.parse(storedConsent));
    }
    
    // Load privacy settings from backend
    const loadSettings = async () => {
        try {
            const backendSettings = await productivityService.getPrivacySettings();
            setSettings(backendSettings);
        } catch (error) {
            console.error('Failed to load privacy settings from backend:', error);
            // Fall back to defaults if backend request fails
            setSettings({
                enableScreenshots: true,
                screenshotInterval: 15,
                enableTextExtraction: true,
                enableAiAnalysis: true
            });
        }
    };
    
    loadSettings();
}, []);
  
  const handleSettingChange = async (setting, value) => {
    try {
        const newSettings = { ...settings, [setting]: value };
        setSettings(newSettings);
        
        // Save to backend
        await productivityService.updatePrivacySettings(newSettings);
        
        // Also save to localStorage as backup
        localStorage.setItem('virtutask_privacy_settings', JSON.stringify(newSettings));
    } catch (error) {
        console.error('Failed to update privacy settings:', error);
        alert('Failed to save setting. Please try again.');
    }
  };
  
  const handleRevokeConsent = () => {
    // Remove consent and settings
    localStorage.removeItem('virtutask_privacy_consent');
    localStorage.removeItem('virtutask_privacy_settings');
    
    // Reload the app to show consent dialog again
    window.location.reload();
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  
  
  return (
    <div className="container py-4">
      <h4 className="mb-4">Privacy Settings</h4>
      
      {consentInfo && (
        <Alert variant="info" className="mb-4">
          <strong>Consent Status:</strong> Active since {formatDate(consentInfo.timestamp)}
          <br />
          <strong>Privacy Policy Version:</strong> {consentInfo.version}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Data Collection Settings</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="screenshot-switch"
                label="Enable Screenshots (required for productivity analysis)"
                checked={settings.enableScreenshots}
                onChange={(e) => handleSettingChange('enableScreenshots', e.target.checked)}
                disabled={true} // Core functionality can't be disabled
              />
              <Form.Text className="text-muted">
                Screenshots are essential for app functionality and cannot be disabled.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Screenshot Interval (minutes)</Form.Label>
              <Form.Select 
                value={settings.screenshotInterval}
                onChange={(e) => handleSettingChange('screenshotInterval', parseInt(e.target.value))}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (recommended)</option>
                <option value={30}>30 minutes</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="text-extraction-switch"
                label="Enable Text Extraction from Screenshots"
                checked={settings.enableTextExtraction}
                onChange={(e) => handleSettingChange('enableTextExtraction', e.target.checked)}
              />
              <Form.Text className="text-muted">
                Extract text from screenshots to better categorize your activities.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="ai-analysis-switch"
                label="Enable AI Analysis (uses Google Gemini API)"
                checked={settings.enableAiAnalysis}
                onChange={(e) => handleSettingChange('enableAiAnalysis', e.target.checked)}
              />
              <Form.Text className="text-muted">
                Uses AI to generate session summaries and productivity insights.
              </Form.Text>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mb-4 border-danger">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">Revoke Consent</h5>
        </Card.Header>
        <Card.Body>
          <p>
            Revoking consent will stop all tracking functionality and require you to provide 
            consent again to use VirtuTask. Your existing data will remain stored unless you 
            explicitly delete it.
          </p>
          <Button 
            variant="outline-danger" 
            onClick={() => setShowRevokeModal(true)}
          >
            Revoke Consent
          </Button>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Data Management</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-grid gap-2">
            <Button variant="outline-secondary">
              Export All My Data
            </Button>
            <Button variant="outline-danger">
              Delete All My Data
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Revoke Consent Confirmation Modal */}
      <Modal show={showRevokeModal} onHide={() => setShowRevokeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Consent Revocation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to revoke your consent? This will:
          </p>
          <ul>
            <li>Immediately stop all tracking functionality</li>
            <li>Require you to provide consent again to use VirtuTask</li>
            <li>Your existing data will remain stored until you explicitly delete it</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRevokeModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRevokeConsent}>
            Revoke Consent
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PrivacySettings;