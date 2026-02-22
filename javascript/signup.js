// Signup Form Handler - Connected to Backend API
document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  
  if (signupForm) {
    addMessageContainers();
    
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const role = document.getElementById('role').value;
      
      // Validation
      if (!name || !email || !password || !confirmPassword || !role) {
        showError('Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }
      
      if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
      }
      
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      showLoading(submitBtn);
      
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) errorDiv.style.display = 'none';
      
      try {
        const userData = {
          name,
          email,
          password,
          role
        };
        
        if (phone) {
          userData.phone = phone;
        }
        
        const response = await API.register(userData);
        
        if (response.success) {
          showSuccess('Account created successfully! Redirecting to login...');
          
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        }
      } catch (error) {
        hideLoading(submitBtn);
        showError(error.message || 'Registration failed. Please try again.');
      }
    });
  }
});

function addMessageContainers() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm && !document.getElementById('error-message')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.display = 'none';
    errorDiv.className = 'message-box error-message';
    
    const successDiv = document.createElement('div');
    successDiv.id = 'success-message';
    successDiv.style.display = 'none';
    successDiv.className = 'message-box success-message';
    
    signupForm.insertBefore(errorDiv, signupForm.firstChild);
    signupForm.insertBefore(successDiv, signupForm.firstChild);
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
  btn.textContent = 'Creating Account...';
}

function hideLoading(btn) {
  btn.disabled = false;
  btn.textContent = btn.dataset.originalText || 'Create Account';
}
