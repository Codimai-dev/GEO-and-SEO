
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
// Removed House icon import — we no longer display an icon for Dashboard

type PageType = 'LANDING' | 'DASHBOARD' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'HISTORY';

interface NavBarProps {
  onNavigate: (page: PageType, section?: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status on mount and update periodically
    const checkAuth = () => {
      setIsAuthenticated(apiService.isAuthenticated());
    };
    checkAuth();

    // Check every second for auth changes (simple approach)
    const interval = setInterval(checkAuth, 1000);

    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setNavbarHidden(true);
      } else {
        setNavbarHidden(false);
      }
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNav = (page: PageType) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const scrollToSection = (id: string) => {
    // Ensure landing page is visible then scroll to the section via URL
    onNavigate('LANDING', id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    handleNav('LANDING');
  };

  return (
    <nav className={`navbar ${navbarHidden ? 'hidden-nav' : ''}`}>
      <div className="nav-container">
        <div className="logo" onClick={() => handleNav('LANDING')} style={{ cursor: 'pointer' }}>
          <img src="/codimai-logo.webp" alt="CodimAi" style={{ height: '40px', width: 'auto' }} />
        </div>

        {/* Navigation Wrapper: Contains Links and Buttons */}
        <div className={`nav-wrapper ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-menu">
            {isAuthenticated && (
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleNav('DASHBOARD'); }} className="font-medium">
                  Dashboard
                </a>
              </li>
            )}
            <li><a href="products" onClick={(e) => { e.preventDefault(); scrollToSection('products'); }}>Products</a></li>
            <li><a href="features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
            <li><a href="Pricing" onClick={(e) => { e.preventDefault(); handleNav('PRICING'); }}>Pricing</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a></li>
          </ul>
          <div className="nav-buttons">
            {isAuthenticated ? (
              <button className="btn-signup" onClick={handleLogout}>Log Out</button>
            ) : (
              <>
                <button className="btn-login" onClick={() => handleNav('LOGIN')}>Log In</button>
                <button className="btn-signup" onClick={() => handleNav('SIGNUP')}>Sign Up</button>
              </>
            )}
          </div>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
