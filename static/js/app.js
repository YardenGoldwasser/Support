// DOM Elements
const issueForm = document.getElementById('issueForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const issueIdElement = document.getElementById('issueId');
const errorTextElement = document.getElementById('errorText');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    // Add form submission handler
    issueForm.addEventListener('submit', handleFormSubmission);
    
    // Add input validation
    addInputValidation();
    
    // Add character counters for text areas
    addCharacterCounters();
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    // Show loading state
    setLoadingState(true);
    
    // Get form data
    const formData = getFormData();
    
    // Validate form data
    if (!validateFormData(formData)) {
        setLoadingState(false);
        return;
    }
    
    // Submit form data
    submitIssue(formData);
}

function getFormData() {
    return {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        customer_name: document.getElementById('customer_name').value.trim(),
        customer_email: document.getElementById('customer_email').value.trim(),
        customer_phone: document.getElementById('customer_phone').value.trim(),
        issue_type: document.getElementById('issue_type').value,
        priority: document.getElementById('priority').value
    };
}

function validateFormData(data) {
    const errors = [];
    
    // Required field validation
    if (!data.title) errors.push('Issue title is required');
    if (!data.description) errors.push('Description is required');
    if (!data.customer_name) errors.push('Your name is required');
    if (!data.customer_email) errors.push('Email address is required');
    if (!data.issue_type) errors.push('Issue type is required');
    
    // Email validation
    if (data.customer_email && !isValidEmail(data.customer_email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Length validation
    if (data.title && data.title.length > 200) {
        errors.push('Issue title must be less than 200 characters');
    }
    
    if (data.description && data.description.length > 5000) {
        errors.push('Description must be less than 5000 characters');
    }
    
    if (data.customer_name && data.customer_name.length > 100) {
        errors.push('Name must be less than 100 characters');
    }
    
    // Phone validation (if provided)
    if (data.customer_phone && !isValidPhone(data.customer_phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    if (errors.length > 0) {
        showError(errors.join('\n'));
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Allow various phone formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanPhone);
}

async function submitIssue(formData) {
    try {
        const response = await fetch('/api/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(result.issue_id);
        } else {
            showError(result.error || 'An error occurred while submitting your issue');
        }
    } catch (error) {
        console.error('Error submitting issue:', error);
        showError('Unable to submit issue. Please check your internet connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

function showSuccess(issueId) {
    issueIdElement.textContent = issueId;
    successMessage.style.display = 'block';
    hideError();
    
    // Add success animation
    successMessage.style.opacity = '0';
    successMessage.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
}

function showError(message) {
    errorTextElement.textContent = message;
    errorMessage.style.display = 'block';
    
    // Add error animation
    errorMessage.style.opacity = '0';
    errorMessage.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
        errorMessage.style.opacity = '1';
        errorMessage.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
}

function hideError() {
    errorMessage.style.display = 'none';
}

function hideSuccess() {
    successMessage.style.display = 'none';
}

function resetForm() {
    issueForm.reset();
    hideSuccess();
    hideError();
    
    // Reset any custom validation states
    const inputs = issueForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
}

function setLoadingState(isLoading) {
    const submitButton = issueForm.querySelector('button[type="submit"]');
    const submitIcon = submitButton.querySelector('i');
    
    if (isLoading) {
        issueForm.classList.add('loading');
        submitButton.disabled = true;
        submitIcon.className = 'fas fa-spinner fa-spin';
        submitButton.style.pointerEvents = 'none';
    } else {
        issueForm.classList.remove('loading');
        submitButton.disabled = false;
        submitIcon.className = 'fas fa-paper-plane';
        submitButton.style.pointerEvents = 'auto';
    }
}

function addInputValidation() {
    const inputs = issueForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // Clear validation state on focus
        input.addEventListener('focus', function() {
            this.classList.remove('error', 'success');
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const isRequired = input.hasAttribute('required');
    
    // Remove previous validation states
    input.classList.remove('error', 'success');
    
    if (isRequired && !value) {
        input.classList.add('error');
        return false;
    }
    
    // Specific validation based on input type
    if (input.type === 'email' && value) {
        if (isValidEmail(value)) {
            input.classList.add('success');
        } else {
            input.classList.add('error');
            return false;
        }
    }
    
    if (input.type === 'tel' && value) {
        if (isValidPhone(value)) {
            input.classList.add('success');
        } else {
            input.classList.add('error');
            return false;
        }
    }
    
    if (value && isRequired) {
        input.classList.add('success');
    }
    
    return true;
}

function addCharacterCounters() {
    const textareas = issueForm.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength') || 5000;
        
        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.textAlign = 'right';
        counter.style.fontSize = '0.8rem';
        counter.style.color = '#718096';
        counter.style.marginTop = '5px';
        
        // Insert counter after textarea
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        
        // Update counter function
        function updateCounter() {
            const current = textarea.value.length;
            counter.textContent = `${current}/${maxLength}`;
            
            if (current > maxLength * 0.9) {
                counter.style.color = '#f56565';
            } else if (current > maxLength * 0.7) {
                counter.style.color = '#d69e2e';
            } else {
                counter.style.color = '#718096';
            }
        }
        
        // Initial count
        updateCounter();
        
        // Update on input
        textarea.addEventListener('input', updateCounter);
    });
}

// Utility functions
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global functions for HTML onclick handlers
window.resetForm = resetForm;
window.hideError = hideError;
window.hideSuccess = hideSuccess;

// Add CSS classes for validation states
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #f56565 !important;
        box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1) !important;
    }
    
    .form-group input.success,
    .form-group select.success,
    .form-group textarea.success {
        border-color: #48bb78 !important;
        box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1) !important;
    }
    
    .character-counter {
        transition: color 0.2s ease;
    }
    
    .success-message,
    .error-message {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
`;
document.head.appendChild(style);