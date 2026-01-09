// Booking System Functions

// Select tutor from tutor cards
function selectTutor(tutorId) {
  const tutorSelect = document.getElementById('tutor');
  const tutorMap = {
    'john': 'john',
    'sarah': 'sarah',
    'michael': 'michael',
    'emily': 'emily'
  };
  
  tutorSelect.value = tutorMap[tutorId];
  
  // Scroll to booking form
  document.querySelector('.booking-form').scrollIntoView({ behavior: 'smooth' });
}

// Handle booking form submission
document.addEventListener('DOMContentLoaded', function() {
  const bookingForm = document.getElementById('bookingForm');
  
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect form data
      const formData = {
        studentName: document.getElementById('student-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        tutor: document.getElementById('tutor').value,
        date: document.getElementById('session-date').value,
        time: document.getElementById('session-time').value,
        duration: document.getElementById('duration').value,
        sessionType: document.getElementById('session-type').value,
        subject: document.getElementById('subject').value,
        level: document.getElementById('level').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
      };
      
      // Store booking in localStorage (for demo purposes)
      let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      bookings.push(formData);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      
      // Generate booking reference
      const reference = generateBookingReference();
      
      // Redirect to confirmation page with booking details
      const params = new URLSearchParams({
        name: formData.studentName,
        email: formData.email,
        phone: formData.phone,
        tutor: formData.tutor,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        type: formData.sessionType,
        subject: formData.subject,
        level: formData.level,
        notes: formData.notes,
        ref: reference
      });
      
      window.location.href = `confirmation.html?${params.toString()}`;
      
      // In a real application, you would send this data to a backend server
      console.log('Booking submitted:', formData);
    });
  }
});

// Show success message
function showSuccessMessage() {
  const message = document.createElement('div');
  message.className = 'success-message';
  message.innerHTML = `
    <div class="success-content">
      <h3>✓ Booking Confirmed!</h3>
      <p>We've received your booking request. You'll receive a confirmation email shortly.</p>
    </div>
  `;
  
  document.body.appendChild(message);
  
  // Add CSS for animation
  const style = document.createElement('style');
  style.textContent = `
    .success-message {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 212, 255, 0.1);
      border: 2px solid #00d4ff;
      border-radius: 12px;
      padding: 2rem;
      z-index: 1000;
      animation: successSlideIn 0.3s ease-out forwards;
      max-width: 400px;
    }
    
    .success-content {
      text-align: center;
      color: #ededed;
    }
    
    .success-content h3 {
      color: #00d4ff;
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }
    
    .success-content p {
      color: #b0b0b0;
      font-size: 0.95rem;
      line-height: 1.6;
    }
    
    @keyframes successSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    message.style.animation = 'successSlideIn 0.3s ease-out reverse forwards';
    setTimeout(() => message.remove(), 300);
  }, 5000);
}

// Generate unique booking reference
function generateBookingReference() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `AW-${timestamp}-${random}`.toUpperCase();
}

// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
  const dateInput = document.getElementById('session-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});
