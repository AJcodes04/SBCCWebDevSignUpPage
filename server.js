const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Middleware to parse URL-encoded data from forms
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON data
app.use(bodyParser.json());

// Path to the JSON file where user data will be stored on the persistent disk
const dataFilePath = path.join('/data', '/data.json'); // Assuming /data is your mount path

// Helper function to read data from the JSON file
const readData = () => {
    console.log('Attempting to read data from:', dataFilePath);
    try {
        if (fs.existsSync(dataFilePath)) {
            const stat = fs.statSync(dataFilePath);
            if (stat.isFile()) {
                const data = fs.readFileSync(dataFilePath, 'utf-8');
                console.log('Successfully read data:', data);
                return JSON.parse(data);
            } else {
                console.error('Error: Expected a file but found a directory:', dataFilePath);
                throw new Error(`${dataFilePath} is a directory, not a file.`);
            }
        } else {
            console.log('data.json does not exist. Creating a new one...');
            fs.writeFileSync(dataFilePath, '[]', 'utf-8'); // Initialize with an empty array if the file doesn't exist
            return [];
        }
    } catch (error) {
        console.error('Error reading data:', error);
        throw error; // Re-throw the error after logging it
    }
};

// Helper function to write data to the JSON file
const writeData = (data) => {
    console.log('Attempting to write data to:', dataFilePath);
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Data successfully written to', dataFilePath);
    } catch (error) {
        console.error('Error writing data:', error);
        throw error; // Re-throw the error after logging it
    }
};

// Route to handle form submissions
app.post('/api/register', (req, res) => {
    console.log('Received registration request:', req.body);
    try {
        const { firstName, lastName, email, role } = req.body;

        // Validate all required fields
        if (!firstName || !lastName || !email || !role) {
            console.error('Validation failed: Missing fields');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Read existing data
        const users = readData();

        // Check if the email is already registered
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            console.error('Validation failed: Email already registered');
            return res.status(400).json({ success: false, message: 'This email is already registered.' });
        }

        // Add new user to the list
        const newUser = { firstName, lastName, email, role };
        users.push(newUser);

        // Write updated data back to the file
        writeData(users);

        // Send a success response
        console.log('Registration successful for:', email);
        res.json({ success: true, message: 'Successfully registered!' });
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
