const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Middleware to parse URL-encoded data from forms
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON data
app.use(bodyParser.json());

// Path to the JSON file where user data will be stored
const dataFilePath = path.join(__dirname, 'data.json'); // Local path for VScode

console.log('Data file path:', dataFilePath);

// Helper function to ensure the directory exists
const ensureDirectoryExists = async (filePath) => {
    const dir = path.dirname(filePath);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
};

// Helper function to read data from the JSON file
const readData = async () => {
    console.log('Attempting to read data from:', dataFilePath);
    try {
        await ensureDirectoryExists(dataFilePath);
        const data = await fs.readFile(dataFilePath, 'utf-8');
        console.log('Successfully read data');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('data.json does not exist. Creating a new one...');
            await fs.writeFile(dataFilePath, '[]', 'utf-8');
            return [];
        }
        console.error('Error reading data:', error);
        throw error;
    }
};

// Helper function to write data to the JSON file
const writeData = async (data) => {
    console.log('Attempting to write data to:', dataFilePath);
    try {
        await ensureDirectoryExists(dataFilePath);
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Data successfully written to', dataFilePath);
    } catch (error) {
        console.error('Error writing data:', error);
        throw error;
    }
};

// Route to handle form submissions
app.post('/api/register', async (req, res) => {
    console.log('Received registration request:', req.body);
    try {
        const { firstName, lastName, email, role } = req.body;

        // Validate all required fields
        if (!firstName || !lastName || !email || !role) {
            console.error('Validation failed: Missing fields');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Read existing data
        const users = await readData();

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
        console.log('User data to be saved:', users);
        await writeData(users);

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
