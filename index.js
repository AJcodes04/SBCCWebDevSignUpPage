document.addEventListener('DOMContentLoaded', () => {
    const memberBtn = document.getElementById('member-btn');
    const officerBtn = document.getElementById('officer-btn');
    const roleInput = document.getElementById('role');
    const emailInput = document.getElementById('email');
    const registerForm = document.getElementById('registerForm');
    const loadingSpinner = document.getElementById('loadingSpinner');

    const joinClubSwitch = document.getElementById('flexSwitchCheckDefault');
    const joinClubLabel = document.getElementById('flexSwitchCheckLabel');

    let isNavigatingAway = false;

    // Function to select the role
    function selectRole(role) {
        roleInput.value = role;

        // Highlight the selected button and reset the other
        if (role === 'Member') {
            memberBtn.classList.add('btn-primary');
            memberBtn.classList.remove('btn-pink');
            officerBtn.classList.remove('btn-primary');
            officerBtn.classList.add('btn-secondary');
        } else if (role === 'Officer') {
            officerBtn.classList.add('btn-primary');
            officerBtn.classList.remove('btn-secondary');
            memberBtn.classList.remove('btn-primary');
            memberBtn.classList.add('btn-pink');
        }
    }

    // Add event listeners to the buttons
    memberBtn.addEventListener('click', () => selectRole('Member'));
    officerBtn.addEventListener('click', () => selectRole('Officer'));

    // Change the email input text color to white
    emailInput.classList.add('text-white');

    // Toggle label text when the switch is toggled
    joinClubSwitch.addEventListener('change', () => {
        if (joinClubSwitch.checked) {
            joinClubLabel.textContent = 'I really want to join the club';
        } else {
            joinClubLabel.textContent = 'I want to join the club';
        }
    });

    // Handle form submission with loading animation
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Hide the form and show the loading spinner
        registerForm.style.display = 'none';
        loadingSpinner.style.display = 'block';

        // Allow the form to submit after showing the loading spinner
        setTimeout(() => {
            if (!isNavigatingAway) {
                registerForm.submit(); // Submit the form to the server
            }
        }, 2000); // Adjust the delay as needed
    });

    // Detect when the user is navigating away from the page
    window.addEventListener('beforeunload', () => {
        isNavigatingAway = true;
        loadingSpinner.style.display = 'none'; // Stop the loading animation
        registerForm.style.display = 'block'; // Optionally show the form again
    });
});
