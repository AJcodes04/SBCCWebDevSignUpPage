const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(process.cwd(), 'data.json');


const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Middleware to parse URL-encoded data from forms
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON data
app.use(bodyParser.json());

// Path to the JSON file where user data will be stored
const dataFilePath = path.join(__dirname, 'data.json');

// Helper function to read data from the JSON file
const readData = () => {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

// Helper function to write data to the JSON file
const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Route to handle form submissions
app.post('/register', (req, res) => {
    const { firstName, lastName, email, role } = req.body;

    // Validate all required fields
    if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ success: false, message: 'Please select either Member or Officer.' });
    }

    // Read existing data
    const users = readData();

    // Check if the email is already registered
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }

    // Add new user to the list
    const newUser = { firstName, lastName, email, role };
    users.push(newUser);

    // Write updated data back to the file
    writeData(users);

    // Send a success response
    res.json({ success: true, message: 'Successfully registered!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
