// Confirmation page - display booking details from backend
document.addEventListener('DOMContentLoaded', function() {
  const bookingData = localStorage.getItem('lastBooking');
  
  if (bookingData) {
    try {
      const booking = JSON.parse(bookingData);
      
      setDetailValue('detail-name', booking.studentName);
      setDetailValue('detail-email', booking.studentEmail);
      setDetailValue('detail-phone', booking.studentPhone || 'Not provided');
      setDetailValue('detail-tutor', getTutorName(booking.tutor));
      setDetailValue('detail-date', formatDate(booking.sessionDate));
      setDetailValue('detail-time', booking.sessionTime);
      setDetailValue('detail-duration', booking.duration + ' minutes');
      setDetailValue('detail-type', booking.sessionType === 'online' ? 'Online' : 'In-Person');
      setDetailValue('detail-subject', booking.subject);
      setDetailValue('detail-level', booking.level);
      setDetailValue('detail-reference', booking.bookingReference);
      
      if (booking.notes) {
        const notesRow = document.getElementById('notes-row');
        if (notesRow) {
          notesRow.style.display = 'flex';
          setDetailValue('detail-notes', booking.notes);
        }
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    }
  } else {
    alert('No booking data found. Please complete a booking first.');
    window.location.href = 'book.html';
  }
});

function setDetailValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

function getTutorName(tutorId) {
  const tutorNames = {
    'john': 'John Smith',
    'sarah': 'Sarah Johnson',
    'michael': 'Michael Chen',
    'emily': 'Emily Rodriguez'
  };
  return tutorNames[tutorId] || tutorId;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
