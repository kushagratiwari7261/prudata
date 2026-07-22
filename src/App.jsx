import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import { apiService } from './services/api';
import { useParallaxScroll } from './hooks/useParallax';
import './App.css';

// SVG Icon Component
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    cloud: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>,
    web: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
    cpu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="12" x="6" y="6" rx="2" /><path d="M15 2v4M9 2v4M15 18v4M9 18v4M2 15h4M2 9h4M18 15h4M18 9h4" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    arrowRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    mapPin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
    externalLink: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
  };
  return icons[name] || null;
};

// Generic Project Showcase Component with macOS Window UI (and optional iOS overlap)
const ProjectShowcase = ({ title, tag, quote, stats, link, images, mobileImages, reverse }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const currentDesktopImage = images && images.length > 0 ? images[currentIndex] : null;
  const currentMobileImage = mobileImages && mobileImages.length > 0 ? (mobileImages[currentIndex] || mobileImages[0]) : null;

  // Use the max length between desktop and mobile images for slider controls
  const maxImages = Math.max(images?.length || 0, mobileImages?.length || 0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % maxImages);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? maxImages - 1 : prev - 1));

  return (
    <>
      <div className="seal-showcase-box" style={{ marginBottom: '60px' }}>
        <div className="seal-grid" style={{ direction: reverse ? 'rtl' : 'ltr' }}>
          
          <div style={{ direction: 'ltr' }}>
            <span className="seal-tag">{tag}</span>
            <h3 className="seal-title">{title}</h3>
            <p className="seal-quote" style={{ marginTop: '32px' }}>
              {quote}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.875rem' }}>
                <span>Explore Live Platform</span>
                <Icon name="externalLink" size={16} />
              </a>
            )}
          </div>

          <div style={{ direction: 'ltr' }}>
            <div className="showcase-composite-container">
              {currentDesktopImage && (
                <div className="mac-showcase-frame" onClick={() => setLightboxOpen(true)}>
                  <div className="mac-window-bar">
                    <div className="mac-dots">
                      <div className="mac-dot close"></div>
                      <div className="mac-dot min"></div>
                      <div className="mac-dot max"></div>
                    </div>
                    <div className="mac-title">{title.toLowerCase().replace(/\s/g, '-')}.app</div>
                  </div>
                  <div className="mac-content-viewport">
                    <img src={`${process.env.PUBLIC_URL}/images/${currentDesktopImage}`} alt={`${title} Desktop Screen ${currentIndex + 1}`} className="mac-scrolling-image" />
                    {!currentMobileImage && (
                      <div className="floating-overlay-badge">
                        <span className="status-dot" style={{ background: 'var(--accent-sky)' }}></span>
                        <span>Screen {currentIndex + 1} / {maxImages}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentMobileImage && (
                <div className="ios-showcase-frame" onClick={() => setLightboxOpen(true)}>
                  <img src={`${process.env.PUBLIC_URL}/images/${currentMobileImage}`} alt={`${title} Mobile Screen ${currentIndex + 1}`} className="ios-scrolling-image" />
                  <div className="floating-overlay-badge" style={{ bottom: '12px', right: '12px', padding: '6px 12px', fontSize: '0.7rem' }}>
                    <span className="status-dot" style={{ background: 'var(--accent-emerald)', width: '6px', height: '6px' }}></span>
                    <span>{currentIndex + 1} / {maxImages}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="seal-controls-bar">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hover to scroll, click to expand</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="seal-arrow-btn" onClick={prevSlide} title="Previous Screen">‹</button>
                <button className="seal-arrow-btn" onClick={nextSlide} title="Next Screen">›</button>
              </div>
            </div>
            
            <div className="seal-thumbs-strip" style={{ overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '8px' }}>
              {(images || mobileImages || []).map((_, idx) => {
                // If there is a desktop image, show that as thumb, else mobile image
                const thumbImage = (images && images[idx]) || (mobileImages && mobileImages[idx]) || (mobileImages && mobileImages[0]);
                return (
                  <div key={idx} className={`seal-thumb-item ${idx === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(idx)} style={{ flexShrink: 0 }}>
                    <img src={`${process.env.PUBLIC_URL}/images/${thumbImage}`} alt={`Thumbnail ${idx + 1}`} style={{ objectFit: 'cover' }} />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {lightboxOpen && (
          <div className="lightbox-modal" onClick={() => setLightboxOpen(false)}>
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>×</button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={`${process.env.PUBLIC_URL}/images/${currentDesktopImage || currentMobileImage}`} alt={`${title} High Resolution ${currentIndex + 1}`} style={{ objectFit: 'contain' }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const loaderPhases = [
  { text: "INITIALIZING KERNEL...", threshold: 0 },
  { text: "ESTABLISHING SECURE CONNECTION...", threshold: 25 },
  { text: "SYNCING CLOUD REGIONS...", threshold: 60 },
  { text: "DETAILS CONFIRMED", threshold: 100, confirmed: true }
];

// Sci-Fi Game Vault Door Loading Screen
const LoadingScreen = ({ onComplete }) => {
  const [percentage, setPercentage] = useState(0);
  const [phase, setPhase] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let currentPercent = 0;
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 8) + 2; 
      currentPercent += increment;
      
      if (currentPercent >= 100) {
        currentPercent = 100;
        setPercentage(100);
        setPhase(3); 
        clearInterval(interval);
        setTimeout(() => setFadingOut(true), 600); // Trigger vault open
        setTimeout(onComplete, 1600); // Wait for flap animation
      } else {
        setPercentage(currentPercent);
        const nextPhaseIndex = loaderPhases.findIndex(p => currentPercent < p.threshold);
        if (nextPhaseIndex === -1) {
          setPhase(loaderPhases.length - 1);
        } else {
          setPhase(Math.max(0, nextPhaseIndex - 1));
        }
      }
    }, 40); 
    
    return () => clearInterval(interval);
  }, [onComplete]);

  // Calculate hex stroke offset for SVG (approx length 280)
  const strokeOffset = 280 - (percentage / 100) * 280;

  return (
    <div className={`vault-loading-overlay ${fadingOut ? 'vault-open' : ''}`}>
      
      {/* Left and Right Flaps */}
      <div className="vault-flap flap-left">
        <div className="flap-texture"></div>
        <div className="flap-edge"></div>
      </div>
      <div className="vault-flap flap-right">
        <div className="flap-texture"></div>
        <div className="flap-edge"></div>
      </div>
      
      {/* Central Hex Core */}
      <div className="vault-core-container">
         <div className="vault-hex-wrapper">
           <svg className="vault-hex-svg" viewBox="0 0 100 100">
             <polygon className="hex-bg" points="50 5, 90 27.5, 90 72.5, 50 95, 10 72.5, 10 27.5" />
             <polygon className="hex-fill" strokeDashoffset={strokeOffset} points="50 5, 90 27.5, 90 72.5, 50 95, 10 72.5, 10 27.5" />
           </svg>
           <div className="vault-percentage">{percentage}%</div>
         </div>
         
         <div className="vault-status-text">
            <span>{loaderPhases[phase].text}</span>
         </div>
      </div>
      
    </div>
  );
};

// HOMEPAGE COMPONENT (Single Page Scroll Layout)
const LandingPage = () => {
  const scrollY = useParallaxScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [archTab, setArchTab] = useState('infrastructure');
  
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    const handleVisitors = async () => {
      try {
        const count = await apiService.getVisitorCount();
        setVisitorCount(count);
        const newCount = await apiService.incrementVisitorCount();
        if (newCount) setVisitorCount(newCount);
      } catch (error) {
        setVisitorCount(1024);
      }
    };
    handleVisitors();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const integrationLogos = {
    'WhatsApp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    'Gmail': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    'Zoom': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg',
    'Google Calendar': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    'Slack': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'Salesforce': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    'Stripe': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
  };
  const integrationsArray = Object.entries(integrationLogos);

  // Project Images Data
  const sealImages = Array.from({ length: 13 }, (_, i) => `seal${i + 1}.png`);
  
  // Route IQ images mapping
  const routeIqImages = Array.from({ length: 7 }, (_, i) => `route${i + 1}.png`);
  // Re-use the single routeiqmob.jpeg for all 7 screens since it's the only mobile file provided
  const routeIqMobileImages = Array.from({ length: 7 }, () => `routeiqmob.jpeg`);

  // Zenwair Clothing images mapping (.jpeg for mobile)
  const zenwairImages = Array.from({ length: 4 }, (_, i) => `zen${i + 1}.png`);
  const zenwairMobileImages = Array.from({ length: 4 }, (_, i) => `zen${i + 1}mob.jpeg`);

  const testimonials = [
    { name: 'Ajay Kasana', role: 'CEO, Seal Freight', text: 'Prudata re-engineered our core platform, reducing latency by 68%.', init: 'AK' },
    { name: 'Sahil Kasana', role: 'Logistics Director', text: 'The new architecture has transformed our supply chain visibility.', init: 'SK' },
    { name: 'Marcus Chen', role: 'CTO, GlobalTrade', text: 'Unmatched concurrency scaling during our peak holiday seasons.', init: 'MC' },
    { name: 'Elena Rostova', role: 'VP Operations', text: 'Their Supabase implementation eliminated our data sync issues.', init: 'ER' },
    { name: 'David Smith', role: 'Founder, CloudLogistics', text: 'The fastest deployment pipeline we have ever experienced.', init: 'DS' },
    { name: 'Anita Patel', role: 'Chief Architect', text: 'Exceptional zero-trust security architecture.', init: 'AP' },
    { name: 'James Wilson', role: 'Head of Engineering', text: 'Prudata delivered complex microservices ahead of schedule.', init: 'JW' },
    { name: 'Sarah Jenkins', role: 'Product Manager', text: 'The UX is seamless and our user engagement skyrocketed.', init: 'SJ' },
    { name: 'Robert Fox', role: 'Operations Manager', text: 'Automated workflows saved us 40 hours per week.', init: 'RF' },
    { name: 'Lisa Chen', role: 'Data Scientist', text: 'Their AI pipeline integration is state-of-the-art.', init: 'LC' },
    { name: 'Michael Chang', role: 'Lead Developer', text: 'Cleanest codebase and documentation we have received.', init: 'MC' },
    { name: 'Emma Watson', role: 'Supply Chain VP', text: 'Real-time tracking changed how we operate globally.', init: 'EW' },
    { name: 'Thomas Wright', role: 'CEO, WrightLog', text: 'A true technology partner for enterprise scale.', init: 'TW' },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formMessage.text) setFormMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage({ type: '', text: '' });
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      setFormMessage({ type: 'error', text: 'Please complete all required fields.' });
      setSubmitting(false);
      return;
    }
    try {
      const res = await apiService.submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        message: formData.message ? formData.message.trim() : '',
        source: 'landing-page'
      });
      if (res.success) {
        setFormMessage({ type: 'success', text: 'Thank you! Your request has been transmitted securely.' });
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        setFormMessage({ type: 'error', text: res.error || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: 'An unexpected network error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="parallax-bg-layer">
        <div className="parallax-orb parallax-orb-1" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
        <div className="parallax-orb parallax-orb-2" style={{ transform: `translateY(${scrollY * -0.12}px)` }} />
        <div className="parallax-orb parallax-orb-3" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
        <div className="grid-pattern" />
      </div>

      <header className="navbar">
        <div className="nav-container">
          <div className="logo-brand" onClick={() => scrollToSection('hero')}>
            <div className="logo-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="Prudata Logo" />
            </div>
            <span className="logo-text">Prudata</span>
          </div>

          <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <span className="nav-link" onClick={() => scrollToSection('services')}>Services</span>
            <span className="nav-link" onClick={() => scrollToSection('platform')}>Platform</span>
            <span className="nav-link" onClick={() => scrollToSection('process')}>Process</span>
            <span className="nav-link" onClick={() => scrollToSection('clients')}>Clients</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="nav-cta-btn" onClick={() => scrollToSection('contact')}>
              <span className="nav-cta-glow"></span>
              <span className="nav-cta-text">Get Started</span>
            </span>
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ORBITAL HERO SECTION */}
      <section className="orbital-hero-section" id="hero">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
          <div className="hero-badge" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
            <span className="status-dot"></span>
            <span>Next-Gen Enterprise Cloud & AI Engineering</span>
          </div>
          <h1 className="hero-heading" style={{ maxWidth: '900px', transform: `translateY(${scrollY * 0.12}px)` }}>
            Where Ideas Meet Impact – <br/><span className="gradient-accent">Launch Smarter, Grow Faster.</span>
          </h1>
          <p className="hero-description" style={{ transform: `translateY(${scrollY * 0.14}px)` }}>
            We design, engineer, and scale high-concurrency cloud architectures, AI pipelines, and mission-critical SaaS platforms for visionary global enterprises.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center', transform: `translateY(${scrollY * 0.16}px)` }}>
            <span onClick={() => scrollToSection('contact')} className="btn-primary">
              <span>Book CTO Consultation</span>
              <Icon name="arrowRight" size={18} />
            </span>
            <span onClick={() => scrollToSection('services')} className="btn-secondary">
              <span>Explore Architecture</span>
              <Icon name="arrowRight" size={18} />
            </span>
          </div>
        </div>

        <div className="orbital-container" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
          <div className="orbit-center-logo"><img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="Prudata" /></div>
          <div className="orbit-track orbit-track-1">
            <div className="orbit-planet planet-pos-1" title={integrationsArray[0][0]}><img src={integrationsArray[0][1]} alt={integrationsArray[0][0]} /></div>
            <div className="orbit-planet planet-pos-3" title={integrationsArray[1][0]}><img src={integrationsArray[1][1]} alt={integrationsArray[1][0]} /></div>
          </div>
          <div className="orbit-track orbit-track-2">
            <div className="orbit-planet planet-pos-2" title={integrationsArray[2][0]}><img src={integrationsArray[2][1]} alt={integrationsArray[2][0]} /></div>
            <div className="orbit-planet planet-pos-4" title={integrationsArray[3][0]}><img src={integrationsArray[3][1]} alt={integrationsArray[3][0]} /></div>
          </div>
          <div className="orbit-track orbit-track-3">
            <div className="orbit-planet planet-pos-1" title={integrationsArray[4][0]}><img src={integrationsArray[4][1]} alt={integrationsArray[4][0]} /></div>
            <div className="orbit-planet planet-pos-5" title={integrationsArray[5][0]}><img src={integrationsArray[5][1]} alt={integrationsArray[5][0]} /></div>
            <div className="orbit-planet planet-pos-6" title={integrationsArray[6][0]}><img src={integrationsArray[6][1]} alt={integrationsArray[6][0]} /></div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="section-padding">
        <div className="container">
          <div className="section-header-center">
            <div className="section-tag">Core Capabilities</div>
            <h2 className="section-title">Architected for Speed, <span className="gradient-text">Engineered for Scale</span></h2>
            <p className="section-subtitle">From high-throughput cloud infrastructure to intelligent automated workflows, we build software systems that dominate markets.</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon-box"><Icon name="cloud" size={24} /></div>
              <h3 className="service-title">Cloud Infrastructure & Microservices</h3>
              <p className="service-desc">Scalable distributed architectures designed for high availability, failover resilience, and minimal latency.</p>
            </div>
            <div className="service-card">
              <div className="service-icon-box"><Icon name="web" size={24} /></div>
              <h3 className="service-title">Enterprise Web & SaaS Architecture</h3>
              <p className="service-desc">Fluid, ultra-responsive React web applications built with modern engineering design systems.</p>
            </div>
            <div className="service-card">
              <div className="service-icon-box"><Icon name="cpu" size={24} /></div>
              <h3 className="service-title">AI Automation & Pipelines</h3>
              <p className="service-desc">End-to-end intelligent automation pipelines connecting database stores to custom LLM agents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM ARCHITECTURE */}
      <section id="platform" className="section-padding">
        <div className="container">
          <div className="platform-card">
            <div className="section-header-center" style={{ marginBottom: '32px' }}>
              <div className="section-tag">Architecture</div>
              <h2 className="section-title">Enterprise Infrastructure Matrix</h2>
            </div>
            <div className="arch-tabs">
              <button className={`tab-btn ${archTab === 'infrastructure' ? 'active' : ''}`} onClick={() => setArchTab('infrastructure')}>High Availability Infrastructure</button>
              <button className={`tab-btn ${archTab === 'security' ? 'active' : ''}`} onClick={() => setArchTab('security')}>Zero Trust Security</button>
            </div>
            <div className="arch-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '6px' }}>Global Edge Network POPS</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Deploy static assets and API edge workers to over 280 points of presence globally.</p>
                </div>
                <div style={{ padding: '24px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '6px' }}>Supabase PostgreSQL Engine</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Direct database integration offering row-level security policies and sub-millisecond subscriptions.</p>
                </div>
              </div>
              <div style={{ background: 'var(--bg-dark)', borderRadius: '12px', padding: '28px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.05rem' }}>Live Performance Metrics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Average Global Latency</span>
                    <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>14.2 ms</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Automated Failover Target</span>
                    <span style={{ color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>&lt; 3.0 s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="process" className="section-padding">
        <div className="container">
          <div className="section-header-center">
            <div className="section-tag">Execution Process</div>
            <h2 className="section-title">The 4-Step Engineering Framework</h2>
          </div>
          <div className="process-grid">
            <div className="process-card">
              <div className="process-num">01</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '8px' }}>Technical Audit</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>Deep-dive analysis of your existing system architecture. We map out data flows, evaluate compliance boundaries, and pinpoint critical scalability bottlenecks before writing a single line of code.</p>
            </div>
            <div className="process-card">
              <div className="process-num">02</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '8px' }}>Architecture & Specs</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>Drafting the blueprint. We define robust API schemas, design optimal database indexing strategies, and establish a comprehensive enterprise UI component design system tailored to your brand.</p>
            </div>
            <div className="process-card">
              <div className="process-num">03</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '8px' }}>Agile Engineering</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>High-velocity execution. Iterative sprint development utilizing strict continuous integration, automated unit testing, and rigorous peer code reviews to ensure zero technical debt.</p>
            </div>
            <div className="process-card">
              <div className="process-num">04</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '8px' }}>Production Rollout</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>Seamless deployment. Zero-downtime releases targeting multi-region cloud edge networks, backed by exhaustive 24/7 telemetry monitoring and automated failover protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT SHOWCASE SECTION */}
      <section id="clients" className="section-padding" style={{ background: 'var(--bg-dark)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header-center" style={{ marginBottom: '80px' }}>
            <div className="section-tag">Case Studies</div>
            <h2 className="section-title">Selected Works & <span className="gradient-text">Ecosystems</span></h2>
            <p className="section-subtitle">A deep dive into our highest-performing cloud and AI engineering projects.</p>
          </div>

          <ProjectShowcase 
            title="Seal Freight Logistics" 
            tag="Flagship Logistics Engine"
            quote="Transforming legacy supply chains into high-concurrency cloud networks."
            link="https://sealfreight.com/"
            images={sealImages}
            stats={[
              { value: '68%', label: 'Latency Reduction', color: 'var(--accent-blue)' },
              { value: '99.98%', label: 'Platform SLA', color: 'var(--accent-sky)' }
            ]}
          />

          <ProjectShowcase 
            title="Route IQ" 
            tag="AI Fleet Intelligence"
            quote="Predictive routing algorithms mapping over 10 million automated logistics miles daily."
            images={routeIqImages}
            mobileImages={routeIqMobileImages}
            reverse={true}
            stats={[
              { value: '10M+', label: 'Daily Mapped Miles', color: 'var(--accent-emerald)' },
              { value: '3.2s', label: 'Route Calc Time', color: '#8b5cf6' }
            ]}
          />

          <ProjectShowcase 
            title="Zenwair Clothing" 
            tag="E-Commerce Architecture"
            quote="High-conversion digital storefront built for unparalleled performance and aesthetics."
            images={zenwairImages}
            mobileImages={zenwairMobileImages}
            stats={[
              { value: '0.4s', label: 'Avg Page Load', color: '#f59e0b' },
              { value: '42%', label: 'Conversion Lift', color: '#ec4899' }
            ]}
          />

          <div style={{ marginTop: '120px' }}>
            <div className="section-header-center">
              <div className="section-tag">Integration Stack</div>
              <h2 className="section-title">Automated API Connectors</h2>
              <p className="section-subtitle">Seamless connections powering our custom applications.</p>
            </div>
            <div className="integrations-grid">
              {Object.entries(integrationLogos).map(([name, logoUrl]) => (
                <div key={name} className="integration-card">
                  <div className="integration-logo-wrap"><img src={logoUrl} alt={name} loading="lazy" /></div>
                  <div>
                    <div className="integration-name">{name}</div>
                    <div className="integration-sub">Real-Time Sync Ready</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Marquee */}
          <div className="testimonial-marquee-container" style={{ marginTop: '120px' }}>
            <div className="testimonial-marquee-content" style={{ animationDuration: '60s' }}>
              <div className="testimonial-group">
                {testimonials.map((t, idx) => (
                  <div key={`a-${idx}`} className="floating-testimonial" style={{ position: 'relative' }}>
                    <div className="testim-author">
                      <div className="testim-avatar">{t.init}</div>
                      <div><div className="testim-name">{t.name}</div><div className="testim-role">{t.role}</div></div>
                    </div>
                    <p className="testim-text">"{t.text}"</p>
                  </div>
                ))}
              </div>
              <div className="testimonial-group">
                {testimonials.map((t, idx) => (
                  <div key={`b-${idx}`} className="floating-testimonial" style={{ position: 'relative' }}>
                    <div className="testim-author">
                      <div className="testim-avatar">{t.init}</div>
                      <div><div className="testim-name">{t.name}</div><div className="testim-role">{t.role}</div></div>
                    </div>
                    <p className="testim-text">"{t.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="section-padding">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-panel">
              <div className="section-tag">Contact Office</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>Schedule a Consultation</h2>
              <div className="contact-item">
                <div className="contact-icon-wrap"><Icon name="user" size={20} /></div>
                <div><div style={{ fontWeight: '700', color: '#ffffff' }}>Amrit Kumar Sinha</div><div style={{ color: 'var(--accent-blue)' }}>+91 6299348672</div></div>
              </div>
              <div className="contact-item">
                <div className="contact-icon-wrap"><Icon name="mail" size={20} /></div>
                <div><div style={{ fontWeight: '700', color: '#ffffff' }}>Direct Email</div><div style={{ color: 'var(--text-secondary)' }}>prudata.tech@gmail.com</div></div>
              </div>
            </div>
            <div className="contact-form-panel">
              {formMessage.text && <div className={`form-alert ${formMessage.type}`}>{formMessage.text}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Email *</label>
                  <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input type="text" name="company" className="form-control" value={formData.company} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Details</label>
                  <textarea name="message" className="form-control" value={formData.message} onChange={handleInputChange} />
                </div>
                <button type="submit" className="submit-btn" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>{submitting ? 'Transmitting...' : 'Submit Request'}</span>
                  {!submitting && <Icon name="arrowRight" size={18} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SCROLLING LOGO MARQUEE */}
      <div className="scrolling-marquee-container">
        <div className="scrolling-marquee-content">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="marquee-group">
              <span className="marquee-item filled">Prudata Systems</span>
              <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="*" className="marquee-logo" />
              <span className="marquee-item filled">Launch Smarter</span>
              <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="*" className="marquee-logo" />
              <span className="marquee-item filled">Grow Faster</span>
              <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="*" className="marquee-logo" />
            </div>
          ))}
        </div>
      </div>

      {/* GO TO TOP FLOATING BUTTON */}
      <div 
        className={`go-to-top-btn ${scrollY > 500 ? 'visible' : ''}`} 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to Top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>

      {/* FOOTER */}
      <footer className="rwl-footer">
        <div className="container">
          <div className="rwl-footer-grid">
            <div className="rwl-brand-col">
              <h3>Prudata Systems</h3>
              <p className="rwl-text">Bangalore, Karnataka — India</p>
              <a href="mailto:prudata.tech@gmail.com" className="rwl-link" style={{ marginTop: '8px' }}>prudata.tech@gmail.com</a>
              <div style={{ marginTop: '32px' }}>
                <span className="btn-primary" onClick={() => scrollToSection('contact')} style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
                  <span>Book Consultation</span>
                  <Icon name="arrowRight" size={16} />
                </span>
              </div>
            </div>
            <div>
              <div className="rwl-col-title">Engineering</div>
              <div className="rwl-link-list">
                <span className="rwl-link" onClick={() => scrollToSection('services')}>Services</span>
                <span className="rwl-link" onClick={() => scrollToSection('platform')}>Architecture</span>
                <span className="rwl-link" onClick={() => scrollToSection('process')}>Process</span>
              </div>
            </div>
            <div>
              <div className="rwl-col-title">Showcase</div>
              <div className="rwl-link-list">
                <span className="rwl-link" onClick={() => scrollToSection('clients')}>Case Studies</span>
                <Link to="/seal-freight" className="rwl-link">Seal Freight Live</Link>
                <Link to="/admin" className="rwl-link" style={{ color: 'var(--accent-blue)' }}>Admin Console</Link>
              </div>
            </div>
          </div>
          <div className="rwl-bottom">
            <div className="rwl-copyright">
              {new Date().getFullYear()} © Prudata Systems. All rights reserved.
            </div>
            <div className="visitor-badge-footer">
              <span className="status-dot"></span>
              <span>Total Platform Visitors: </span>
              <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {visitorCount !== null ? visitorCount.toLocaleString() : '1,024'}
              </strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ExternalRedirect Component for /seal-freight
const ExternalRedirect = ({ to }) => {
  useEffect(() => { window.location.href = to; }, [to]);
  return <div style={{ background: '#080a14', color: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Redirecting...</div>;
};

// Main App Router Setup
const App = () => {
  const [appLoading, setAppLoading] = useState(true);

  return (
    <>
      {appLoading && <LoadingScreen onComplete={() => setAppLoading(false)} />}
      <div style={{ visibility: appLoading ? 'hidden' : 'visible' }}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/seal-freight" element={<ExternalRedirect to="https://sealfreight.com/" />} />
          </Routes>
        </Router>
      </div>
    </>
  );
};

export default App;
