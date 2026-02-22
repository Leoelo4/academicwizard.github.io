// Booking Form Handler - Connected to Backend API
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (!token || (!userData.id && !userData._id)) {
    // Show login required message
    document.querySelector('main').innerHTML = `
      <section class="page-hero">
        <h1>Book Your Session</h1>
        <p>Pick a tutor you vibe with, choose a time that works, and let's make it happen!</p>
      </section>
      
      <section class="content-section" style="padding-top: 2rem;">
        <div class="container">
          <div class="card" style="max-width: 600px; margin: 0 auto; padding: 4rem 3rem; text-align: center;">
            <div style="font-size: 5rem; margin-bottom: 2rem;">🔒</div>
            <h2 style="margin-bottom: 1.5rem;">Login Required</h2>
            <p style="color: var(--text-muted); margin-bottom: 3rem; font-size: 1.1rem;">
              You need to be logged in to book a tutoring session. Please sign in to your account or create a new one to continue.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <a href="login.html" class="btn btn-primary">Login to Account</a>
              <a href="signup.html" class="btn btn-secondary">Create Account</a>
            </div>
          </div>
        </div>
      </section>
    `;
    return;
  }
  
  const bookingForm = document.getElementById('bookingForm');
  
  // Load tutors from database
  loadTutors();
  
  // Initialize Flatpickr for enhanced date picking
  const dateInput = document.getElementById('session-date');
  if (dateInput && typeof flatpickr !== 'undefined') {
    flatpickr(dateInput, {
      minDate: "today",
      maxDate: new Date().fp_incr(90), // 90 days from now
      dateFormat: "Y-m-d",
      disableMobile: false,
      onChange: function(selectedDates, dateStr, instance) {
        // Trigger time filtering when date changes
        filterAvailableTimes();
        checkTutorAvailability();
      },
      onReady: function(selectedDates, dateStr, instance) {
        // Add custom styling
        instance.calendarContainer.style.borderRadius = '12px';
        instance.calendarContainer.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)';
      },
      // Disable Sundays (optional - for business scheduling)
      disable: [
        function(date) {
          // Optional: disable Sundays
          // return (date.getDay() === 0);
          return false; // Allow all days for now
        }
      ],
      // Highlight available days
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        // You could mark certain days as popular/busy here
        const day = dayElem.dateObj.getDay();
        if (day === 6 || day === 0) { // Weekends
          dayElem.innerHTML += "<span class='weekend-marker'>📅</span>";
        }
      }
    });
  } else if (dateInput) {
    // Fallback for browsers/environments without flatpickr
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Set max date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    
    // Listen for date changes to filter times
    dateInput.addEventListener('change', filterAvailableTimes);
  }
  
  // Listen for tutor selection to check availability
  const tutorSelect = document.getElementById('tutor');
  if (tutorSelect) {
    tutorSelect.addEventListener('change', function() {
      updateSubjectOptions();
      checkTutorAvailability();
    });
  }
  
  if (bookingForm) {
    addBookingMessageContainers();
    
    // Initialize time filtering on page load
    filterAvailableTimes();
    
    // Payment method change handler
    const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
    const submitBtn = document.getElementById('submit-booking-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    
    paymentMethodInputs.forEach(input => {
      input.addEventListener('change', function() {
        if (this.value === 'stripe') {
          submitBtnText.textContent = 'Proceed to Payment';
        } else {
          submitBtnText.textContent = 'Book Session (Pay Later)';
        }
      });
    });
    
    // Duration change handler - update price estimate
    const durationSelect = document.getElementById('duration');
    const tutorSelect = document.getElementById('tutor');
    
    function updatePriceEstimate() {
      const duration = parseInt(durationSelect.value);
      const tutorId = tutorSelect.value;
      
      if (duration && tutorId) {
        // Get tutor's hourly rate
        const tutorOption = tutorSelect.options[tutorSelect.selectedIndex];
        const tutorData = tutorOption.dataset.tutor ? JSON.parse(tutorOption.dataset.tutor) : null;
        const hourlyRate = tutorData && tutorData.hourlyRate ? tutorData.hourlyRate : 35;
        
        const hours = duration / 60;
        const totalPrice = (hourlyRate * hours).toFixed(2);
        
        document.getElementById('hourly-rate').textContent = `£${hourlyRate.toFixed(2)}`;
        document.getElementById('duration-display').textContent = duration >= 60 ? 
          `${(duration / 60)} hour${duration > 60 ? 's' : ''}` : 
          `${duration} minutes`;
        document.getElementById('total-price').textContent = `£${totalPrice}`;
        document.getElementById('price-estimate').style.display = 'block';
      } else {
        document.getElementById('price-estimate').style.display = 'none';
      }
    }
    
    durationSelect.addEventListener('change', updatePriceEstimate);
    tutorSelect.addEventListener('change', updatePriceEstimate);
    
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

      const formData = {
        // Only send studentId if the logged-in user is actually a student
        studentId: (userData.role === 'student') ? (userData.id || userData._id || null) : null,
        studentName: document.getElementById('student-name').value,
        studentEmail: document.getElementById('email').value,
        studentPhone: document.getElementById('phone').value || null,
        tutor: document.getElementById('tutor').value,
        sessionDate: document.getElementById('session-date').value,
        sessionTime: document.getElementById('session-time').value,
        duration: parseInt(document.getElementById('duration').value),
        sessionType: document.getElementById('session-type').value,
        subject: document.getElementById('subject').value,
        level: document.getElementById('level').value,
        notes: document.getElementById('notes').value || null,
        paymentMethod: paymentMethod
      };
      
      if (!formData.studentName || !formData.studentEmail || !formData.tutor || 
          !formData.sessionDate || !formData.sessionTime || !formData.duration || 
          !formData.sessionType || !formData.subject || !formData.level) {
        showError('Please fill in all required fields', 'booking-error');
        return;
      }
      
      const submitBtnElement = bookingForm.querySelector('button[type="submit"]');
      showLoading(submitBtnElement);
      
      const errorDiv = document.getElementById('booking-error');
      if (errorDiv) errorDiv.style.display = 'none';
      
      try {
        console.log('Creating booking with data:', formData);
        const response = await API.createBooking(formData);
        console.log('Booking response:', response);
        
        if (response.success) {
          const booking = response.data;
          localStorage.setItem('lastBooking', JSON.stringify(booking));
          
          // If payment method is Stripe, create checkout session
          if (paymentMethod === 'stripe') {
            try {
              // Calculate price
              const tutorOption = tutorSelect.options[tutorSelect.selectedIndex];
              const tutorData = tutorOption.dataset.tutor ? JSON.parse(tutorOption.dataset.tutor) : null;
              const tutorName = tutorData ? tutorData.name : 'Academic Wizard Tutor';
              const hourlyRate = tutorData && tutorData.hourlyRate ? tutorData.hourlyRate : 35;
              const hours = formData.duration / 60;
              const totalPrice = hourlyRate * hours;
              
              console.log('Creating payment session:', {
                bookingId: booking._id || booking.id,
                amount: totalPrice,
                subject: formData.subject
              });
              
              const paymentResponse = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                  bookingId: booking._id || booking.id,
                  amount: totalPrice,
                  subject: formData.subject,
                  tutorName: tutorName,
                  sessionDate: formData.sessionDate
                })
              });
              
              const paymentData = await paymentResponse.json();
              console.log('Payment response:', paymentData);
              
              if (paymentData.success && paymentData.url) {
                // Redirect to Stripe checkout
                window.location.href = paymentData.url;
              } else {
                // Fallback to confirmation page
                console.log('Payment URL not available, redirecting to confirmation');
                window.location.href = 'confirmation.html';
              }
            } catch (paymentError) {
              console.error('Payment error:', paymentError);
              hideLoading(submitBtnElement);
              showError('Payment processing failed: ' + paymentError.message, 'booking-error');
            }
          } else {
            // Pay later - go directly to confirmation
            window.location.href = 'confirmation.html';
          }
        } else {
          // Booking creation failed
          hideLoading(submitBtnElement);
          showError(response.message || 'Booking creation failed. Please try again.', 'booking-error');
        }
      } catch (error) {
        console.error('Booking error:', error);
        hideLoading(submitBtnElement);
        showError(error.message || 'Booking failed. Please try again.', 'booking-error');
      }
    });
  }
});

// Filter available times based on current date/time
function filterAvailableTimes() {
  const dateInput = document.getElementById('session-date');
  const timeSelect = document.getElementById('session-time');
  
  if (!dateInput || !timeSelect) return;
  
  const selectedDate = dateInput.value;
  if (!selectedDate) return;
  
  const now = new Date();
  const selectedDateTime = new Date(selectedDate);
  const isToday = selectedDateTime.toDateString() === now.toDateString();
  
  const options = timeSelect.querySelectorAll('option');
  
  options.forEach(option => {
    if (!option.value) return; // Skip the placeholder option
    
    if (isToday) {
      // For today, only show times at least 1 hour from now
      const [hours, minutes] = option.value.split(':');
      const optionTime = new Date();
      optionTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      if (optionTime < oneHourFromNow) {
        option.disabled = true;
        option.style.color = '#999';
        option.style.opacity = '0.5';
      } else {
        option.disabled = false;
        option.style.color = '';
        option.style.opacity = '';
      }
    } else {
      // For future dates, enable all times
      option.disabled = false;
      option.style.color = '';
      option.style.opacity = '';
    }
  });
  
  // Re-check tutor availability if tutor is selected
  checkTutorAvailability();
}

// Check tutor availability for selected date
async function checkTutorAvailability() {
  const tutorSelect = document.getElementById('tutor');
  const dateInput = document.getElementById('session-date');
  const timeSelect = document.getElementById('session-time');
  
  if (!tutorSelect || !dateInput || !timeSelect) return;
  
  const tutor = tutorSelect.value;
  const selectedDate = dateInput.value;
  
  if (!tutor || !selectedDate) return;
  
  try {
    // Fetch booked times for this tutor on the selected date
    const response = await fetch(`http://localhost:5000/api/bookings/availability?tutor=${tutor}&date=${selectedDate}`);
    
    if (response.ok) {
      const data = await response.json();
      const bookedTimes = data.data || [];
      
      // Disable booked times
      const options = timeSelect.querySelectorAll('option');
      options.forEach(option => {
        if (!option.value) return;
        
        // Skip if already disabled due to time filtering
        if (option.disabled) return;
        
        if (bookedTimes.includes(option.value)) {
          option.disabled = true;
          option.style.color = '#999';
          option.style.opacity = '0.5';
          option.style.textDecoration = 'line-through';
          const currentText = option.textContent;
          if (!currentText.includes('(Booked)')) {
            option.textContent = currentText + ' (Booked)';
          }
        } else {
          // Remove (Booked) text if it was previously added
          option.textContent = option.textContent.replace(' (Booked)', '');
          option.style.textDecoration = '';
        }
      });
    }
  } catch (error) {
    console.error('Error checking availability:', error);
  }
}

function selectTutor(tutorId) {
  const tutorSelect = document.getElementById('tutor');
  if (tutorSelect) {
    tutorSelect.value = tutorId;
    document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' });
    checkTutorAvailability();
  }
}

function addBookingMessageContainers() {
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm && !document.getElementById('booking-error')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'booking-error';
    errorDiv.style.display = 'none';
    errorDiv.className = 'message-box error-message';
    
    const successDiv = document.createElement('div');
    successDiv.id = 'booking-success';
    successDiv.style.display = 'none';
    successDiv.className = 'message-box success-message';
    
    bookingForm.insertBefore(errorDiv, bookingForm.firstChild);
    bookingForm.insertBefore(successDiv, bookingForm.firstChild);
  }
}

// Store tutors data globally for access
let allTutors = [];

// Update subject dropdown based on selected tutor
function updateSubjectOptions() {
  const tutorSelect = document.getElementById('tutor');
  const subjectSelect = document.getElementById('subject');
  
  if (!tutorSelect || !subjectSelect) return;
  
  const selectedTutorId = tutorSelect.value;
  
  // Reset subject dropdown
  subjectSelect.innerHTML = '<option value="">-- Select subject --</option>';
  
  if (!selectedTutorId) {
    // If no tutor selected, show all subjects from all tutors
    const allSubjects = new Set();
    allTutors.forEach(tutor => {
      if (tutor.subjects && Array.isArray(tutor.subjects) && tutor.subjects.length > 0) {
        tutor.subjects.forEach(subject => {
          if (subject && subject.trim()) {
            allSubjects.add(subject.trim());
          }
        });
      }
    });
    
    if (allSubjects.size === 0) {
      // No subjects available
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No subjects available - Admin must add subjects to tutors';
      option.disabled = true;
      subjectSelect.appendChild(option);
      return;
    }
    
    // Sort and add all unique subjects
    const sortedSubjects = [...allSubjects].sort();
    sortedSubjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectSelect.appendChild(option);
    });
  } else {
    // Show only selected tutor's subjects
    const selectedTutor = allTutors.find(t => t._id === selectedTutorId);
    
    if (selectedTutor && selectedTutor.subjects && Array.isArray(selectedTutor.subjects) && selectedTutor.subjects.length > 0) {
      selectedTutor.subjects.forEach(subject => {
        if (subject && subject.trim()) {
          const option = document.createElement('option');
          option.value = subject.trim();
          option.textContent = subject.trim();
          subjectSelect.appendChild(option);
        }
      });
    } else {
      // Selected tutor has no subjects
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'This tutor has no subjects - Contact admin';
      option.disabled = true;
      subjectSelect.appendChild(option);
    }
  }
}

// Load tutors from database
async function loadTutors() {
  try {
    const response = await fetch('http://localhost:5000/api/users/tutors');
    
    if (response.ok) {
      const data = await response.json();
      const tutors = data.data || [];
      
      console.log('Tutors loaded:', tutors.length);
      
      // Update tutor cards
      const tutorsGrid = document.querySelector('.tutors-grid');
      if (tutorsGrid) {
        if (tutors.length === 0) {
          tutorsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No tutors available yet. Please check back later.</p>';
        } else {
          tutorsGrid.innerHTML = tutors.map(tutor => {
            const subjects = tutor.subjects && tutor.subjects.length > 0 
              ? tutor.subjects.join(' & ') 
              : 'Multiple Subjects';
            const rate = tutor.hourlyRate || 35;
            const name = tutor.name || 'Tutor';
            const bio = tutor.bio || 'Experienced tutor ready to help you succeed.';
            
            return `
              <div class="tutor-card">
                <div class="tutor-badge">⭐ Available</div>
                <h3>${name}</h3>
                <p class="tutor-subject">${subjects}</p>
                <p>${bio}</p>
                <p class="tutor-price">£${rate}/hour</p>
                <button class="btn btn-primary" onclick="selectTutor('${tutor._id}')">View & Book</button>
              </div>
            `;
          }).join('');
        }
      }
      
      // Update tutor dropdown
      const tutorSelect = document.getElementById('tutor');
      if (tutorSelect) {
        tutorSelect.innerHTML = '<option value="">-- Choose a tutor --</option>';
        tutors.forEach(tutor => {
          const subjects = tutor.subjects && tutor.subjects.length > 0 
            ? tutor.subjects.join(', ') 
            : 'Multiple Subjects';
          const rate = tutor.hourlyRate || 35;
          const name = tutor.name || 'Tutor';
          const option = document.createElement('option');
          option.value = tutor._id;
          option.textContent = `${name} - ${subjects} (£${rate}/hr)`;
          tutorSelect.appendChild(option);
        });
      }
      
      // Store tutors globally for subject filtering
      allTutors = tutors;
      
      // Populate subject dropdown with all unique subjects initially
      updateSubjectOptions();
    } else {
      console.error('Failed to load tutors. Status:', response.status);
      document.querySelector('.tutors-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--error); padding: 3rem;">Failed to load tutors. Please refresh the page.</p>';
    }
  } catch (error) {
    console.error('Error loading tutors:', error);
    document.querySelector('.tutors-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--error); padding: 3rem;">Error loading tutors: ' + error.message + '</p>';
  }
}
