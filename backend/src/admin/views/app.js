// DOM Elements
const pageTitle = document.getElementById('page-title');
const pageContent = document.getElementById('page-content');
const navLinks = document.querySelectorAll('.nav-link');
const refreshBtn = document.getElementById('refresh-btn');

// Bootstrap Modal instances
const userDetailsModal = new bootstrap.Modal(document.getElementById('user-details-modal'));
const requestDetailsModal = new bootstrap.Modal(document.getElementById('request-details-modal'));
const certificationUpdateModal = new bootstrap.Modal(document.getElementById('certification-update-modal'));
const videoModal = new bootstrap.Modal(document.getElementById('video-modal'));

// Charts
let emergencyRequestsChart;

// Current page
let currentPage = 'dashboard';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set up navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      changePage(page);
    });
  });

  // Set up refresh button
  refreshBtn.addEventListener('click', () => {
    loadPageData(currentPage);
  });

  // Set up users search
  document.getElementById('users-search-btn').addEventListener('click', () => {
    loadUsers();
  });

  // Set up emergency requests filter
  document.getElementById('request-filter-btn').addEventListener('click', () => {
    loadEmergencyRequests();
  });

  // Set up certification filter
  document.getElementById('certification-filter-btn').addEventListener('click', () => {
    loadCertifications();
  });

  // Set up certification update
  document.getElementById('certification-update-btn').addEventListener('click', () => {
    updateCertification();
  });

  // Set up video modal
  document.getElementById('add-video-btn').addEventListener('click', () => {
    openVideoModal();
  });

  document.getElementById('video-save-btn').addEventListener('click', () => {
    saveVideo();
  });

  // Load initial data
  loadPageData('dashboard');
});

// Change the current page
function changePage(page) {
  // Update navigation
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update page title
  pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');

  // Update page content
  document.querySelectorAll('.page-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${page}-page`).classList.add('active');

  // Update current page
  currentPage = page;

  // Load page data
  loadPageData(page);
}

// Load data for the current page
function loadPageData(page) {
  switch (page) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'users':
      loadUsers();
      break;
    case 'emergency-requests':
      loadEmergencyRequests();
      break;
    case 'certifications':
      loadCertifications();
      break;
    case 'training-videos':
      loadTrainingVideos();
      break;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch('/admin/api/stats');
    const data = await response.json();

    // Update dashboard stats
    document.getElementById('total-users').textContent = data.users.total;
    document.getElementById('emergency-users').textContent = data.users.emergencyUsers;
    document.getElementById('first-responders').textContent = data.users.firstResponders;
    document.getElementById('pending-certifications').textContent = data.certifications.pending;

    // Create or update emergency requests chart
    createEmergencyRequestsChart(data.emergencyRequests);

    // Load recent emergency requests
    loadRecentEmergencyRequests();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    alert('Failed to load dashboard data. Please try again.');
  }
}

// Create emergency requests chart
function createEmergencyRequestsChart(data) {
  const ctx = document.getElementById('emergency-requests-chart').getContext('2d');

  // Destroy existing chart if it exists
  if (emergencyRequestsChart) {
    emergencyRequestsChart.destroy();
  }

  emergencyRequestsChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
      datasets: [{
        data: [
          data.pending,
          data.total - data.pending - data.completed,
          data.completed,
          0 // We don't have cancelled count in the API response
        ],
        backgroundColor: [
          '#ffc107', // Pending - warning
          '#17a2b8', // Accepted - info
          '#28a745', // Completed - success
          '#6c757d'  // Cancelled - secondary
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Emergency Requests by Status'
        }
      }
    }
  });
}

// Load recent emergency requests
async function loadRecentEmergencyRequests() {
  try {
    const response = await fetch('/admin/api/recent-emergency-requests');
    const data = await response.json();

    // Update the table
    const tableBody = document.getElementById('recent-requests-table');
    tableBody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4" class="text-center">No emergency requests found</td>';
      tableBody.appendChild(row);
      return;
    }

    data.forEach(request => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${request.emergencyType}</td>
        <td><span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span></td>
        <td>${request.EmergencyUser && request.EmergencyUser.User ? request.EmergencyUser.User.name : 'N/A'}</td>
        <td>${new Date(request.time).toLocaleString()}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading recent emergency requests:', error);
    alert('Failed to load recent emergency requests. Please try again.');
  }
}

// Load users
async function loadUsers() {
  try {
    const searchQuery = document.getElementById('users-search').value;
    let url = '/admin/api/users';
    
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();

    // Update the table
    const tableBody = document.getElementById('users-table');
    tableBody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" class="text-center">No users found</td>';
      tableBody.appendChild(row);
      return;
    }

    data.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.contactInfo}</td>
        <td>${user.userType || 'Not set'}</td>
        <td>${new Date(user.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-primary view-user-btn" data-id="${user.id}">
            <i class="bi bi-eye"></i> View
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to view buttons
    document.querySelectorAll('.view-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-id');
        viewUserDetails(userId);
      });
    });
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users. Please try again.');
  }
}

// View user details
async function viewUserDetails(userId) {
  try {
    const response = await fetch(`/admin/api/users/${userId}`);
    const user = await response.json();

    // Update the modal content
    const modalContent = document.getElementById('user-details-content');
    
    let certificationStatus = 'Not requested';
    if (user.Certification) {
      certificationStatus = `<span class="badge bg-${getStatusBadgeClass(user.Certification.status)}">${user.Certification.status}</span>`;
    }

    modalContent.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <div class="user-info">
            <h5>Basic Information</h5>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Contact:</strong> ${user.contactInfo}</p>
            <p><strong>User Type:</strong> ${user.userType || 'Not set'}</p>
            <p><strong>Created At:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> ${new Date(user.updatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="user-info">
            <h5>Location</h5>
            <p><strong>Latitude:</strong> ${user.latitude}</p>
            <p><strong>Longitude:</strong> ${user.longitude}</p>
          </div>
          <div class="user-info">
            <h5>Certification</h5>
            <p><strong>Status:</strong> ${certificationStatus}</p>
            ${user.Certification ? `
              <p><strong>Progress:</strong> ${user.Certification.progress}%</p>
              <div class="progress mb-3">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${user.Certification.progress}%" aria-valuenow="${user.Certification.progress}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <p><strong>Completed Training:</strong> ${user.Certification.completedTraining ? 'Yes' : 'No'}</p>
              ${user.Certification.requestedAt ? `<p><strong>Requested At:</strong> ${new Date(user.Certification.requestedAt).toLocaleString()}</p>` : ''}
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Show the modal
    userDetailsModal.show();
  } catch (error) {
    console.error('Error loading user details:', error);
    alert('Failed to load user details. Please try again.');
  }
}

// Load emergency requests
async function loadEmergencyRequests() {
  try {
    const statusFilter = document.getElementById('request-status-filter').value;
    let url = '/admin/api/emergency-requests';
    
    if (statusFilter) {
      url += `?status=${encodeURIComponent(statusFilter)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();

    // Update the table
    const tableBody = document.getElementById('requests-table');
    tableBody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" class="text-center">No emergency requests found</td>';
      tableBody.appendChild(row);
      return;
    }

    data.forEach(request => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${request.emergencyType}</td>
        <td><span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span></td>
        <td>${request.EmergencyUser && request.EmergencyUser.User ? request.EmergencyUser.User.name : 'N/A'}</td>
        <td>${request.FirstResponder && request.FirstResponder.User ? request.FirstResponder.User.name : 'N/A'}</td>
        <td>${new Date(request.time).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-primary view-request-btn" data-id="${request.requestId}">
            <i class="bi bi-eye"></i> View
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to view buttons
    document.querySelectorAll('.view-request-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const requestId = btn.getAttribute('data-id');
        viewRequestDetails(requestId);
      });
    });
  } catch (error) {
    console.error('Error loading emergency requests:', error);
    alert('Failed to load emergency requests. Please try again.');
  }
}

// View emergency request details
async function viewRequestDetails(requestId) {
  try {
    const response = await fetch(`/admin/api/emergency-requests/${requestId}`);
    const request = await response.json();

    // Update the modal content
    const modalContent = document.getElementById('request-details-content');
    
    modalContent.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <div class="request-info">
            <h5>Basic Information</h5>
            <p><strong>Type:</strong> ${request.emergencyType}</p>
            <p><strong>Status:</strong> <span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span></p>
            <p><strong>Time:</strong> ${new Date(request.time).toLocaleString()}</p>
            <p><strong>Created At:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> ${new Date(request.updatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="request-info">
            <h5>Location</h5>
            <p><strong>Latitude:</strong> ${request.latitude}</p>
            <p><strong>Longitude:</strong> ${request.longitude}</p>
          </div>
          <div class="request-info">
            <h5>Users</h5>
            <p><strong>Emergency User:</strong> ${request.EmergencyUser && request.EmergencyUser.User ? request.EmergencyUser.User.name : 'N/A'}</p>
            <p><strong>First Responder:</strong> ${request.FirstResponder && request.FirstResponder.User ? request.FirstResponder.User.name : 'N/A'}</p>
          </div>
        </div>
      </div>
      ${request.Feedback ? `
        <div class="row mt-3">
          <div class="col-12">
            <div class="request-info">
              <h5>Feedback</h5>
              <p><strong>Rating:</strong> ${request.Feedback.rating} / 5</p>
              <p><strong>Comments:</strong> ${request.Feedback.comments || 'No comments'}</p>
              <p><strong>Submitted At:</strong> ${new Date(request.Feedback.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    // Show the modal
    requestDetailsModal.show();
  } catch (error) {
    console.error('Error loading request details:', error);
    alert('Failed to load request details. Please try again.');
  }
}

// Load certifications
async function loadCertifications() {
  try {
    const statusFilter = document.getElementById('certification-status-filter').value;
    let url = '/admin/api/certifications';
    
    if (statusFilter) {
      url += `?status=${encodeURIComponent(statusFilter)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();

    // Update the table
    const tableBody = document.getElementById('certifications-table');
    tableBody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" class="text-center">No certifications found</td>';
      tableBody.appendChild(row);
      return;
    }

    data.forEach(certification => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${certification.User ? certification.User.name : 'Unknown'}</td>
        <td><span class="badge bg-${getStatusBadgeClass(certification.status)}">${certification.status || 'Not set'}</span></td>
        <td>
          <div class="progress">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${certification.progress}%" aria-valuenow="${certification.progress}" aria-valuemin="0" aria-valuemax="100">${certification.progress}%</div>
          </div>
        </td>
        <td>${certification.requestedAt ? new Date(certification.requestedAt).toLocaleString() : 'Not requested'}</td>
        <td>
          <button class="btn btn-sm btn-primary update-certification-btn" data-id="${certification.userId}" data-status="${certification.status || ''}">
            <i class="bi bi-pencil"></i> Update
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to update buttons
    document.querySelectorAll('.update-certification-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        openCertificationUpdateModal(userId, status);
      });
    });
  } catch (error) {
    console.error('Error loading certifications:', error);
    alert('Failed to load certifications. Please try again.');
  }
}

// Open certification update modal
function openCertificationUpdateModal(userId, status) {
  document.getElementById('certification-user-id').value = userId;
  document.getElementById('certification-status').value = status;
  certificationUpdateModal.show();
}

// Update certification
async function updateCertification() {
  try {
    const userId = document.getElementById('certification-user-id').value;
    const status = document.getElementById('certification-status').value;

    if (!status) {
      alert('Please select a status');
      return;
    }

    const response = await fetch(`/admin/api/certifications/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update certification');
    }

    // Hide the modal
    certificationUpdateModal.hide();

    // Reload certifications
    loadCertifications();

    // Show success message
    alert('Certification updated successfully');
  } catch (error) {
    console.error('Error updating certification:', error);
    alert('Failed to update certification. Please try again.');
  }
}

// Load training videos
async function loadTrainingVideos() {
  try {
    const response = await fetch('/admin/api/training-videos');
    const data = await response.json();

    // Update the table
    const tableBody = document.getElementById('videos-table');
    tableBody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" class="text-center">No training videos found</td>';
      tableBody.appendChild(row);
      return;
    }

    data.forEach(video => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${video.title}</td>
        <td>${video.description || 'No description'}</td>
        <td><a href="${video.videoUrl}" target="_blank">${video.videoUrl.substring(0, 30)}...</a></td>
        <td>${video.order}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-video-btn" data-id="${video.id}">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger delete-video-btn" data-id="${video.id}">
            <i class="bi bi-trash"></i> Delete
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-video-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const videoId = btn.getAttribute('data-id');
        editVideo(videoId, data);
      });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-video-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const videoId = btn.getAttribute('data-id');
        deleteVideo(videoId);
      });
    });
  } catch (error) {
    console.error('Error loading training videos:', error);
    alert('Failed to load training videos. Please try again.');
  }
}

// Open video modal for adding a new video
function openVideoModal() {
  document.getElementById('video-modal-title').textContent = 'Add Training Video';
  document.getElementById('video-id').value = '';
  document.getElementById('video-form').reset();
  videoModal.show();
}

// Edit video
function editVideo(videoId, videos) {
  const video = videos.find(v => v.id == videoId);
  
  if (!video) {
    alert('Video not found');
    return;
  }

  document.getElementById('video-modal-title').textContent = 'Edit Training Video';
  document.getElementById('video-id').value = video.id;
  document.getElementById('video-title').value = video.title;
  document.getElementById('video-description').value = video.description || '';
  document.getElementById('video-url').value = video.videoUrl;
  document.getElementById('video-thumbnail').value = video.thumbnailUrl || '';
  document.getElementById('video-order').value = video.order;

  videoModal.show();
}

// Save video (create or update)
async function saveVideo() {
  try {
    const videoId = document.getElementById('video-id').value;
    const title = document.getElementById('video-title').value;
    const description = document.getElementById('video-description').value;
    const url = document.getElementById('video-url').value;
    const thumbnail = document.getElementById('video-thumbnail').value;
    const order = document.getElementById('video-order').value;

    if (!title || !url) {
      alert('Title and URL are required');
      return;
    }

    const videoData = {
      title,
      description,
      videoUrl: url,
      thumbnailUrl: thumbnail,
      order: parseInt(order, 10)
    };

    let response;

    if (videoId) {
      // Update existing video
      response = await fetch(`/admin/api/training-videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });
    } else {
      // Create new video
      response = await fetch('/admin/api/training-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });
    }

    if (!response.ok) {
      throw new Error('Failed to save video');
    }

    // Hide the modal
    videoModal.hide();

    // Reload training videos
    loadTrainingVideos();

    // Show success message
    alert(`Video ${videoId ? 'updated' : 'created'} successfully`);
  } catch (error) {
    console.error('Error saving video:', error);
    alert('Failed to save video. Please try again.');
  }
}

// Delete video
async function deleteVideo(videoId) {
  if (!confirm('Are you sure you want to delete this video?')) {
    return;
  }

  try {
    const response = await fetch(`/admin/api/training-videos/${videoId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete video');
    }

    // Reload training videos
    loadTrainingVideos();

    // Show success message
    alert('Video deleted successfully');
  } catch (error) {
    console.error('Error deleting video:', error);
    alert('Failed to delete video. Please try again.');
  }
}

// Helper function to get badge class based on status
function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'completed':
      return 'success';
    case 'accepted':
      return 'info';
    case 'cancelled':
      return 'secondary';
    default:
      return 'secondary';
  }
}
