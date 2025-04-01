// Flight Management System
class FlightManagement {
    constructor() {
        this.flights = JSON.parse(localStorage.getItem('flights')) || [];
        this.staff = JSON.parse(localStorage.getItem('staff')) || [];
        this.assignedStaff = JSON.parse(localStorage.getItem('assignedStaff')) || [];
        
        this.initializeEventListeners();
        this.updateTables();
        this.updatePilotSelection();
    }

    initializeEventListeners() {
        // Add flight form submission
        document.getElementById('addFlightForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFlight();
        });

        // Add event listeners for time calculations
        const inputs = [
            'departureDate', 'departureHour', 'departureMinute',
            'durationHour', 'durationMinute',
            'returnDate', 'returnHour', 'returnMinute'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.calculateArrivalTime();
                    this.calculateReturnArrivalTime();
                    this.updatePilotSelection();
                    this.validateReturnFlight();
                });
                element.addEventListener('change', () => {
                    this.calculateArrivalTime();
                    this.calculateReturnArrivalTime();
                    this.updatePilotSelection();
                    this.validateReturnFlight();
                });
            }
        });
    }

    calculateArrivalTime() {
        const departureDate = document.getElementById('departureDate').value;
        const departureHour = document.getElementById('departureHour').value.padStart(2, '0');
        const departureMinute = document.getElementById('departureMinute').value.padStart(2, '0');
        const durationHour = parseInt(document.getElementById('durationHour').value) || 0;
        const durationMinute = parseInt(document.getElementById('durationMinute').value) || 0;

        if (!departureDate || !departureHour || !departureMinute) {
            document.getElementById('estimatedArrivalTime').textContent = 'Please enter departure date and time';
            return;
        }

        const departureTime = new Date(`${departureDate}T${departureHour}:${departureMinute}`);
        const totalDuration = (durationHour * 60 + durationMinute) * 60 * 1000; // Convert to milliseconds
        const arrivalTime = new Date(departureTime.getTime() + totalDuration);

        document.getElementById('estimatedArrivalTime').textContent = 
            arrivalTime.toLocaleString();
    }

    calculateReturnArrivalTime() {
        const returnDate = document.getElementById('returnDate').value;
        const returnHour = document.getElementById('returnHour').value.padStart(2, '0');
        const returnMinute = document.getElementById('returnMinute').value.padStart(2, '0');
        const durationHour = parseInt(document.getElementById('durationHour').value) || 0;
        const durationMinute = parseInt(document.getElementById('durationMinute').value) || 0;

        if (!returnDate || !returnHour || !returnMinute) {
            document.getElementById('estimatedReturnArrivalTime').textContent = 'Please enter return date and time';
            return;
        }

        const returnTime = new Date(`${returnDate}T${returnHour}:${returnMinute}`);
        const totalDuration = (durationHour * 60 + durationMinute) * 60 * 1000; // Convert to milliseconds
        const returnArrivalTime = new Date(returnTime.getTime() + totalDuration);

        document.getElementById('estimatedReturnArrivalTime').textContent = 
            returnArrivalTime.toLocaleString();
    }

    validateReturnFlight() {
        const departureDate = document.getElementById('departureDate').value;
        const departureHour = document.getElementById('departureHour').value.padStart(2, '0');
        const departureMinute = document.getElementById('departureMinute').value.padStart(2, '0');
        const durationHour = parseInt(document.getElementById('durationHour').value) || 0;
        const durationMinute = parseInt(document.getElementById('durationMinute').value) || 0;
        const returnDate = document.getElementById('returnDate').value;
        const returnHour = document.getElementById('returnHour').value.padStart(2, '0');
        const returnMinute = document.getElementById('returnMinute').value.padStart(2, '0');

        // If no departure time is set, disable return flight inputs
        if (!departureDate || !departureHour || !departureMinute) {
            document.getElementById('returnDate').disabled = true;
            document.getElementById('returnHour').disabled = true;
            document.getElementById('returnMinute').disabled = true;
            document.getElementById('returnDate').value = '';
            document.getElementById('returnHour').value = '';
            document.getElementById('returnMinute').value = '';
            document.getElementById('estimatedReturnArrivalTime').textContent = 'Please schedule outbound flight first';
            return;
        }

        // Enable return flight inputs
        document.getElementById('returnDate').disabled = false;
        document.getElementById('returnHour').disabled = false;
        document.getElementById('returnMinute').disabled = false;

        // Calculate outbound arrival time
        const departureTime = new Date(`${departureDate}T${departureHour}:${departureMinute}`);
        const totalDuration = (durationHour * 60 + durationMinute) * 60 * 1000;
        const arrivalTime = new Date(departureTime.getTime() + totalDuration);

        // If return time is set, validate it
        if (returnDate && returnHour && returnMinute) {
            const returnTime = new Date(`${returnDate}T${returnHour}:${returnMinute}`);
            
            if (returnTime <= arrivalTime) {
                document.getElementById('estimatedReturnArrivalTime').textContent = 
                    'Return flight must be after outbound flight arrival';
                return;
            }
        }
    }

    isPilotAvailable(pilotId, departureTime, arrivalTime) {
        // If no times provided, consider pilot available
        if (!departureTime || !arrivalTime) return true;

        // Get all flights assigned to this pilot
        const pilotFlights = this.flights.filter(flight => flight.pilotId === pilotId);
        
        // Convert input times to Date objects
        const newDeparture = new Date(departureTime);
        const newArrival = new Date(arrivalTime);

        // Check for any overlapping flights
        for (const flight of pilotFlights) {
            const existingDeparture = new Date(flight.departureTime);
            const existingArrival = new Date(flight.arrivalTime);

            // Check if the new flight overlaps with any existing flight
            if (
                (newDeparture >= existingDeparture && newDeparture < existingArrival) ||
                (newArrival > existingDeparture && newArrival <= existingArrival) ||
                (newDeparture <= existingDeparture && newArrival >= existingArrival)
            ) {
                return false;
            }
        }

        return true;
    }

    addFlight() {
        const departureCity = document.getElementById('departureCity').value;
        const destinationCity = document.getElementById('destinationCity').value;
        const departureDate = document.getElementById('departureDate').value;
        const departureHour = document.getElementById('departureHour').value.padStart(2, '0');
        const departureMinute = document.getElementById('departureMinute').value.padStart(2, '0');
        const durationHour = parseInt(document.getElementById('durationHour').value) || 0;
        const durationMinute = parseInt(document.getElementById('durationMinute').value) || 0;
        const returnDate = document.getElementById('returnDate').value;
        const returnHour = document.getElementById('returnHour').value.padStart(2, '0');
        const returnMinute = document.getElementById('returnMinute').value.padStart(2, '0');
        const pilotId = parseInt(document.getElementById('pilotSelect').value);

        // Create datetime strings
        const departureTime = `${departureDate}T${departureHour}:${departureMinute}`;
        const totalDuration = (durationHour * 60 + durationMinute) * 60 * 1000;
        const arrivalTime = new Date(new Date(departureTime).getTime() + totalDuration).toISOString();
        const returnTime = `${returnDate}T${returnHour}:${returnMinute}`;
        const returnArrivalTime = new Date(new Date(returnTime).getTime() + totalDuration).toISOString();

        // Validate times
        if (new Date(arrivalTime) <= new Date(departureTime)) {
            alert('Arrival time must be after departure time');
            return;
        }

        if (new Date(returnTime) <= new Date(arrivalTime)) {
            alert('Return flight must be after the outbound flight arrival');
            return;
        }

        // Check pilot availability for both flights
        if (!this.isPilotAvailable(pilotId, departureTime, arrivalTime) || 
            !this.isPilotAvailable(pilotId, returnTime, returnArrivalTime)) {
            const pilot = this.staff.find(s => s.id === pilotId);
            alert(`Pilot ${pilot.name} is already assigned to another flight during this time period. Please select a different pilot or time.`);
            return;
        }

        // Create outbound flight
        const outboundFlight = {
            id: this.flights.length + 1,
            departureCity,
            destinationCity,
            departureTime,
            arrivalTime,
            pilotId,
            status: 'Scheduled',
            type: 'outbound'
        };

        // Create return flight
        const returnFlight = {
            id: this.flights.length + 2,
            departureCity: destinationCity,
            destinationCity: departureCity,
            departureTime: returnTime,
            arrivalTime: returnArrivalTime,
            pilotId,
            status: 'Scheduled',
            type: 'return'
        };

        this.flights.push(outboundFlight, returnFlight);
        localStorage.setItem('flights', JSON.stringify(this.flights));
        
        // Reset form
        document.getElementById('addFlightForm').reset();
        this.updateTables();
        this.updatePilotSelection();
    }

    updatePilotSelection() {
        const pilotSelect = document.getElementById('pilotSelect');
        pilotSelect.innerHTML = '<option value="">Select a pilot</option>';

        // Get current form values for time validation
        const departureDate = document.getElementById('departureDate').value;
        const departureHour = document.getElementById('departureHour').value.padStart(2, '0');
        const departureMinute = document.getElementById('departureMinute').value.padStart(2, '0');
        const durationHour = parseInt(document.getElementById('durationHour').value) || 0;
        const durationMinute = parseInt(document.getElementById('durationMinute').value) || 0;
        const returnDate = document.getElementById('returnDate').value;
        const returnHour = document.getElementById('returnHour').value.padStart(2, '0');
        const returnMinute = document.getElementById('returnMinute').value.padStart(2, '0');

        // Create datetime strings for validation
        const departureTime = departureDate ? `${departureDate}T${departureHour}:${departureMinute}` : null;
        const totalDuration = (durationHour * 60 + durationMinute) * 60 * 1000;
        const arrivalTime = departureTime ? new Date(new Date(departureTime).getTime() + totalDuration).toISOString() : null;
        const returnTime = returnDate ? `${returnDate}T${returnHour}:${returnMinute}` : null;
        const returnArrivalTime = returnTime ? new Date(new Date(returnTime).getTime() + totalDuration).toISOString() : null;

        // Get all pilots
        const pilots = this.staff.filter(staff => staff.role === 'Pilot');

        // If no times are set, show all pilots
        if (!departureTime && !returnTime) {
            pilots.forEach(pilot => {
                const option = document.createElement('option');
                option.value = pilot.id;
                option.textContent = `${pilot.name} (${pilot.shift})`;
                pilotSelect.appendChild(option);
            });
            return;
        }

        // Filter available pilots
        const availablePilots = pilots.filter(pilot => 
            this.isPilotAvailable(pilot.id, departureTime, arrivalTime) &&
            this.isPilotAvailable(pilot.id, returnTime, returnArrivalTime)
        );

        availablePilots.forEach(pilot => {
            const option = document.createElement('option');
            option.value = pilot.id;
            option.textContent = `${pilot.name} (${pilot.shift})`;
            pilotSelect.appendChild(option);
        });
    }

    updateTables() {
        // Update Available Pilots Table
        const availablePilotsTable = document.getElementById('availablePilotsTable').getElementsByTagName('tbody')[0];
        availablePilotsTable.innerHTML = '';

        // Get all pilots
        const pilots = this.staff.filter(staff => staff.role === 'Pilot');

        // Get current form values for time validation
        const departureDate = document.getElementById('departureDate').value;
        const departureHour = document.getElementById('departureHour').value.padStart(2, '0');
        const departureMinute = document.getElementById('departureMinute').value.padStart(2, '0');
        const durationHour = parseInt(document.getElementById('durationHour').value) || 0;
        const durationMinute = parseInt(document.getElementById('durationMinute').value) || 0;
        const returnDate = document.getElementById('returnDate').value;
        const returnHour = document.getElementById('returnHour').value.padStart(2, '0');
        const returnMinute = document.getElementById('returnMinute').value.padStart(2, '0');

        // Create datetime strings for validation
        const departureTime = departureDate ? `${departureDate}T${departureHour}:${departureMinute}` : null;
        const totalDuration = (durationHour * 60 + durationMinute) * 60 * 1000;
        const arrivalTime = departureTime ? new Date(new Date(departureTime).getTime() + totalDuration).toISOString() : null;
        const returnTime = returnDate ? `${returnDate}T${returnHour}:${returnMinute}` : null;
        const returnArrivalTime = returnTime ? new Date(new Date(returnTime).getTime() + totalDuration).toISOString() : null;

        // Show all pilots if no times are set
        if (!departureTime && !returnTime) {
            pilots.forEach(pilot => {
                const row = availablePilotsTable.insertRow();
                row.innerHTML = `
                    <td>${pilot.name}</td>
                    <td>${pilot.shift}</td>
                    <td>Available</td>
                    <td>Now</td>
                `;
            });
        } else {
            // Filter available pilots based on time constraints
            const availablePilots = pilots.filter(pilot => 
                this.isPilotAvailable(pilot.id, departureTime, arrivalTime) &&
                this.isPilotAvailable(pilot.id, returnTime, returnArrivalTime)
            );

            availablePilots.forEach(pilot => {
                const row = availablePilotsTable.insertRow();
                row.innerHTML = `
                    <td>${pilot.name}</td>
                    <td>${pilot.shift}</td>
                    <td>Available</td>
                    <td>Now</td>
                `;
            });
        }

        // Update Scheduled Flights Table
        const scheduledFlightsTable = document.getElementById('scheduledFlightsTable').getElementsByTagName('tbody')[0];
        scheduledFlightsTable.innerHTML = '';

        // Sort flights by departure time
        const sortedFlights = [...this.flights].sort((a, b) => 
            new Date(a.departureTime) - new Date(b.departureTime)
        );

        sortedFlights.forEach(flight => {
            const pilot = this.staff.find(s => s.id === flight.pilotId);
            const row = scheduledFlightsTable.insertRow();
            row.innerHTML = `
                <td>${flight.id} (${flight.type})</td>
                <td>${flight.departureCity}</td>
                <td>${flight.destinationCity}</td>
                <td>${new Date(flight.departureTime).toLocaleString()}</td>
                <td>${new Date(flight.arrivalTime).toLocaleString()}</td>
                <td>${pilot ? pilot.name : 'Unassigned'}</td>
                <td>${flight.status}</td>
                <td>
                    <button onclick="flightManagement.cancelFlight(${flight.id})">Cancel</button>
                </td>
            `;
        });
    }

    cancelFlight(flightId) {
        const flight = this.flights.find(f => f.id === flightId);
        if (flight) {
            // Remove pilot from assigned staff
            this.assignedStaff = this.assignedStaff.filter(id => id !== flight.pilotId);
            // Remove flight
            this.flights = this.flights.filter(f => f.id !== flightId);
            
            localStorage.setItem('flights', JSON.stringify(this.flights));
            localStorage.setItem('assignedStaff', JSON.stringify(this.assignedStaff));
            
            this.updateTables();
            this.updatePilotSelection();
        }
    }
}

// Initialize flight management
const flightManagement = new FlightManagement(); 