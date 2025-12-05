/**
 * NavBar Component
 * Main navigation with authentication state.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'HISTORY';

interface NavBarProps {
  onNavigate: (page: PageType, section?: string, replace?: boolean, resetReport?: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => apiService.isAuthenticated());

  useEffect(() => {
    // Check auth on mount only - no polling needed
    setIsAuthenticated(apiService.isAuthenticated());

    // Listen for auth state changes (custom event from apiService)
    const handleAuthChange = (e: CustomEvent<{ isAuthenticated: boolean }>) => {
      setIsAuthenticated(e.detail.isAuthenticated);
    };

    // Listen for storage events (cross-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'codimai_token') {
        setIsAuthenticated(!!e.newValue);
      }
    };

    // Scroll handler for hiding navbar
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setNavbarHidden(currentScroll > lastScroll && currentScroll > 100);
      lastScroll = currentScroll;
    };

    window.addEventListener('auth-change', handleAuthChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNav = useCallback((page: PageType) => {
    // Reset report when going to Dashboard
    if (page === 'DASHBOARD') {
      onNavigate(page, undefined, false, true);
    } else {
      onNavigate(page);
    }
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [onNavigate]);

  const scrollToSection = useCallback((id: string) => {
    onNavigate('LANDING', id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [onNavigate]);

  const handleLogout = useCallback(() => {
    apiService.logout();
    setIsAuthenticated(false);
    handleNav('LANDING');
  }, [handleNav]);

  return (
    <nav className={`navbar ${navbarHidden ? 'hidden-nav' : ''}`}>
      <div className="nav-container">
        <div
          className="logo"
          onClick={() => handleNav('LANDING')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNav('LANDING')}
        >
          <img src="/codimai-logo.webp" alt="CodimAi" style={{ height: '40px', width: 'auto' }} />
        </div>

        {/* Navigation Wrapper */}
        <div className={`nav-wrapper ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-menu">
            {isAuthenticated && (
              <li>
                <a
                  href="/dashboard"
                  onClick={(e) => { e.preventDefault(); handleNav('DASHBOARD'); }}
                  className="font-medium"
                >
                  Dashboard
                </a>
              </li>
            )}
            <li>
              <a href="/products" onClick={(e) => { e.preventDefault(); scrollToSection('products'); }}>
                Products
              </a>
            </li>
            <li>
              <a href="/features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                Features
              </a>
            </li>
            <li>
              <a href="/pricing" onClick={(e) => { e.preventDefault(); handleNav('PRICING'); }}>
                Pricing
              </a>
            </li>
            <li>
              <a href="/services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>
                Services
              </a>
            </li>
          </ul>

          <div className="nav-buttons">
            {isAuthenticated ? (
              <button className="btn-signup" onClick={handleLogout}>
                Log Out
              </button>
            ) : (
              <>
                <button className="btn-login" onClick={() => handleNav('LOGIN')}>
                  Log In
                </button>
                <button className="btn-signup" onClick={() => handleNav('SIGNUP')}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          role="button"
          tabIndex={0}
          aria-label="Toggle menu"
          onKeyDown={(e) => e.key === 'Enter' && setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
