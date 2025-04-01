// Staff Management System
class StaffManagement {
    constructor() {
        this.staff = JSON.parse(localStorage.getItem('staff')) || [];
        this.assignedStaff = JSON.parse(localStorage.getItem('assignedStaff')) || [];
        this.attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        this.performance = JSON.parse(localStorage.getItem('performance')) || {};
        
        this.initializeEventListeners();
        this.updateTables();
    }

    initializeEventListeners() {
        // Add Staff Form
        document.getElementById('addStaffForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStaff();
        });

        // Search functionality
        const searchInput = document.getElementById('staffSearch');
        const roleFilter = document.getElementById('roleFilter');
        
        if (searchInput) {
            // Search on input change
            searchInput.addEventListener('input', () => this.handleSearch());
            
            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch();
                }
            });
        }
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.handleSearch());
        }
    }

    handleSearch() {
        const searchTerm = document.getElementById('staffSearch').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;
        
        let filteredStaff = this.staff.filter(staff => {
            const nameMatch = staff.name.toLowerCase().startsWith(searchTerm);
            const roleMatch = roleFilter === 'all' || staff.role === roleFilter;
            return nameMatch && roleMatch;
        });

        this.updateSearchResults(filteredStaff);
        
        // Show feedback message
        this.showSearchFeedback(filteredStaff.length, searchTerm, roleFilter);
    }

    showSearchFeedback(count, searchTerm, roleFilter) {
        const searchResultsBody = document.querySelector('#searchResults tbody');
        if (!searchResultsBody) return;

        // Clear previous feedback if any
        const existingFeedback = document.querySelector('.search-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Create feedback message
        const feedback = document.createElement('div');
        feedback.className = 'search-feedback';
        
        if (count === 0) {
            feedback.innerHTML = `No staff members found with name starting with "${searchTerm}"${roleFilter !== 'all' ? ` in role "${roleFilter}"` : ''}`;
        } else {
            feedback.innerHTML = `Found ${count} staff member${count > 1 ? 's' : ''} with name starting with "${searchTerm}"${roleFilter !== 'all' ? ` in role "${roleFilter}"` : ''}`;
        }
        
        // Insert feedback before the table
        searchResultsBody.parentNode.insertBefore(feedback, searchResultsBody);
    }

    updateSearchResults(filteredStaff) {
        const searchResultsBody = document.querySelector('#searchResults tbody');
        if (!searchResultsBody) return;

        searchResultsBody.innerHTML = '';
        
        if (filteredStaff.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center;">No staff members found</td>';
            searchResultsBody.appendChild(row);
            return;
        }

        filteredStaff.forEach(staff => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staff.name}</td>
                <td>${staff.role}</td>
                <td>${staff.shift}</td>
                <td>${staff.attendance}%</td>
            `;
            searchResultsBody.appendChild(row);
        });
    }

    addStaff() {
        const staffName = document.getElementById('staffName').value;
        const staffRole = document.getElementById('staffRole').value;
        const staffShift = document.getElementById('staffShift').value;

        const newStaff = {
            id: Date.now(),
            name: staffName,
            role: staffRole,
            shift: staffShift,
            isAssigned: false,
            attendance: 100,
            performance: 5
        };

        this.staff.push(newStaff);
        this.saveToLocalStorage();
        this.updateTables();
        document.getElementById('addStaffForm').reset();
    }

    assignStaffToFlight(staffId, flightId) {
        const staffMember = this.staff.find(s => s.id === staffId);
        if (staffMember) {
            staffMember.isAssigned = true;
            this.assignedStaff.push({
                staffId,
                flightId,
                assignmentDate: new Date().toISOString()
            });
            this.saveToLocalStorage();
            this.updateTables();
        }
    }

    updateAttendance(staffId, isPresent) {
        const staffMember = this.staff.find(s => s.id === staffId);
        if (staffMember) {
            if (!this.attendance[staffId]) {
                this.attendance[staffId] = { present: 0, total: 0 };
            }
            this.attendance[staffId].total++;
            if (isPresent) {
                this.attendance[staffId].present++;
            }
            staffMember.attendance = Math.round((this.attendance[staffId].present / this.attendance[staffId].total) * 100);
            this.saveToLocalStorage();
            this.updateTables();
        }
    }

    updatePerformance(staffId, rating) {
        const staffMember = this.staff.find(s => s.id === staffId);
        if (staffMember) {
            if (!this.performance[staffId]) {
                this.performance[staffId] = { ratings: [] };
            }
            this.performance[staffId].ratings.push(rating);
            staffMember.performance = Math.round(
                this.performance[staffId].ratings.reduce((a, b) => a + b, 0) / 
                this.performance[staffId].ratings.length
            );
            this.saveToLocalStorage();
            this.updateTables();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('staff', JSON.stringify(this.staff));
        localStorage.setItem('assignedStaff', JSON.stringify(this.assignedStaff));
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
        localStorage.setItem('performance', JSON.stringify(this.performance));
    }

    updateTables() {
        // Update Staff List Table (Limited to 2 staff members)
        const staffTableBody = document.querySelector('#staffTable tbody');
        staffTableBody.innerHTML = '';
        this.staff.slice(0, 2).forEach(staff => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staff.name}</td>
                <td>${staff.role}</td>
                <td>${staff.shift}</td>
                <td>
                    <button onclick="staffManagement.updateAttendance(${staff.id}, true)">Mark Present</button>
                    <button onclick="staffManagement.updateAttendance(${staff.id}, false)">Mark Absent</button>
                    <button onclick="staffManagement.updatePerformance(${staff.id}, prompt('Enter rating (1-5):'))">Rate Performance</button>
                </td>
            `;
            staffTableBody.appendChild(row);
        });

        // Update Available Staff Table
        const availableStaffTableBody = document.querySelector('#availableStaffTable tbody');
        availableStaffTableBody.innerHTML = '';
        this.staff.filter(staff => !staff.isAssigned).forEach(staff => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${staff.name}</td>
                    <td>${staff.role}</td>
                    <td>${staff.shift}</td>
                `;
            availableStaffTableBody.appendChild(row);
        });

        // Update Attendance Table
        const attendanceTableBody = document.querySelector('#attendanceTable tbody');
        attendanceTableBody.innerHTML = '';
        this.staff.forEach(staff => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staff.name}</td>
                <td>${staff.attendance}%</td>
                <td>${staff.performance}/5</td>
            `;
            attendanceTableBody.appendChild(row);
        });
    }
}

// Initialize Staff Management System
const staffManagement = new StaffManagement();
