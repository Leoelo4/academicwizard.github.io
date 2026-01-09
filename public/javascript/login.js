// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Validate inputs
    if (!email || !password || !role) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    
    try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/auth/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password, role, remember })
        // });
        
        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock success - TODO: Remove when backend is ready
        console.log('Login attempt:', { email, role, remember });
        
        // Store mock user data
        const mockUser = {
            email: email,
            role: role,
            name: email.split('@')[0],
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        if (remember) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            switch(role) {
                case 'student':
                    window.location.href = 'dashboard-student.html';
                    break;
                case 'tutor':
                    window.location.href = 'dashboard-tutor.html';
                    break;
                case 'admin':
                    window.location.href = 'dashboard-admin.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please check your credentials and try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Show message helper
function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMsg = document.querySelector('.login-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `login-message ${type}`;
    msgDiv.textContent = message;
    
    // Insert before form
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(msgDiv, form);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 5000);
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.role) {
        showMessage('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
            switch(user.role) {
                case 'student':
                    window.location.href = 'dashboard-student.html';
                    break;
                case 'tutor':
                    window.location.href = 'dashboard-tutor.html';
                    break;
                case 'admin':
                    window.location.href = 'dashboard-admin.html';
                    break;
            }
        }, 1500);
    }
});

// Social login handlers (placeholder)
document.querySelectorAll('.alt-login button').forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.textContent.includes('Google') ? 'Google' : 'Microsoft';
        showMessage(`${provider} login not yet implemented. Coming soon!`, 'info');
    });
});
