// Shared Header and Footer Components for Academic Wizard
// This file reduces code duplication across all HTML pages

function createHeader(activePage = '') {
  return `
    <div class="animated-bg"></div>
    <div class="stars-bg"></div>
    
    <header class="header">
      <div class="container">
        <div class="logo-container">
          <span class="logo-icon">🧙</span>
          <a href="index.html" class="logo">Academic<span class="logo-accent">Wizard</span></a>
        </div>
        <button class="hamburger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="navbar">
          <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="services.html" class="nav-link ${activePage === 'services' ? 'active' : ''}">Services</a>
          <a href="resources.html" class="nav-link ${activePage === 'resources' ? 'active' : ''}">Resources</a>
          <a href="testimonials.html" class="nav-link ${activePage === 'testimonials' ? 'active' : ''}">Testimonials</a>
          <a href="index.html#contact" class="nav-link">Contact</a>
          <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
          <a href="book.html" class="btn btn-primary btn-sm">Book Now</a>
        </nav>
      </div>
    </header>
  `;
}

function createFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Academic Wizard</h4>
            <p>Your pathway to academic excellence</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="services.html">Services</a></li>
              <li><a href="resources.html">Resources</a></li>
              <li><a href="testimonials.html">Testimonials</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>📧 hello@academicwizard.com</p>
            <p>📞 01271 018638</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Academic Wizard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

// Initialize header and footer on page load
document.addEventListener('DOMContentLoaded', function() {
  // Get the active page from the body's data attribute
  const activePage = document.body.dataset.page || '';
  
  // Insert header at the beginning of body (after animated backgrounds if they exist)
  const headerHTML = createHeader(activePage);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = headerHTML;
  
  // Find where to insert (after background elements or at start)
  const firstMain = document.querySelector('main');
  const firstSection = document.querySelector('section');
  const insertBefore = firstMain || firstSection || document.body.firstChild;
  
  while (tempDiv.firstChild) {
    document.body.insertBefore(tempDiv.firstChild, insertBefore);
  }
  
  // Insert footer at the end of body
  const footerHTML = createFooter();
  document.body.insertAdjacentHTML('beforeend', footerHTML);
});
