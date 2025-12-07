import React, { useState, useEffect } from 'react';
import './App.css';

const SaaSUNOLanding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  const sealFreightImages = [
    'seal1.png',
    'seal2.png',
    'seal3.png',
    'seal4.png',
    'seal5.png'
  ];

  // Check if running on localhost
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setIsLocalhost(isLocal);
    console.log('Running on localhost:', isLocal);
  }, []);

  // Fast loading simulation
  useEffect(() => {
    let progress = 0;
    const duration = 1800;
    const intervalTime = 20;
    const totalSteps = duration / intervalTime;
    const increment = 100 / totalSteps;

    const loadingInterval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);
        
        setTimeout(() => {
          setIsLoading(false);
          document.body.classList.remove('loading');
          document.body.classList.add('loaded');
        }, 100);
      }
      setLoadingProgress(progress);
    }, intervalTime);

    document.body.classList.add('loading');

    return () => {
      clearInterval(loadingInterval);
      document.body.classList.remove('loading');
    };
  }, []);

  // Carousel and other existing useEffect
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === sealFreightImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [sealFreightImages.length, isLoading]);

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Handle localhost vs production differently
      if (isLocalhost) {
        // Local development - show mock success
        console.log('Form data submitted locally:', formData);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        alert('✅ Form submitted successfully!\n\n📝 This is a local test. On Vercel, this would save to database.\n\nName: ' + formData.name + '\nEmail: ' + formData.email + '\nCompany: ' + formData.company);
        
        setFormData({ name: '', email: '', company: '', message: '' });
        
      } else {
        // Production on Vercel - call real API
        const apiUrl = '/api/requests';
        
        console.log('Submitting to production API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            company: formData.company.trim(),
            message: formData.message.trim()
          }),
        });

        // Handle response
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          if (response.ok) {
            alert('✅ ' + data.message);
            setFormData({ name: '', email: '', company: '', message: '' });
          } else {
            alert('❌ ' + (data.message || 'Submission failed'));
          }
        } else {
          // Handle non-JSON response
          const text = await response.text();
          console.error('Non-JSON response:', text);
          
          if (response.status === 404) {
            alert('⚠️ API endpoint not found. Please check deployment.');
          } else {
            alert('⚠️ Server error. Please try again later.');
          }
        }
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      
      if (isLocalhost) {
        alert('⚠️ Local test error: ' + error.message);
      } else {
        if (error.message.includes('Failed to fetch')) {
          alert('🌐 Network error. Please check your internet connection.');
        } else {
          alert('⚠️ Error: ' + error.message);
        }
      }
      
    } finally {
      setSubmitting(false);
    }
  };

  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  const goToNext = () => {
    setCurrentImageIndex(current => 
      current === sealFreightImages.length - 1 ? 0 : current + 1
    );
  };

  const goToPrev = () => {
    setCurrentImageIndex(current => 
      current === 0 ? sealFreightImages.length - 1 : current - 1
    );
  };

  return (
    <div className="App">
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-logo">
            <h1>SaasUNO</h1>
            <div className="subtitle">Digital Transformation</div>
          </div>
          
          <div className="spinner">
            <div className="spinner-inner"></div>
          </div>

          <div className="loading-progress">
            <div 
              className="loading-progress-bar" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>

          <div className="loading-percentage">
            {Math.min(100, Math.round(loadingProgress))}%
          </div>

          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      )}

      {/* Main Content - Always rendered but hidden during loading */}
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <h2>SaasUNO</h2>
            </div>
            <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
              <a href="#differentiators" onClick={(e) => { e.preventDefault(); scrollToSection('differentiators'); }}>Differentiators</a>
              <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }}>Workflow</a>
              <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}>Process</a>
              <a href="#clients" onClick={(e) => { e.preventDefault(); scrollToSection('clients'); }}>Clients</a>
              <a href="#contact" className="cta-button" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Get Started</a>
              {isLocalhost && (
                <span style={{ 
                  color: '#ff6b6b', 
                  fontSize: '12px',
                  marginLeft: '10px',
                  padding: '2px 6px',
                  background: '#fff3cd',
                  borderRadius: '4px'
                }}>
                  Local Mode
                </span>
              )}
            </div>
            <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </nav>

        {/* Rest of your component remains the same - keep all sections */}
        
        {/* Contact Section - Updated */}
        <section id="contact" className="contact">
          <div className="container">
            <h2>Start Your Digital Transformation</h2>
            <p className="contact-subtitle">Contact us for a comprehensive consultation and project assessment</p>
            
            {isLocalhost && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <strong>🛠️ Local Development Mode</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
                  Form submissions are simulated locally. Deploy to Vercel for database integration.
                </p>
              </div>
            )}
            
            <div className="contact-content">
              <div className="contact-info">
                <h3>Get In Touch</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <strong>Contact Person</strong>
                    <span>Amrit Kumar Sinha</span>
                  </div>
                  <div className="contact-item">
                    <strong>Company</strong>
                    <span>SaasUNO Technologies</span>
                  </div>
                  <div className="contact-item">
                    <strong>Services</strong>
                    <span>SaaS Development, Cloud Solutions, Digital Transformation</span>
                  </div>
                </div>
              </div>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="company"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    placeholder="Tell us about your project requirements, challenges, and goals..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    required
                    disabled={submitting}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={submitting}
                  style={{ position: 'relative' }}
                >
                  {submitting ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></span>
                      {isLocalhost ? 'Testing...' : 'Submitting...'}
                    </>
                  ) : (
                    isLocalhost ? 'Test Submit (Local)' : 'Send Request'
                  )}
                </button>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  {isLocalhost ? 
                    '🔧 Local test mode - form data will not be saved' : 
                    'Your information is secure and will be saved to our database'
                  }
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>SaasUNO</h3>
                <p>Building your digital future, one innovative solution at a time.</p>
              </div>
              <div className="footer-links">
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
                <a href="#differentiators" onClick={(e) => { e.preventDefault(); scrollToSection('differentiators'); }}>Differentiators</a>
                <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }}>Solutions</a>
                <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}>Process</a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 SaasUNO Technologies. All rights reserved.</p>
              {isLocalhost && (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  Running in local development mode
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SaaSUNOLanding;