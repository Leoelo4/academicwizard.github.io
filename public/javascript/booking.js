// Booking Form Handler - Connected to Backend API
document.addEventListener('DOMContentLoaded', function() {
  const bookingForm = document.getElementById('bookingForm');
  
  // Load tutors from database
  loadTutors();
  
  const dateInput = document.getElementById('session-date');
  if (dateInput) {
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
    tutorSelect.addEventListener('change', checkTutorAvailability);
  }
  
  if (bookingForm) {
    addBookingMessageContainers();
    
    // Initialize time filtering on page load
    filterAvailableTimes();
    
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
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
        notes: document.getElementById('notes').value || null
      };
      
      if (!formData.studentName || !formData.studentEmail || !formData.tutor || 
          !formData.sessionDate || !formData.sessionTime || !formData.duration || 
          !formData.sessionType || !formData.subject || !formData.level) {
        showError('Please fill in all required fields', 'booking-error');
        return;
      }
      
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      showLoading(submitBtn);
      
      const errorDiv = document.getElementById('booking-error');
      if (errorDiv) errorDiv.style.display = 'none';
      
      try {
        const response = await API.createBooking(formData);
        
        if (response.success) {
          localStorage.setItem('lastBooking', JSON.stringify(response.data));
          window.location.href = 'confirmation.html';
        }
      } catch (error) {
        hideLoading(submitBtn);
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

// Load tutors from database
async function loadTutors() {
  try {
    const response = await fetch('http://localhost:5000/api/users/tutors');
    
    if (response.ok) {
      const data = await response.json();
      const tutors = data.data || [];
      
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
            
            return `
              <div class="tutor-card">
                <div class="tutor-badge">⭐ Available</div>
                <h3>${tutor.name}</h3>
                <p class="tutor-subject">${subjects}</p>
                <p>${tutor.bio || 'Experienced tutor ready to help you succeed.'}</p>
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
          const option = document.createElement('option');
          option.value = tutor._id;
          option.textContent = `${tutor.name} - ${subjects} (£${rate}/hr)`;
          tutorSelect.appendChild(option);
        });
      }
      
      // Populate subject dropdown with unique subjects from all tutors
      const subjectSelect = document.getElementById('subject');
      if (subjectSelect) {
        const allSubjects = new Set();
        tutors.forEach(tutor => {
          if (tutor.subjects && tutor.subjects.length > 0) {
            tutor.subjects.forEach(subject => allSubjects.add(subject.trim()));
          }
        });
        
        if (allSubjects.size > 0) {
          // Keep the first option, replace the rest
          const currentValue = subjectSelect.value;
          const firstOption = subjectSelect.options[0];
          subjectSelect.innerHTML = '';
          subjectSelect.appendChild(firstOption);
          
          [...allSubjects].sort().forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
          });
          
          if (currentValue) {
            subjectSelect.value = currentValue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading tutors:', error);
  }
}
