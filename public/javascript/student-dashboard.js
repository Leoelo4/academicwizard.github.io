// Student Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is logged in
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Display user name
  if (userData.name) {
    document.getElementById('user-name').textContent = userData.name;
  }

  // Load student lessons
  loadMyLessons();
});

async function loadMyLessons() {
  try {
    const response = await fetch('http://localhost:5000/api/bookings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const bookings = data.data || [];
      
      // Update stats
      document.getElementById('total-sessions').textContent = bookings.length;
      
      // Count upcoming sessions (future dates)
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.sessionDate) >= now).length;
      document.getElementById('upcoming-sessions').textContent = upcoming;
      
      const lessonsList = document.getElementById('lessons-list');
      
      if (bookings.length === 0) {
        lessonsList.innerHTML = `
          <div style="text-align: center; padding: 3rem;">
            <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 1rem;">No lessons booked yet</p>
            <a href="book.html" class="btn btn-primary">Book Your First Session</a>
          </div>
        `;
        return;
      }

      let html = '<table style="width: 100%; border-collapse: collapse;">';
      html += '<thead><tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.2);">';
      html += '<th style="padding: 1rem; text-align: left;">Reference</th>';
      html += '<th style="padding: 1rem; text-align: left;">Subject</th>';
      html += '<th style="padding: 1rem; text-align: left;">Date</th>';
      html += '<th style="padding: 1rem; text-align: left;">Time</th>';
      html += '<th style="padding: 1rem; text-align: left;">Duration</th>';
      html += '<th style="padding: 1rem; text-align: left;">Type</th>';
      html += '<th style="padding: 1rem; text-align: left;">Status</th>';
      html += '</tr></thead><tbody>';

      // Sort by date (newest first)
      bookings.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

      bookings.forEach(booking => {
        const date = new Date(booking.sessionDate).toLocaleDateString('en-GB');
        const isPast = new Date(booking.sessionDate) < now;
        const statusColor = isPast ? 'var(--text-muted)' : 'var(--success)';
        const statusText = isPast ? 'Completed' : booking.status || 'Pending';
        
        html += `<tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.1);">`;
        html += `<td style="padding: 1rem;">${booking.bookingReference}</td>`;
        html += `<td style="padding: 1rem;">${booking.subject}</td>`;
        html += `<td style="padding: 1rem;">${date}</td>`;
        html += `<td style="padding: 1rem;">${booking.sessionTime}</td>`;
        html += `<td style="padding: 1rem;">${booking.duration} min</td>`;
        html += `<td style="padding: 1rem;">${booking.sessionType === 'online' ? 'Online' : 'In-Person'}</td>`;
        html += `<td style="padding: 1rem; color: ${statusColor};">${statusText}</td>`;
        html += `</tr>`;
      });

      html += '</tbody></table>';
      lessonsList.innerHTML = html;
    } else if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = 'login.html';
    } else {
      document.getElementById('lessons-list').innerHTML = 
        '<p style="color: var(--error);">Failed to load lessons</p>';
    }
  } catch (error) {
    console.error('Error loading lessons:', error);
    document.getElementById('lessons-list').innerHTML = 
      '<p style="color: var(--error);">Error loading lessons</p>';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'login.html';
}
