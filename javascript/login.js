// Login Form Handler - Connected to Backend API
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    addMessageContainers();
    
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      console.log('Login form submitted');
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;
      
      console.log('Form values:', { email, role });
      
      if (!email || !password || !role) {
        showError('Please fill in all required fields');
        return;
      }
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      showLoading(submitBtn);
      
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) errorDiv.style.display = 'none';
      
      try {
        console.log('Calling API.login...');
        const response = await API.login(email, password, role);
        console.log('Login response:', response);
        
        if (response.success) {
          showSuccess('Login successful! Redirecting...');
          
          setTimeout(() => {
            // Redirect based on role
            if (response.data.role === 'admin') {
              window.location.href = 'admin.html';
            } else if (response.data.role === 'tutor') {
              window.location.href = 'tutor-dashboard.html';
            } else {
              window.location.href = 'student-dashboard.html';
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Login error:', error);
        hideLoading(submitBtn);
        showError(error.message || 'Login failed. Please check your credentials.');
      }
    });
  }
});

function addMessageContainers() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm && !document.getElementById('error-message')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.display = 'none';
    errorDiv.className = 'message-box error-message';
    
    const successDiv = document.createElement('div');
    successDiv.id = 'success-message';
    successDiv.style.display = 'none';
    successDiv.className = 'message-box success-message';
    
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
    loginForm.insertBefore(successDiv, loginForm.firstChild);
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }
}

function showLoading(btn) {
  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = 'Loading...';
}

function hideLoading(btn) {
  btn.disabled = false;
  btn.textContent = btn.dataset.originalText || 'Sign In';
}
