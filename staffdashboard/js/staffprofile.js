document.addEventListener("DOMContentLoaded", function() {
    console.log("Staff Profile Loaded");

    const profileForm = document.getElementById("profileForm");

    profileForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        if (name.trim() === "" || email.trim() === "") {
            alert("Name and Email cannot be empty.");
            return;
        }

        // Simulate Profile Update (Replace with Backend API/PHP logic later)
        let updatedProfile = {
            name: name,
            email: email,
            password: password ? "Updated" : "Not Changed"
        };

        console.log("Updated Profile:", updatedProfile);
        alert("Profile updated successfully!");
        
        // Reset password field after submission
        document.getElementById("password").value = "";
    });
});
