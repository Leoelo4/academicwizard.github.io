// Display booking confirmation details

document.addEventListener('DOMContentLoaded', function() {
  // Get booking data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // If no data in URL, check localStorage for latest booking
  if (!urlParams.has('name')) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    if (bookings.length > 0) {
      const latestBooking = bookings[bookings.length - 1];
      displayBookingDetails(latestBooking);
    } else {
      // No booking found, redirect to booking page
      window.location.href = 'book.html';
    }
  } else {
    // Get data from URL parameters
    const bookingData = {
      studentName: urlParams.get('name'),
      email: urlParams.get('email'),
      phone: urlParams.get('phone'),
      tutor: urlParams.get('tutor'),
      date: urlParams.get('date'),
      time: urlParams.get('time'),
      duration: urlParams.get('duration'),
      sessionType: urlParams.get('type'),
      subject: urlParams.get('subject'),
      level: urlParams.get('level'),
      notes: urlParams.get('notes'),
      reference: urlParams.get('ref')
    };
    
    displayBookingDetails(bookingData);
  }
});

function displayBookingDetails(data) {
  // Populate all fields
  document.getElementById('detail-name').textContent = data.studentName || '-';
  document.getElementById('detail-email').textContent = data.email || '-';
  document.getElementById('detail-phone').textContent = data.phone || '-';
  
  // Format tutor name
  const tutorName = formatTutorName(data.tutor);
  document.getElementById('detail-tutor').textContent = tutorName;
  
  // Format date
  if (data.date) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('detail-date').textContent = formattedDate;
  }
  
  document.getElementById('detail-time').textContent = data.time || '-';
  document.getElementById('detail-duration').textContent = data.duration || '-';
  
  // Format session type
  const sessionType = formatSessionType(data.sessionType);
  document.getElementById('detail-type').textContent = sessionType;
  
  document.getElementById('detail-subject').textContent = data.subject || '-';
  document.getElementById('detail-level').textContent = data.level || '-';
  
  // Show notes if they exist
  if (data.notes && data.notes.trim() !== '') {
    document.getElementById('notes-row').style.display = 'flex';
    document.getElementById('detail-notes').textContent = data.notes;
  }
  
  // Display or generate booking reference
  const reference = data.reference || generateReference();
  document.getElementById('detail-reference').textContent = reference;
}

function formatTutorName(tutorId) {
  const tutorNames = {
    'john': 'Dr. John Smith',
    'sarah': 'Dr. Sarah Johnson',
    'michael': 'Dr. Michael Chen',
    'emily': 'Dr. Emily Davis'
  };
  return tutorNames[tutorId] || tutorId;
}

function formatSessionType(type) {
  const types = {
    'online': 'Online Session',
    'in-person': 'In-Person Session',
    'hybrid': 'Hybrid Session'
  };
  return types[type] || type;
}

function generateReference() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `AW-${timestamp}-${random}`.toUpperCase();
}
