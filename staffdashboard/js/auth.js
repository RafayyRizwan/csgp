document.addEventListener("DOMContentLoaded", function() {
    let userRole = localStorage.getItem("userRole");

    // If role is not set, default to "Staff"
    if (!userRole) {
        userRole = "Admin"; // Default role for testing
        localStorage.setItem("userRole", userRole);
    }

    console.log("User Role:", userRole);

    // Update Dashboard Greeting
    let headerTitle = document.querySelector(".main-content header h1");
    if (headerTitle) {
        headerTitle.textContent = `Welcome, ${userRole}`;
    }

    // Hide "Staff Management" menu for non-admins
    let staffManagementLink = document.querySelector("a[href='#']");
    if (staffManagementLink && userRole !== "Admin") {
        staffManagementLink.style.display = "none";
    }

    // Prevent Non-Admins from Accessing Admin Pages
    if (window.location.pathname.includes("staff.html") && userRole !== "Admin") {
        console.log("Redirecting non-admin from staff management page.");
        alert("Access Denied: You do not have permission to view this page.");
        window.location.href = "staffprofile.html"; // Redirect to Profile instead of blocking access
    }

    // Logout Functionality
    let logoutButton = document.querySelector(".logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("userRole"); // Clear session
            window.location.href = "login.html"; // Redirect to login page
        });
    }
});
