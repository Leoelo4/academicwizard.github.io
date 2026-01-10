// Admin Dashboard JavaScript

// Modal helper functions
function showModal(modalId) {
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById(modalId).style.display = 'block';
}

function hideAllModals() {
  document.getElementById('modal-overlay').style.display = 'none';
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.style.display = 'none');
}

function showConfirm(title, message) {
  return new Promise((resolve) => {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    showModal('confirm-modal');

    const confirmBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      hideAllModals();
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

function showMessage(title, message, isSuccess = true) {
  return new Promise((resolve) => {
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = message;
    const modal = document.getElementById('message-modal');
    const content = modal.querySelector('.modal-content');
    
    if (isSuccess) {
      content.style.borderColor = 'rgba(16, 185, 129, 0.5)';
      document.getElementById('message-title').style.color = 'var(--success)';
    } else {
      content.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      document.getElementById('message-title').style.color = 'var(--error)';
    }
    
    showModal('message-modal');

    const okBtn = document.getElementById('message-ok');

    const handleOk = () => {
      okBtn.removeEventListener('click', handleOk);
      hideAllModals();
      resolve();
    };

    okBtn.addEventListener('click', handleOk);
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is admin
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  // Check if user is admin
  let user = null;
  try {
    user = JSON.parse(userData);
  } catch (e) {
    console.error('Failed to parse user data');
  }
  
  if (!user || user.role !== 'admin') {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-primary); color: var(--error);">
        <div style="text-align: center;">
          <h1>Access Denied</h1>
          <p>This page is for administrators only.</p>
          <p>You are logged in as: <strong>${user ? user.role : 'unknown'}</strong></p>
          <button onclick="location.href='login.html'" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--brand-primary); color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Go to Login</button>
        </div>
      </div>
    `;
    return;
  }

  // Load dashboard data
  loadStats();
  loadRecentBookings();
  loadTutors();
  loadResources();

  // Handle tutor creation form
  const createTutorForm = document.getElementById('createTutorForm');
  if (createTutorForm) {
    createTutorForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await createTutor();
    });
  }

  // Handle resource upload form
  const uploadResourceForm = document.getElementById('uploadResourceForm');
  if (uploadResourceForm) {
    uploadResourceForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await addResource();
    });
  }
});

async function loadStats() {
  try {
    const token = localStorage.getItem('authToken');
    
    // Get all users
    const usersResponse = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const users = usersData.data || [];
      
      document.getElementById('total-users').textContent = users.length;
      document.getElementById('total-tutors').textContent = 
        users.filter(u => u.role === 'tutor').length;
    } else {
      console.error('Failed to load users:', usersResponse.status);
    }

    // Get all bookings
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      const bookings = bookingsData.data || [];
      document.getElementById('total-bookings').textContent = bookings.length;
    } else {
      console.error('Failed to load bookings:', bookingsResponse.status);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadRecentBookings() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      document.getElementById('bookings-list').innerHTML = 
        '<p style="color: var(--error);">Not authenticated. Please login again.</p>';
      return;
    }

    const response = await fetch('http://localhost:5000/api/bookings/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const bookings = data.data || [];
      
      const bookingsList = document.getElementById('bookings-list');
      
      if (bookings.length === 0) {
        bookingsList.innerHTML = '<p style="color: var(--text-muted);">No bookings yet.</p>';
        return;
      }

      let html = '<table style="width: 100%; border-collapse: collapse;">';
      html += '<thead><tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.2);">';
      html += '<th style="padding: 1rem; text-align: left;">Reference</th>';
      html += '<th style="padding: 1rem; text-align: left;">Student</th>';
      html += '<th style="padding: 1rem; text-align: left;">Tutor</th>';
      html += '<th style="padding: 1rem; text-align: left;">Subject</th>';
      html += '<th style="padding: 1rem; text-align: left;">Session Date</th>';
      html += '<th style="padding: 1rem; text-align: left;">Session Time</th>';
      html += '<th style="padding: 1rem; text-align: left;">Booked At</th>';
      html += '<th style="padding: 1rem; text-align: left;">Amount</th>';
      html += '<th style="padding: 1rem; text-align: left;">Actions</th>';
      html += '</tr></thead><tbody>';

      bookings.slice(0, 10).forEach(booking => {
        const sessionDate = new Date(booking.sessionDate).toLocaleDateString('en-GB');
        const bookedAt = new Date(booking.createdAt).toLocaleDateString('en-GB') + ' ' + 
                         new Date(booking.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        // Handle tutor display - it might be populated object or just a string
        let tutorName = 'N/A';
        if (booking.tutor && typeof booking.tutor === 'object' && booking.tutor.name) {
          tutorName = booking.tutor.name;
        } else if (booking.tutorName) {
          tutorName = booking.tutorName;
        } else if (typeof booking.tutor === 'string') {
          tutorName = booking.tutor;
        }
        
        html += `<tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.1);">`;
        html += `<td style="padding: 1rem;">${booking.bookingReference}</td>`;
        html += `<td style="padding: 1rem;">${booking.studentName}</td>`;
        html += `<td style="padding: 1rem;">${tutorName}</td>`;
        html += `<td style="padding: 1rem;">${booking.subject}</td>`;
        html += `<td style="padding: 1rem;">${sessionDate}</td>`;
        html += `<td style="padding: 1rem;">${booking.sessionTime}</td>`;
        html += `<td style="padding: 1rem; font-size: 0.9rem; color: var(--text-muted);">${bookedAt}</td>`;
        html += `<td style="padding: 1rem;">£${booking.amount.toFixed(2)}</td>`;
        html += `<td style="padding: 1rem;">`;
        html += `<button onclick="editBooking('${booking._id}')" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; margin-right: 0.5rem; font-size: 0.8rem;">Edit</button>`;
        html += `<button onclick="cancelBooking('${booking._id}', '${booking.bookingReference}')" class="btn" style="padding: 0.4rem 0.8rem; background: #dc3545; font-size: 0.8rem;">Cancel</button>`;
        html += `</td>`;
        html += `</tr>`;
      });

      html += '</tbody></table>';
      bookingsList.innerHTML = html;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
    document.getElementById('bookings-list').innerHTML = 
      `<p style="color: var(--error);">Error loading bookings: ${error.message}</p>`;
  }
}

async function createTutor() {
  const name = document.getElementById('tutor-name').value;
  const email = document.getElementById('tutor-email').value;
  const password = document.getElementById('tutor-password').value;
  const phone = document.getElementById('tutor-phone').value;
  const subjectsInput = document.getElementById('tutor-subjects').value;
  const hourlyRate = document.getElementById('tutor-rate').value;
  const bio = document.getElementById('tutor-bio').value;

  // Parse subjects from comma-separated string
  const subjects = subjectsInput.split(',').map(s => s.trim()).filter(s => s);

  const messagesDiv = document.getElementById('tutor-messages');
  messagesDiv.innerHTML = '';

  try {
    // Save admin's current session
    const adminToken = localStorage.getItem('authToken');
    const adminUserData = localStorage.getItem('userData');

    // Create tutor via registration
    const response = await API.register({
      name,
      email,
      password,
      phone,
      role: 'tutor',
      subjects,
      hourlyRate: parseFloat(hourlyRate),
      bio
    });

    // Restore admin's session
    if (adminToken && adminUserData) {
      localStorage.setItem('authToken', adminToken);
      localStorage.setItem('userData', adminUserData);
    }

    if (response.success) {
      messagesDiv.innerHTML = `
        <div class="message-box success-message" style="display: block; margin-bottom: 1rem;">
          Tutor account created successfully!
        </div>
      `;
      document.getElementById('createTutorForm').reset();
      loadStats(); // Refresh stats
      loadTutors(); // Refresh tutors list
    }
  } catch (error) {
    messagesDiv.innerHTML = `
      <div class="message-box error-message" style="display: block; margin-bottom: 1rem;">
        ${error.message || 'Failed to create tutor account'}
      </div>
    `;
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'login.html';
}

async function loadTutors() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      document.getElementById('tutors-list').innerHTML = 
        '<p style="color: var(--error);">Not authenticated. Please login again.</p>';
      return;
    }

    const response = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const users = data.data || [];
    const tutors = users.filter(u => u.role === 'tutor');
    
    const tutorsList = document.getElementById('tutors-list');
    
    if (tutors.length === 0) {
      tutorsList.innerHTML = '<p style="color: var(--text-muted);">No tutors yet. Create one using the form above.</p>';
      return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.2);">';
    html += '<th style="padding: 1rem; text-align: left;">Name</th>';
    html += '<th style="padding: 1rem; text-align: left;">Email</th>';
    html += '<th style="padding: 1rem; text-align: left;">Phone</th>';
    html += '<th style="padding: 1rem; text-align: left;">Subjects</th>';
    html += '<th style="padding: 1rem; text-align: left;">Rate/Hour</th>';
    html += '<th style="padding: 1rem; text-align: left;">Created</th>';
    html += '<th style="padding: 1rem; text-align: left;">Actions</th>';
    html += '</tr></thead><tbody>';

    tutors.forEach(tutor => {
      const created = new Date(tutor.createdAt).toLocaleDateString('en-GB');
      const subjects = tutor.subjects && tutor.subjects.length > 0 
        ? tutor.subjects.join(', ') 
        : 'Not specified';
      const rate = tutor.hourlyRate ? `£${tutor.hourlyRate}` : '£35';
      
      html += `<tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.1);">`;
      html += `<td style="padding: 1rem;">${tutor.name}</td>`;
      html += `<td style="padding: 1rem;">${tutor.email}</td>`;
      html += `<td style="padding: 1rem;">${tutor.phone || 'N/A'}</td>`;
      html += `<td style="padding: 1rem;"><small>${subjects}</small></td>`;
      html += `<td style="padding: 1rem;"><strong>${rate}</strong></td>`;
      html += `<td style="padding: 1rem;">${created}</td>`;
      html += `<td style="padding: 1rem;">`;
      html += `<button onclick="editTutor('${tutor._id}')" class="btn btn-secondary" style="padding: 0.5rem 1rem; margin-right: 0.5rem; font-size: 0.875rem;">Edit</button>`;
      html += `<button onclick="deleteTutor('${tutor._id}', '${tutor.name}')" class="btn" style="padding: 0.5rem 1rem; background: #dc3545; font-size: 0.875rem;">Delete</button>`;
      html += `</td>`;
      html += `</tr>`;
    });

    html += '</tbody></table>';
    tutorsList.innerHTML = html;
  } catch (error) {
    console.error('Error loading tutors:', error);
    document.getElementById('tutors-list').innerHTML = 
      `<p style="color: var(--error);">Error loading tutors: ${error.message}</p>`;
  }
}

async function deleteTutor(tutorId, tutorName) {
  const confirmed = await showConfirm(
    'Delete Tutor',
    `Are you sure you want to delete "${tutorName}"? This action cannot be undone.`
  );
  
  if (!confirmed) return;

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/users/${tutorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      await showMessage('Success', `Tutor "${tutorName}" has been deleted successfully.`, true);
      loadTutors();
      loadStats();
    } else {
      const data = await response.json();
      await showMessage('Error', `Failed to delete tutor: ${data.message || 'Unknown error'}`, false);
    }
  } catch (error) {
    console.error('Error deleting tutor:', error);
    await showMessage('Error', 'Error deleting tutor. Please try again.', false);
  }
}

async function editTutor(tutorId) {
  return new Promise((resolve) => {
    document.getElementById('edit-tutor-name').value = '';
    document.getElementById('edit-tutor-phone').value = '';
    showModal('edit-tutor-modal');

    const form = document.getElementById('edit-tutor-form');
    const cancelBtn = document.getElementById('edit-tutor-cancel');

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const newName = document.getElementById('edit-tutor-name').value.trim();
      const newPhone = document.getElementById('edit-tutor-phone').value.trim();
      
      if (!newName && !newPhone) {
        await showMessage('Info', 'No changes were made.', true);
        cleanup();
        return;
      }

      const updateData = {};
      if (newName) updateData.name = newName;
      if (newPhone) updateData.phone = newPhone;

      try {
        const response = await fetch(`http://localhost:5000/api/users/${tutorId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          cleanup();
          await showMessage('Success', 'Tutor updated successfully!', true);
          loadTutors();
        } else {
          const data = await response.json();
          await showMessage('Error', `Failed to update tutor: ${data.message || 'Unknown error'}`, false);
        }
      } catch (error) {
        console.error('Error updating tutor:', error);
        await showMessage('Error', 'Error updating tutor. Please try again.', false);
      }
    };

    const handleCancel = () => {
      cleanup();
    };

    const cleanup = () => {
      form.removeEventListener('submit', handleSubmit);
      cancelBtn.removeEventListener('click', handleCancel);
      hideAllModals();
      resolve();
    };

    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

async function loadResources() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:5000/api/resources', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const resources = data.data || [];
      
      const resourcesList = document.getElementById('resources-list');
      
      if (resources.length === 0) {
        resourcesList.innerHTML = '<p style="color: var(--text-muted);">No resources yet. Add one using the form above.</p>';
        return;
      }

      let html = '<table style="width: 100%; border-collapse: collapse;">';
      html += '<thead><tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.2);">';
      html += '<th style="padding: 1rem; text-align: left;">Title</th>';
      html += '<th style="padding: 1rem; text-align: left;">Level</th>';
      html += '<th style="padding: 1rem; text-align: left;">Subject</th>';
      html += '<th style="padding: 1rem; text-align: left;">URL</th>';
      html += '<th style="padding: 1rem; text-align: left;">Actions</th>';
      html += '</tr></thead><tbody>';

      resources.forEach(resource => {
        html += `<tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.1);">`;
        html += `<td style="padding: 1rem;">${resource.title}</td>`;
        html += `<td style="padding: 1rem;">${resource.level}</td>`;
        html += `<td style="padding: 1rem;">${resource.subject}</td>`;
        html += `<td style="padding: 1rem;"><a href="${resource.fileUrl}" target="_blank" style="color: var(--brand-accent);">View</a></td>`;
        html += `<td style="padding: 1rem;">`;
        html += `<button onclick="deleteResource('${resource._id}', '${resource.title}')" class="btn" style="padding: 0.4rem 0.8rem; background: #dc3545; font-size: 0.8rem;">Delete</button>`;
        html += `</td>`;
        html += `</tr>`;
      });

      html += '</tbody></table>';
      resourcesList.innerHTML = html;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Error loading resources:', error);
    document.getElementById('resources-list').innerHTML = 
      `<p style="color: var(--error);">Error loading resources: ${error.message}</p>`;
  }
}

async function addResource() {
  const title = document.getElementById('resource-title').value;
  const level = document.getElementById('resource-level').value;
  const subject = document.getElementById('resource-subject').value;
  const description = document.getElementById('resource-description').value;
  const fileUrl = document.getElementById('resource-url').value;

  const messagesDiv = document.getElementById('resource-messages');
  messagesDiv.innerHTML = '';

  try {
    const response = await fetch('http://localhost:5000/api/resources', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, level, subject, description, fileUrl })
    });

    const data = await response.json();

    if (response.ok) {
      messagesDiv.innerHTML = `
        <div class="message-box success-message" style="display: block; margin-bottom: 1rem;">
          Resource added successfully!
        </div>
      `;
      document.getElementById('uploadResourceForm').reset();
      loadResources();
    } else {
      messagesDiv.innerHTML = `
        <div class="message-box error-message" style="display: block; margin-bottom: 1rem;">
          ${data.message || 'Failed to add resource'}
        </div>
      `;
    }
  } catch (error) {
    messagesDiv.innerHTML = `
      <div class="message-box error-message" style="display: block; margin-bottom: 1rem;">
        ${error.message || 'Failed to add resource'}
      </div>
    `;
  }
}

async function deleteResource(resourceId, resourceTitle) {
  const confirmed = await showConfirm(
    'Delete Resource',
    `Are you sure you want to delete "${resourceTitle}"?`
  );
  
  if (!confirmed) return;

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      await showMessage('Success', 'Resource deleted successfully!', true);
      loadResources();
    } else {
      const data = await response.json();
      await showMessage('Error', `Failed to delete resource: ${data.message || 'Unknown error'}`, false);
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    await showMessage('Error', 'Error deleting resource. Please try again.', false);
  }
}

async function editBooking(bookingId) {
  return new Promise((resolve) => {
    document.getElementById('edit-booking-date').value = '';
    document.getElementById('edit-booking-time').value = '';
    showModal('edit-booking-modal');

    const form = document.getElementById('edit-booking-form');
    const cancelBtn = document.getElementById('edit-booking-cancel');

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const newDate = document.getElementById('edit-booking-date').value;
      const newTime = document.getElementById('edit-booking-time').value;
      
      if (!newDate && !newTime) {
        await showMessage('Info', 'No changes were made.', true);
        cleanup();
        return;
      }

      const updateData = {};
      if (newDate) updateData.sessionDate = newDate;
      if (newTime) updateData.sessionTime = newTime;

      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          cleanup();
          await showMessage('Success', 'Booking updated successfully!', true);
          loadRecentBookings();
        } else {
          const data = await response.json();
          await showMessage('Error', `Failed to update booking: ${data.message || 'Unknown error'}`, false);
        }
      } catch (error) {
        console.error('Error updating booking:', error);
        await showMessage('Error', 'Error updating booking. Please try again.', false);
      }
    };

    const handleCancel = () => {
      cleanup();
    };

    const cleanup = () => {
      form.removeEventListener('submit', handleSubmit);
      cancelBtn.removeEventListener('click', handleCancel);
      hideAllModals();
      resolve();
    };

    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

async function cancelBooking(bookingId, bookingReference) {
  const confirmed = await showConfirm(
    'Cancel Booking',
    `Are you sure you want to cancel booking ${bookingReference}? This action cannot be undone.`
  );
  
  if (!confirmed) return;

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      await showMessage('Success', `Booking ${bookingReference} has been cancelled successfully.`, true);
      loadRecentBookings();
      loadStats();
    } else {
      const data = await response.json();
      await showMessage('Error', `Failed to cancel booking: ${data.message || 'Unknown error'}`, false);
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    await showMessage('Error', 'Error cancelling booking. Please try again.', false);
  }
}
