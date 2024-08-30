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
const dataDirectory = process.env.RENDER_DISK_PATH
  ? path.join(process.env.RENDER_DISK_PATH, 'data')
  : path.join(process.cwd(), 'data');

const dataFilePath = path.join(dataDirectory, 'data.json');

// Ensure the directory exists
const ensureDirectoryExists = async () => {
    try {
        await fs.access(dataDirectory);
    } catch {
        await fs.mkdir(dataDirectory, { recursive: true });
    }
};

// Helper function to read data from the JSON file
const readData = async () => {
    try {
        await ensureDirectoryExists();
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(dataFilePath, '[]', 'utf-8');
            return [];
        }
        throw error;
    }
};

// Helper function to write data to the JSON file
const writeData = async (data) => {
    await ensureDirectoryExists();
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Route to handle form submissions
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, role } = req.body;

        // Validate all required fields
        if (!firstName || !lastName || !email || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const users = await readData();

        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'This email is already registered.' });
        }

        const newUser = { firstName, lastName, email, role };
        users.push(newUser);

        // Log the full user list in a formatted way
        console.log('User data to be saved:', JSON.stringify(users, null, 2));

        // Write updated data back to the file
        await writeData(users);

        console.log('Registration successful for:', email);

        res.json({ success: true, message: 'Successfully registered!' });
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
