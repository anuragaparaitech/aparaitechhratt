// Load saved data from localStorage
let attendanceRecords = JSON.parse(localStorage.getItem('gform_attendance')) || [];

// Set today's date as default when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('attendanceDate').valueAsDate = new Date();
    renderHistory();
});

// Function to set current time in input field
function setCurrentTime(inputId) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById(inputId).value = `${hours}:${minutes}`;
}

// Convert time string to minutes since midnight
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}

// Determine attendance status based on half-day rules
function determineStatus(checkInTime, checkOutTime) {
    const checkInMinutes = timeToMinutes(checkInTime);
    const checkOutMinutes = timeToMinutes(checkOutTime);
    
    // RULE 1: Check-in after 10:15 PM (22:15) = Half Day
    const halfDayCheckInThreshold = 22 * 60 + 15; // 22:15
    
    if (checkInMinutes > halfDayCheckInThreshold) {
        return 'half-day';
    }
    
    // RULE 2: Check-out before 7:00 PM (19:00) = Half Day
    const halfDayCheckOutThreshold = 19 * 60; // 19:00
    
    if (checkOutMinutes < halfDayCheckOutThreshold) {
        return 'half-day';
    }
    
    // Default: Present (Full Day)
    return 'present';
}

// Calculate working hours between check-in and check-out
function calculateWorkingHours(checkInTime, checkOutTime) {
    const checkInMinutes = timeToMinutes(checkInTime);
    const checkOutMinutes = timeToMinutes(checkOutTime);
    const diffMinutes = checkOutMinutes - checkInMinutes;
    
    if (diffMinutes < 0) return 'Invalid';
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
}

// Get the reason why half day was marked
function getHalfDayReason(checkInTime, checkOutTime) {
    const checkInMinutes = timeToMinutes(checkInTime);
    const checkOutMinutes = timeToMinutes(checkOutTime);
    const halfDayCheckInThreshold = 22 * 60 + 15;
    const halfDayCheckOutThreshold = 19 * 60;
    
    if (checkInMinutes > halfDayCheckInThreshold) {
        return `⏰ Late check-in at ${checkInTime} (after 10:15 PM)`;
    }
    if (checkOutMinutes < halfDayCheckOutThreshold) {
        return `⏰ Early check-out at ${checkOutTime} (before 7:00 PM)`;
    }
    return '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render attendance history table
function renderHistory() {
    const tbody = document.getElementById('historyBody');
    
    if (attendanceRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #5f6368;">No records yet</td></tr>';
        return;
    }
    
    // Show most recent records first (reverse order)
    const sorted = [...attendanceRecords].reverse();
    
    tbody.innerHTML = sorted.map((record, idx) => {
        const originalIdx = attendanceRecords.length - 1 - idx;
        const statusClass = record.status === 'present' ? 'status-full-day' : 'status-half-day';
        const statusText = record.status === 'present' ? '✅ Full Day' : '⚠️ Half Day';
        
        return `
            <tr>
                <td>${record.date}</td>
                <td>${escapeHtml(record.name)}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut}</td>
                <td>${record.workingHours}</td>
                <td><span class="status-badge ${statusClass}" style="padding: 4px 8px;">${statusText}</span></td>
                <td><span class="delete-icon" onclick="deleteRecord(${originalIdx})" title="Delete">🗑️</span></td>
            </tr>
        `;
    }).join('');
}

// Delete a single attendance record
function deleteRecord(index) {
    if (confirm('Delete this attendance record?')) {
        attendanceRecords.splice(index, 1);
        localStorage.setItem('gform_attendance', JSON.stringify(attendanceRecords));
        renderHistory();
        showMessage('Record deleted successfully!', '#d93025');
        
        // Hide result card if visible
        document.getElementById('resultCard').style.display = 'none';
    }
}

// Clear all attendance history
function clearAllHistory() {
    if (confirm('⚠️ This will delete ALL attendance records. This action cannot be undone. Are you sure?')) {
        attendanceRecords = [];
        localStorage.setItem('gform_attendance', JSON.stringify(attendanceRecords));
        renderHistory();
        document.getElementById('resultCard').style.display = 'none';
        showMessage('All records cleared!', '#d93025');
    }
}

// Reset the form to default values
function resetForm() {
    document.getElementById('attendanceForm').reset();
    document.getElementById('attendanceDate').valueAsDate = new Date();
    document.getElementById('checkInTime').value = '';
    document.getElementById('checkOutTime').value = '';
    document.getElementById('resultCard').style.display = 'none';
    showMessage('Form cleared', '#5f6368');
}

// Show toast notification message
function showMessage(message, color = '#137333') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast-message';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${color};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        font-family: 'Google Sans', sans-serif;
        font-size: 14px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast) toast.remove();
    }, 2000);
}

// Handle form submission
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('employeeName').value.trim();
    const date = document.getElementById('attendanceDate').value;
    const checkIn = document.getElementById('checkInTime').value;
    const checkOut = document.getElementById('checkOutTime').value;
    
    // Validation
    if (!name || !date || !checkIn || !checkOut) {
        alert('Please fill all required fields');
        return;
    }
    
    // Validate time order
    if (timeToMinutes(checkOut) <= timeToMinutes(checkIn)) {
        alert('Check-out time must be after check-in time!');
        return;
    }
    
    // Check for duplicate entry on same date for same employee
    const existingIndex = attendanceRecords.findIndex(r => r.name === name && r.date === date);
    
    if (existingIndex !== -1) {
        if (confirm(`A record already exists for ${name} on ${date}. Do you want to update it?`)) {
            attendanceRecords.splice(existingIndex, 1);
        } else {
            return;
        }
    }
    
    // Calculate status and details
    const status = determineStatus(checkIn, checkOut);
    const workingHours = calculateWorkingHours(checkIn, checkOut);
    const halfDayReason = status === 'half-day' ? getHalfDayReason(checkIn, checkOut) : '';
    
    // Create record object
    const record = {
        name: name,
        date: date,
        checkIn: checkIn,
        checkOut: checkOut,
        status: status,
        workingHours: workingHours,
        halfDayReason: halfDayReason,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    attendanceRecords.push(record);
    localStorage.setItem('gform_attendance', JSON.stringify(attendanceRecords));
    
    // Display result
    displayResult(record);
    
    // Update history table
    renderHistory();
    
    // Show success message
    showMessage('Attendance recorded successfully!', '#137333');
    
    // Reset time fields but keep name for next entry
    document.getElementById('checkInTime').value = '';
    document.getElementById('checkOutTime').value = '';
    document.getElementById('attendanceDate').valueAsDate = new Date();
});

// Display submission result
function displayResult(record) {
    const resultCard = document.getElementById('resultCard');
    const resultContent = document.getElementById('resultContent');
    
    const statusClass = record.status === 'present' ? 'status-full-day' : 'status-half-day';
    const statusText = record.status === 'present' ? '✅ FULL DAY PRESENT' : '⚠️ HALF DAY MARKED';
    
    let halfDayHtml = '';
    if (record.status === 'half-day' && record.halfDayReason) {
        halfDayHtml = `
            <div style="background: #fef7e0; padding: 12px; border-radius: 8px; margin-top: 16px;">
                <strong style="color: #e37400;">⚠️ Half Day Reason:</strong><br>
                <span style="color: #5f6368;">${record.halfDayReason}</span>
            </div>
        `;
    }
    
    resultCard.style.display = 'block';
    resultContent.innerHTML = `
        <div class="status-badge ${statusClass}" style="margin-bottom: 20px;">
            ${statusText}
        </div>
        <div class="result-detail">
            <span class="result-label">Employee:</span>
            <span class="result-value">${escapeHtml(record.name)}</span>
            
            <span class="result-label">Date:</span>
            <span class="result-value">${record.date}</span>
            
            <span class="result-label">Check-In:</span>
            <span class="result-value">${record.checkIn}</span>
            
            <span class="result-label">Check-Out:</span>
            <span class="result-value">${record.checkOut}</span>
            
            <span class="result-label">Working Hours:</span>
            <span class="result-value">${record.workingHours}</span>
        </div>
        ${halfDayHtml}
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #5f6368;">
            🕒 Recorded at: ${new Date(record.timestamp).toLocaleString()}
        </div>
    `;
    
    // Scroll to result card
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add keyboard shortcut for submit (Ctrl+Enter)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
    }
});