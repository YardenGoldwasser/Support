// Global state
let currentPage = 1;
let currentFilters = {};
let currentIssue = null;

// DOM Elements
const issuesTableBody = document.getElementById('issuesTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const noIssues = document.getElementById('noIssues');
const exportBtn = document.getElementById('exportBtn');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const issueModal = document.getElementById('issueModal');
const updateIssueForm = document.getElementById('updateIssueForm');

// Statistics elements
const totalIssuesEl = document.getElementById('totalIssues');
const openIssuesEl = document.getElementById('openIssues');
const inProgressIssuesEl = document.getElementById('inProgressIssues');
const resolvedIssuesEl = document.getElementById('resolvedIssues');

// Pagination elements
const paginationInfo = document.getElementById('paginationInfo');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Load initial data
    loadStatistics();
    loadIssues();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadStatistics();
        loadIssues();
    }, 30000);
}

function setupEventListeners() {
    // Filter buttons
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Export button
    exportBtn.addEventListener('click', exportToExcel);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Update form
    updateIssueForm.addEventListener('submit', handleUpdateIssue);
    
    // Modal close
    document.addEventListener('click', function(event) {
        if (event.target === issueModal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

async function loadStatistics() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        if (response.ok) {
            updateStatistics(stats);
        } else {
            console.error('Failed to load statistics:', stats.error);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function updateStatistics(stats) {
    // Animate counter updates
    animateCounter(totalIssuesEl, stats.total_issues);
    animateCounter(openIssuesEl, stats.open_issues);
    animateCounter(inProgressIssuesEl, stats.in_progress_issues);
    animateCounter(resolvedIssuesEl, stats.resolved_issues);
}

function animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetValue - startValue) / 20);
    
    if (startValue === targetValue) return;
    
    let currentValue = startValue;
    const timer = setInterval(() => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= targetValue) || 
            (increment < 0 && currentValue <= targetValue)) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = currentValue;
    }, 50);
}

async function loadIssues(page = 1) {
    try {
        showLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            per_page: 10,
            ...currentFilters
        });
        
        const response = await fetch(`/api/issues?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayIssues(data.issues);
            updatePagination(data);
            currentPage = page;
        } else {
            console.error('Failed to load issues:', data.error);
            showError('Failed to load issues');
        }
    } catch (error) {
        console.error('Error loading issues:', error);
        showError('Error loading issues');
    } finally {
        showLoading(false);
    }
}

function displayIssues(issues) {
    if (issues.length === 0) {
        issuesTableBody.innerHTML = '';
        noIssues.style.display = 'block';
        return;
    }
    
    noIssues.style.display = 'none';
    
    issuesTableBody.innerHTML = issues.map(issue => `
        <tr onclick="viewIssue(${issue.id})" style="cursor: pointer;">
            <td>${issue.id}</td>
            <td>
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(issue.title)}">
                    ${escapeHtml(issue.title)}
                </div>
            </td>
            <td>
                <span class="type-badge type-${issue.issue_type}">
                    ${formatIssueType(issue.issue_type)}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${issue.priority}">
                    ${formatPriority(issue.priority)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${issue.status}">
                    ${formatStatus(issue.status)}
                </span>
            </td>
            <td>
                <div>
                    <strong>${escapeHtml(issue.customer_name)}</strong><br>
                    <small style="color: #718096;">${escapeHtml(issue.customer_email)}</small>
                </div>
            </td>
            <td>
                <div>
                    ${formatDate(issue.created_at)}<br>
                    <small style="color: #718096;">${formatTimeAgo(issue.created_at)}</small>
                </div>
            </td>
            <td>${escapeHtml(issue.assigned_to || 'Unassigned')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-primary btn-small" onclick="event.stopPropagation(); viewIssue(${issue.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination(data) {
    const { total, pages, current_page, per_page } = data;
    
    // Update pagination info
    const start = (current_page - 1) * per_page + 1;
    const end = Math.min(current_page * per_page, total);
    paginationInfo.textContent = `Showing ${start}-${end} of ${total} issues`;
    
    // Update navigation buttons
    prevPageBtn.disabled = current_page <= 1;
    nextPageBtn.disabled = current_page >= pages;
    
    // Update page numbers
    generatePageNumbers(current_page, pages);
}

function generatePageNumbers(currentPage, totalPages) {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    let html = '';
    
    // Previous page
    if (currentPage > 1) {
        html += `<a href="#" class="page-number" onclick="changePage(${currentPage - 1})">&laquo;</a>`;
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        html += `<a href="#" class="page-number ${active}" onclick="changePage(${i})">${i}</a>`;
    }
    
    // Next page
    if (currentPage < totalPages) {
        html += `<a href="#" class="page-number" onclick="changePage(${currentPage + 1})">&raquo;</a>`;
    }
    
    pageNumbers.innerHTML = html;
}

function changePage(page) {
    if (page < 1) return;
    loadIssues(page);
}

function applyFilters() {
    currentFilters = {
        status: document.getElementById('statusFilter').value,
        issue_type: document.getElementById('typeFilter').value,
        priority: document.getElementById('priorityFilter').value
    };
    
    // Remove empty filters
    Object.keys(currentFilters).forEach(key => {
        if (!currentFilters[key]) {
            delete currentFilters[key];
        }
    });
    
    currentPage = 1;
    loadIssues();
}

function clearFilters() {
    currentFilters = {};
    currentPage = 1;
    
    // Reset filter form
    document.getElementById('statusFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    
    loadIssues();
}

async function viewIssue(issueId) {
    try {
        const response = await fetch(`/api/issues/${issueId}`);
        const issue = await response.json();
        
        if (response.ok) {
            showIssueModal(issue);
        } else {
            showError('Failed to load issue details');
        }
    } catch (error) {
        console.error('Error loading issue:', error);
        showError('Error loading issue details');
    }
}

function showIssueModal(issue) {
    currentIssue = issue;
    
    // Populate issue details
    document.getElementById('modalTitle').textContent = `Issue #${issue.id}: ${issue.title}`;
    document.getElementById('detailId').textContent = issue.id;
    document.getElementById('detailType').innerHTML = `<span class="type-badge type-${issue.issue_type}">${formatIssueType(issue.issue_type)}</span>`;
    document.getElementById('detailPriority').innerHTML = `<span class="priority-badge priority-${issue.priority}">${formatPriority(issue.priority)}</span>`;
    document.getElementById('detailStatus').innerHTML = `<span class="status-badge status-${issue.status}">${formatStatus(issue.status)}</span>`;
    document.getElementById('detailCreated').textContent = formatDate(issue.created_at);
    document.getElementById('detailUpdated').textContent = formatDate(issue.updated_at);
    
    // Customer information
    document.getElementById('detailCustomerName').textContent = issue.customer_name;
    document.getElementById('detailCustomerEmail').textContent = issue.customer_email;
    document.getElementById('detailCustomerPhone').textContent = issue.customer_phone || 'Not provided';
    
    // Description
    document.getElementById('detailDescription').textContent = issue.description;
    
    // Populate update form
    document.getElementById('updateStatus').value = issue.status;
    document.getElementById('updatePriority').value = issue.priority;
    document.getElementById('updateAssignedTo').value = issue.assigned_to || '';
    document.getElementById('updateNotes').value = issue.internal_notes || '';
    
    // Show modal
    issueModal.style.display = 'block';
    
    // Add modal animation
    setTimeout(() => {
        issueModal.querySelector('.modal-content').style.transform = 'scale(1)';
        issueModal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

function closeModal() {
    issueModal.style.display = 'none';
    currentIssue = null;
}

async function handleUpdateIssue(event) {
    event.preventDefault();
    
    if (!currentIssue) return;
    
    const formData = new FormData(updateIssueForm);
    const updateData = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = updateIssueForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/issues/${currentIssue.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessNotification('Issue updated successfully');
            closeModal();
            loadIssues(currentPage);
            loadStatistics();
        } else {
            showError(result.error || 'Failed to update issue');
        }
    } catch (error) {
        console.error('Error updating issue:', error);
        showError('Error updating issue');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function exportToExcel() {
    // Show loading state
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
    exportBtn.disabled = true;
    
    try {
        const response = await fetch('/api/issues/export');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            // Get filename from response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition 
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : 'support_issues.xlsx';
            
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showSuccessNotification('Issues exported successfully');
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Export failed');
        }
    } catch (error) {
        console.error('Error exporting issues:', error);
        showError('Error exporting issues');
    } finally {
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingSpinner.style.display = 'block';
        issuesTableBody.style.opacity = '0.5';
    } else {
        loadingSpinner.style.display = 'none';
        issuesTableBody.style.opacity = '1';
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccessNotification(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Utility functions
function formatIssueType(type) {
    const types = {
        'bug': 'Bug Report',
        'feature_request': 'Feature Request',
        'support': 'General Support'
    };
    return types[type] || type;
}

function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatTimeAgo(dateString) {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDate(dateString);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global functions for HTML onclick handlers
window.viewIssue = viewIssue;
window.closeModal = closeModal;
window.changePage = changePage;

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 15px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    }
    
    .notification-success {
        border-left: 4px solid #48bb78;
    }
    
    .notification-error {
        border-left: 4px solid #f56565;
    }
    
    .notification i:first-child {
        font-size: 1.2rem;
    }
    
    .notification-success i:first-child {
        color: #48bb78;
    }
    
    .notification-error i:first-child {
        color: #f56565;
    }
    
    .notification button {
        background: none;
        border: none;
        cursor: pointer;
        color: #718096;
        margin-left: auto;
        padding: 5px;
    }
    
    .notification button:hover {
        color: #4a5568;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .modal-content {
        transform: scale(0.9);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
`;
document.head.appendChild(style);