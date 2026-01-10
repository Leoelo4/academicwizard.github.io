// Navbar scroll effect
window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', function() {
  // Add role-based navigation links
  addRoleBasedNavigation();
  
  const hamburger = document.querySelector('.hamburger');
  const navbar = document.querySelector('.navbar');
  
  if (hamburger && navbar) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navbar.classList.toggle('active');
    });
    
    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link, .navbar .btn');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navbar.contains(event.target);
      const isClickOnHamburger = hamburger.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnHamburger && navbar.classList.contains('active')) {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
      }
    });
  }
});

// Add role-based navigation links if user is logged in
function addRoleBasedNavigation() {
  const userData = localStorage.getItem('userData');
  const navbar = document.querySelector('.navbar');
  
  if (!navbar) return;
  
  // Check if we're already on admin.html, student-dashboard.html, or tutor-dashboard.html
  const currentPage = window.location.pathname.split('/').pop();
  const isDashboardPage = currentPage === 'admin.html' || 
                          currentPage === 'student-dashboard.html' || 
                          currentPage === 'tutor-dashboard.html';
  
  if (!userData) {
    // User not logged in - show login button, hide logout
    const loginBtn = navbar.querySelector('.login-btn');
    const logoutBtn = navbar.querySelector('.logout-btn');
    const dashboardLink = navbar.querySelector('.dashboard-link');
    
    if (loginBtn) loginBtn.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (dashboardLink) dashboardLink.remove();
    return;
  }
  
  const user = JSON.parse(userData);
  
  // Check if dashboard link already exists or if we're on a dashboard page
  if (navbar.querySelector('.dashboard-link') || isDashboardPage) {
    // Hide login button if logged in
    const loginBtn = navbar.querySelector('.login-btn');
    if (loginBtn) loginBtn.style.display = 'none';
    return;
  }
  
  // Hide login button, show logout
  const loginBtn = navbar.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.style.display = 'none';
  }
  
  // Create dashboard link based on role (only if not on a dashboard page)
  let dashboardLink = '';
  let dashboardText = '';
  
  if (user.role === 'admin') {
    dashboardLink = 'admin.html';
    dashboardText = 'Admin Dashboard';
  } else if (user.role === 'tutor') {
    dashboardLink = 'tutor-dashboard.html';
    dashboardText = 'My Dashboard';
  } else if (user.role === 'student') {
    dashboardLink = 'student-dashboard.html';
    dashboardText = 'My Dashboard';
  }
  
  if (dashboardLink) {
    const link = document.createElement('a');
    link.href = dashboardLink;
    link.className = 'nav-link dashboard-link';
    link.textContent = dashboardText;
    
    // Insert before the Book Now button
    const bookButton = navbar.querySelector('.btn-primary');
    if (bookButton) {
      navbar.insertBefore(link, bookButton);
    } else {
      navbar.appendChild(link);
    }
  }
  
  // Add logout button if it doesn't exist (for non-dashboard pages)
  if (!navbar.querySelector('.logout-btn') && !isDashboardPage) {
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'btn btn-secondary btn-sm logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = function(e) {
      e.preventDefault();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = 'index.html';
    };
    navbar.appendChild(logoutBtn);
  }
}
