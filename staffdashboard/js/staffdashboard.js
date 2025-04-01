document.addEventListener("DOMContentLoaded", function() {
    console.log("Staff Dashboard Loaded");

    // Simulated data (Replace with real API/Database data later)
    let totalFlights = 152;
    let passengersToday = 1245;
    let staffMembers = 87;
    let pendingApprovals = 14;

    // Updating the dashboard cards dynamically
    document.querySelector(".card:nth-child(1) p").textContent = totalFlights;
    document.querySelector(".card:nth-child(2) p").textContent = passengersToday;
    document.querySelector(".card:nth-child(3) p").textContent = staffMembers;
    document.querySelector(".card:nth-child(4) p").textContent = pendingApprovals;

    // Simulate real-time updates every 10 seconds (for demo)
    setInterval(() => {
        totalFlights += Math.floor(Math.random() * 5);
        passengersToday += Math.floor(Math.random() * 50);
        pendingApprovals = Math.max(0, pendingApprovals - Math.floor(Math.random() * 2));

        document.querySelector(".card:nth-child(1) p").textContent = totalFlights;
        document.querySelector(".card:nth-child(2) p").textContent = passengersToday;
        document.querySelector(".card:nth-child(4) p").textContent = pendingApprovals;
    }, 10000);
});
