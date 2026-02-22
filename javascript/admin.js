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
  loadStudents();
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
    
    let allUsers = []; // Store users for later use
    
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
      allUsers = users; // Save for recent activity
      
      const students = users.filter(u => u.role === 'student').length;
      const tutors = users.filter(u => u.role === 'tutor').length;
      const admins = users.filter(u => u.role === 'admin').length;
      
      document.getElementById('total-users').textContent = users.length;
      document.getElementById('total-tutors').textContent = tutors;
      
      // Enhanced breakdowns
      document.getElementById('users-breakdown').textContent = 
        `${students} students, ${tutors} tutors, ${admins} admins`;
      document.getElementById('tutors-breakdown').textContent = 
        `${tutors} active tutors available`;
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
      
      const pending = bookings.filter(b => b.status === 'pending').length;
      const confirmed = bookings.filter(b => b.status === 'confirmed').length;
      const completed = bookings.filter(b => b.status === 'completed').length;
      const cancelled = bookings.filter(b => b.status === 'cancelled').length;
      
      document.getElementById('total-bookings').textContent = bookings.length;
      document.getElementById('bookings-breakdown').textContent = 
        `${pending} pending, ${confirmed} confirmed, ${completed} completed`;
      
      // Calculate this week's data
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const bookingsThisWeek = bookings.filter(b => 
        new Date(b.createdAt) >= oneWeekAgo
      ).length;
      
      const completedThisWeek = bookings.filter(b => 
        b.status === 'completed' && new Date(b.updatedAt) >= oneWeekAgo
      ).length;
      
      document.getElementById('bookings-this-week').textContent = bookingsThisWeek;
      document.getElementById('completed-this-week').textContent = completedThisWeek;
      document.getElementById('pending-bookings').textContent = pending;
      
      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => {
        return sum + (booking.amount || 0);
      }, 0);
      
      document.getElementById('total-revenue').textContent = `£${totalRevenue.toFixed(2)}`;
      
      // Calculate revenue breakdown
      const paidRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      const pendingRevenue = bookings
        .filter(b => b.paymentStatus === 'pending')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      
      document.getElementById('revenue-breakdown').textContent = 
        `£${paidRevenue.toFixed(2)} paid, £${pendingRevenue.toFixed(2)} pending`;
      
      // Calculate active students (students with at least one booking)
      const uniqueStudentIds = new Set(
        bookings
          .filter(b => b.studentId)
          .map(b => b.studentId)
      );
      const activeStudentsCount = uniqueStudentIds.size;
      
      document.getElementById('active-students').textContent = activeStudentsCount;
      
      // Calculate active students breakdown
      const studentsThisMonth = bookings.filter(b => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return b.studentId && new Date(b.createdAt) >= oneMonthAgo;
      });
      const uniqueStudentsThisMonth = new Set(studentsThisMonth.map(b => b.studentId)).size;
      
      document.getElementById('students-breakdown').textContent = 
        `${uniqueStudentsThisMonth} active this month`;
      
      // Load recent activity with both bookings and users
      loadRecentActivity(bookings, allUsers);
    } else {
      console.error('Failed to load bookings:', bookingsResponse.status);
    }

    // Get all resources
    const resourcesResponse = await fetch('http://localhost:5000/api/resources', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (resourcesResponse.ok) {
      const resourcesData = await resourcesResponse.json();
      const resources = resourcesData.data || [];
      document.getElementById('total-resources').textContent = resources.length;
      
      const subjects = [...new Set(resources.map(r => r.subject))];
      document.getElementById('resources-breakdown').textContent = 
        `${subjects.length} subjects covered`;
    } else {
      console.error('Failed to load resources:', resourcesResponse.status);
    }

    // Calculate users this week
    const usersThisWeek = await calculateUsersThisWeek(token);
    document.getElementById('users-this-week').textContent = usersThisWeek;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function calculateUsersThisWeek(token) {
  try {
    const response = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const users = data.data || [];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return users.filter(u => new Date(u.createdAt) >= oneWeekAgo).length;
    }
  } catch (error) {
    console.error('Error calculating users this week:', error);
  }
  return 0;
}

function loadRecentActivity(bookings, users) {
  const activityList = document.getElementById('recent-activity-list');
  
  // Sort bookings by creation date (most recent first)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  if (recentBookings.length === 0) {
    activityList.innerHTML = '<li class="activity-item">No recent activity</li>';
    return;
  }
  
  activityList.innerHTML = recentBookings.map(booking => {
    const date = new Date(booking.createdAt);
    const timeAgo = getTimeAgo(date);
    const studentName = booking.studentName || 'Unknown Student';
    const subject = booking.subject || 'Unknown Subject';
    
    let statusIcon = '📚';
    if (booking.status === 'confirmed') statusIcon = '✅';
    if (booking.status === 'completed') statusIcon = '🎓';
    if (booking.status === 'cancelled') statusIcon = '❌';
    
    return `
      <li class="activity-item">
        ${statusIcon} <strong>${studentName}</strong> booked <strong>${subject}</strong> 
        <span style="color: #95a5a6;">${timeAgo}</span>
      </li>
    `;
  }).join('');
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
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

    // Setup search functionality for tutors
    const searchInput = document.getElementById('tutors-search');
    if (searchInput) {
      // Remove any existing listeners
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      newSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = tutorsList.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      });
    }
  } catch (error) {
    console.error('Error loading tutors:', error);
    document.getElementById('tutors-list').innerHTML = 
      `<p style="color: var(--error);">Error loading tutors: ${error.message}</p>`;
  }
}

async function loadStudents() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      document.getElementById('students-list').innerHTML = 
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
    const students = users.filter(u => u.role === 'student');
    
    const studentsList = document.getElementById('students-list');
    
    if (students.length === 0) {
      studentsList.innerHTML = '<p style="color: var(--text-muted);">No students yet.</p>';
      return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.2);">';
    html += '<th style="padding: 1rem; text-align: left;">Name</th>';
    html += '<th style="padding: 1rem; text-align: left;">Email</th>';
    html += '<th style="padding: 1rem; text-align: left;">Phone</th>';
    html += '<th style="padding: 1rem; text-align: left;">Joined</th>';
    html += '<th style="padding: 1rem; text-align: left;">Actions</th>';
    html += '</tr></thead><tbody>';

    students.forEach(student => {
      const joined = new Date(student.createdAt).toLocaleDateString('en-GB');
      
      html += `<tr style="border-bottom: 1px solid rgba(102, 126, 234, 0.1);">`;
      html += `<td style="padding: 1rem;">${student.name}</td>`;
      html += `<td style="padding: 1rem;">${student.email}</td>`;
      html += `<td style="padding: 1rem;">${student.phone || 'N/A'}</td>`;
      html += `<td style="padding: 1rem;">${joined}</td>`;
      html += `<td style="padding: 1rem;">`;
      html += `<button onclick="editStudent('${student._id}')" class="btn btn-secondary" style="padding: 0.5rem 1rem; margin-right: 0.5rem; font-size: 0.875rem;">Edit</button>`;
      html += `<button onclick="deleteStudent('${student._id}', '${student.name}')" class="btn" style="padding: 0.5rem 1rem; background: #dc3545; font-size: 0.875rem;">Delete</button>`;
      html += `</td>`;
      html += `</tr>`;
    });

    html += '</tbody></table>';
    studentsList.innerHTML = html;

    // Setup search functionality for students
    const searchInput = document.getElementById('students-search');
    if (searchInput) {
      // Remove any existing listeners
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      newSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = studentsList.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      });
    }
  } catch (error) {
    console.error('Error loading students:', error);
    document.getElementById('students-list').innerHTML = 
      `<p style="color: var(--error);">Error loading students: ${error.message}</p>`;
  }
}

async function editStudent(studentId) {
  return new Promise((resolve) => {
    document.getElementById('edit-tutor-name').value = '';
    document.getElementById('edit-tutor-phone').value = '';
    showModal('edit-tutor-modal');

    // Change title for student editing
    const modalTitle = document.querySelector('#edit-tutor-modal h3');
    const originalTitle = modalTitle.textContent;
    modalTitle.textContent = 'Edit Student';

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
        const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          cleanup();
          await showMessage('Success', 'Student updated successfully!', true);
          loadStudents();
        } else {
          const data = await response.json();
          await showMessage('Error', `Failed to update student: ${data.message || 'Unknown error'}`, false);
        }
      } catch (error) {
        console.error('Error updating student:', error);
        await showMessage('Error', 'Error updating student. Please try again.', false);
      }
    };

    const handleCancel = () => {
      cleanup();
    };

    const cleanup = () => {
      modalTitle.textContent = originalTitle;
      form.removeEventListener('submit', handleSubmit);
      cancelBtn.removeEventListener('click', handleCancel);
      hideAllModals();
      resolve();
    };

    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

async function deleteStudent(studentId, studentName) {
  const confirmed = await showConfirm(
    'Delete Student',
    `Are you sure you want to delete "${studentName}"? This action cannot be undone.`
  );
  
  if (!confirmed) return;

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      await showMessage('Success', `Student "${studentName}" has been deleted successfully.`, true);
      loadStudents();
      loadStats();
    } else {
      const data = await response.json();
      await showMessage('Error', `Failed to delete student: ${data.message || 'Unknown error'}`, false);
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    await showMessage('Error', 'Error deleting student. Please try again.', false);
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
