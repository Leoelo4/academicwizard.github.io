// Tutor Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is logged in
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Display tutor name
  if (userData.name) {
    document.getElementById('tutor-name').textContent = userData.name;
  }

  // Load tutor sessions
  loadMySessions();
});

async function loadMySessions() {
  try {
    // Get tutor sessions using the tutor-specific endpoint
    const response = await fetch('http://localhost:5000/api/bookings/my-sessions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const bookings = data.data || [];
      
      // Update stats
      document.getElementById('total-sessions').textContent = bookings.length;
      
      // Count this week's sessions
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      const thisWeek = bookings.filter(b => {
        const sessionDate = new Date(b.sessionDate);
        return sessionDate >= now && sessionDate <= weekFromNow;
      }).length;
      document.getElementById('week-sessions').textContent = thisWeek;
      
      // Calculate total earnings
      const totalEarned = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
      document.getElementById('total-earned').textContent = `£${totalEarned.toFixed(2)}`;
      
      const sessionsList = document.getElementById('sessions-list');
      
      if (bookings.length === 0) {
        sessionsList.innerHTML = `
          <div style="text-align: center; padding: 3rem;">
            <p style="color: var(--text-muted); font-size: 1.2rem;">No sessions booked yet</p>
            <p style="color: var(--text-secondary); margin-top: 1rem;">Sessions will appear here once students book with you</p>
          </div>
        `;
        return;
      }

      let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">';
      html += '<thead><tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.2);">';
      html += '<th style="padding: 1rem; text-align: left;">Reference</th>';
      html += '<th style="padding: 1rem; text-align: left;">Student</th>';
      html += '<th style="padding: 1rem; text-align: left;">Subject</th>';
      html += '<th style="padding: 1rem; text-align: left;">Level</th>';
      html += '<th style="padding: 1rem; text-align: left;">Date</th>';
      html += '<th style="padding: 1rem; text-align: left;">Time</th>';
      html += '<th style="padding: 1rem; text-align: left;">Duration</th>';
      html += '<th style="padding: 1rem; text-align: left;">Type</th>';
      html += '<th style="padding: 1rem; text-align: left;">Amount</th>';
      html += '<th style="padding: 1rem; text-align: left;">Status</th>';
      html += '</tr></thead><tbody>';

      // Sort by date (upcoming first)
      bookings.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

      bookings.forEach(booking => {
        const date = new Date(booking.sessionDate).toLocaleDateString('en-GB');
        const sessionDateTime = new Date(booking.sessionDate + ' ' + booking.sessionTime);
        const isPast = sessionDateTime < now;
        const rowStyle = isPast ? 'opacity: 0.6;' : '';
        
        // Determine status
        let statusBadge = '';
        if (isPast) {
          statusBadge = '<span style="background: var(--text-muted); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">Completed</span>';
        } else {
          statusBadge = '<span style="background: var(--success); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">Upcoming</span>';
        }
        
        html += `<tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.1); ${rowStyle}">`;
        html += `<td style="padding: 1rem;"><strong>${booking.bookingReference}</strong></td>`;
        html += `<td style="padding: 1rem;">${booking.studentName}<br><small style="color: var(--text-muted);">${booking.studentEmail}</small></td>`;
        html += `<td style="padding: 1rem;">${booking.subject}</td>`;
        html += `<td style="padding: 1rem;">${booking.level}</td>`;
        html += `<td style="padding: 1rem;">${date}</td>`;
        html += `<td style="padding: 1rem;">${booking.sessionTime}</td>`;
        html += `<td style="padding: 1rem;">${booking.duration} min</td>`;
        html += `<td style="padding: 1rem;">${booking.sessionType === 'online' ? '💻 Online' : '🏫 In-Person'}</td>`;
        html += `<td style="padding: 1rem;"><strong>£${booking.amount.toFixed(2)}</strong></td>`;
        html += `<td style="padding: 1rem;">${statusBadge}</td>`;
        html += `</tr>`;
      });

      html += '</tbody></table></div>';
      sessionsList.innerHTML = html;
    } else if (response.status === 401 || response.status === 403) {
      document.getElementById('sessions-list').innerHTML = 
        '<p style="color: var(--error);">Access denied. Please make sure you are logged in as a tutor.</p>';
    } else {
      document.getElementById('sessions-list').innerHTML = 
        '<p style="color: var(--error);">Failed to load sessions</p>';
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    document.getElementById('sessions-list').innerHTML = 
      '<p style="color: var(--error);">Error loading sessions. Please try again later.</p>';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'login.html';
}
