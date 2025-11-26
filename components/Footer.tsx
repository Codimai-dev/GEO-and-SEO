
import React from 'react';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRODUCTS' | 'FEATURES' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'SERVICES' | 'BLOG';

interface FooterProps {
  onNavigate: (page: PageType) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (page: PageType) => {
    onNavigate(page);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
          <div className="footer-section">
              <img 
                src="CodimAi Logo short.webp" 
                alt="CodimAi Logo" 
                style={{ height: '40px', width: 'auto', marginBottom: '1rem' }} 
              />
              <h4 className="footer-heading" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Everything About AI</h4>
              <div className="social-icons">
                  <a href="#"><i className="fab fa-facebook-f"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                  <a href="#"><i className="fab fa-linkedin-in"></i></a>
              </div>
          </div>

          <div className="footer-section">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('PRODUCTS'); }} className="hover:text-red-500 transition-colors">Products</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('PRICING'); }} className="hover:text-red-500 transition-colors">Pricing</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('CONTACT'); }} className="hover:text-red-500 transition-colors">Contact us</a></li>
              </ul>
          </div>

          <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('SERVICES'); }} className="hover:text-red-500 transition-colors">Our Services</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('BLOG'); }} className="hover:text-red-500 transition-colors">Blog</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleNav('LOGIN'); }} className="hover:text-red-500 transition-colors">Log In</a></li>
              </ul>
          </div>

          <div className="footer-section">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                  <li>Mumbai, India</li>
                  <li>+91 83698 93412</li>
                  <li>Support@codimai.com</li>
              </ul>
          </div>
      </div>

      <div className="footer-bottom flex flex-col md:flex-row justify-between items-center gap-4">
          <p><span className="brand-name">CodimAi</span>, All rights reserved.</p>
          <p className="text-sm text-gray-500">
            Developed by <a href="https://codimai.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">CodimAi</a>
          </p>
      </div>
    </footer>
  );
};

export default Footer;
