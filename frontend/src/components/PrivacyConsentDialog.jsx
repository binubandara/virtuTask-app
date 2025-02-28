import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Accordion } from 'react-bootstrap';
import { productivityService } from '../services/api';

const PrivacyConsentDialog = ({ onConsent }) => {
  const [show, setShow] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [dataAgreementChecked, setDataAgreementChecked] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const storedConsent = localStorage.getItem('virtutask_privacy_consent');
    if (storedConsent) {
      setHasConsented(true);
      onConsent(true);
    } else {
      setShow(true);
    }
  }, [onConsent]);

  const handleClose = () => {
    // If user dismisses without consent, app should not proceed
    if (!hasConsented) {
      // Here you might want to show another message explaining they can't use the app
      alert('VirtuTask requires privacy consent to function. The application will be limited until consent is provided.');
    }
    setShow(false);
  };

  const handleConsent = async () => {
    try {
        // Save consent to localStorage with timestamp
        const consentData = {
            consented: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem('virtutask_privacy_consent', JSON.stringify(consentData));
        
        // Save initial privacy settings to backend
        await productivityService.updatePrivacySettings({
            enableScreenshots: true,
            screenshotInterval: 15,
            enableTextExtraction: true,
            enableAiAnalysis: true
        });
        
        setHasConsented(true);
        setShow(false);
        onConsent(true);
    } catch (error) {
        alert('Failed to save privacy settings. Please try again.');
        console.error('Error saving privacy settings:', error);
    }
};

  const allChecked = consentChecked && dataAgreementChecked;

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      backdrop="static" 
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header>
        <Modal.Title>Privacy Consent</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-4 border-primary">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">VirtuTask Privacy Consent</h5>
          </Card.Header>
          <Card.Body>
            <p>
              VirtuTask helps you track your productivity by monitoring window usage and 
              periodically taking screenshots of your work environment. Before you proceed, 
              we need your explicit consent to collect this data.
            </p>
            
            <h6 className="mt-4 mb-3">Data Collection</h6>
            <ul>
              <li><strong>Active Windows:</strong> We track which applications and windows you use during your session</li>
              <li><strong>Screenshot Capture:</strong> We periodically capture screenshots (every 15 minutes) to analyze your work patterns</li>
              <li><strong>Text Extraction:</strong> We extract text from screenshots to help categorize your activities</li>
              <li><strong>Session Metrics:</strong> We calculate productivity metrics based on your application usage</li>
            </ul>
            
            <h6 className="mt-4 mb-3">Data Usage</h6>
            <p>
              We use all data stored solely to provide you with productivity insights and generate reports.
            </p>
            
            <h6 className="mt-4 mb-3">Data Security</h6>
            <p>
              The app may use Google's Gemini API to analyze text,
              which is subject to Google's privacy policy.
            </p>
            
            <Accordion className="mt-4">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Detailed Privacy Policy</Accordion.Header>
                <Accordion.Body>
                  <h6>1. Data Collection and Storage</h6>
                  <p>
                    VirtuTask collects information about your active windows, applications usage, and 
                    periodic screenshots. This data is stored in a database.
                    Screenshots are processed to extract text for productivity analysis.
                  </p>
                  
                  <h6>2. Third-Party Services</h6>
                  <p>
                    We use Google's Gemini API to analyze extracted text and generate productivity insights.
                    Text extracted from your screenshots may be sent to Google's servers for processing.
                    No identifiable information beyond the extracted text is shared.
                  </p>
                  
                  <h6>3. Data Retention</h6>
                  <p>
                    Your data is stored until you explicitly delete it through the application settings.
                    You can delete individual sessions or all data at any time.
                  </p>
                  
                  <h6>4. Your Rights</h6>
                  <p>
                    You have the right to access, export, and delete your data at any time through the application.
                    You can also revoke your consent in the application settings, which will stop all tracking activities.
                  </p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            
            <Form className="mt-4">
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="consent-check"
                  label="I understand that VirtuTask will monitor my window usage and capture periodic screenshots"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mb-2"
                />
                <Form.Check 
                  type="checkbox"
                  id="data-agreement-check"
                  label="I agree to the collection, processing, and storage of my data as described above"
                  checked={dataAgreementChecked}
                  onChange={(e) => setDataAgreementChecked(e.target.checked)}
                />
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConsent} 
          disabled={!allChecked}
        >
          I Consent
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivacyConsentDialog;