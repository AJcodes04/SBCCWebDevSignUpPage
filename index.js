document.addEventListener('DOMContentLoaded', () => {
    const memberBtn = document.getElementById('member-btn');
    const officerBtn = document.getElementById('officer-btn');
    const roleInput = document.getElementById('role');
    const emailInput = document.getElementById('email');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
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
            memberBtn.classList.remove('btn-dark');
            officerBtn.classList.remove('btn-dark');
            officerBtn.classList.add('btn-dark');
        } else if (role === 'Officer') {
            officerBtn.classList.add('btn-primary');
            officerBtn.classList.remove('btn-dark');
            memberBtn.classList.remove('btn-primary');
            memberBtn.classList.add('btn-dark');
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

    // Function to validate form fields
    function validateForm() {
    const roleSelected = roleInput.value !== '';
    const firstNameFilled = firstNameInput.value.trim() !== '' && firstNameInput.value.length <= 50; // Max 50 characters
    const lastNameFilled = lastNameInput.value.trim() !== '' && lastNameInput.value.length <= 50;  // Max 50 characters
    const emailFilled = emailInput.value.trim() !== '' && /^[^\s@]+@pipeline\.sbcc\.edu$/.test(emailInput.value) && emailInput.value.length <= 100; // Check @pipeline.sbcc.edu email

    // Check each condition and show specific alerts
    if (!roleSelected) {
        alert('Please select either Member or Officer.');
        return false;
    }
    if (!firstNameFilled) {
        alert('Please enter a valid first name (max 50 characters).');
        return false;
    }
    if (!lastNameFilled) {
        alert('Please enter a valid last name (max 50 characters).');
        return false;
    }
    if (!emailFilled) {
        alert('Please enter a valid @pipeline.sbcc.edu email address.');
        return false;
    }

    return true;
}

    // Handle form submission with loading animation and user-friendly error handling
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Validate form fields
        if (!validateForm()) {
            alert('Please fill out all fields and select either Member or Officer.');
            return; // Do not proceed if validation fails
        }

        // Hide the form and show the loading spinner
        registerForm.style.display = 'none';
        loadingSpinner.style.display = 'block';

        // Prepare form data for sending
        const formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            role: roleInput.value
        };

        // Send form data to the server using fetch API
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to the thank-you page after successful registration
                window.location.href = 'thank-you.html';
            } else {
                // Show a user-friendly error message
                alert(data.message || 'Registration failed. Please try again.');
                loadingSpinner.style.display = 'none';
                registerForm.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again later.');
            loadingSpinner.style.display = 'none';
            registerForm.style.display = 'block';
        });
    });

    // Detect when the user is navigating away from the page
    window.addEventListener('beforeunload', () => {
        isNavigatingAway = true;
        loadingSpinner.style.display = 'none'; // Stop the loading animation
        registerForm.style.display = 'block'; // Optionally show the form again
    });
});
