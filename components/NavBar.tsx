
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRODUCTS' | 'FEATURES' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'SERVICES' | 'BLOG' | 'HISTORY';

interface NavBarProps {
  onNavigate: (page: PageType) => void;
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
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('PRODUCTS'); }}>Products</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('FEATURES'); }}>Features</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('PRICING'); }}>Pricing</a></li>
            {isAuthenticated && (
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('HISTORY'); }} className="text-brand-400 font-medium">History</a></li>
            )}
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('SERVICES'); }}>Services</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('BLOG'); }}>Blog</a></li>
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
