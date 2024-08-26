const fs = require('fs');
const path = require('path');

// Path to the JSON file where user data will be stored
const dataFilePath = path.join(process.cwd(), 'data.json');

// Helper function to read data from the JSON file
const readData = () => {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } else {
        console.log('data.json does not exist. Creating a new one...');
        fs.writeFileSync(dataFilePath, '[]', 'utf-8'); // Initialize with an empty array if file doesn't exist
        return [];
    }
};

// Helper function to write data to the JSON file
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Data successfully written to', dataFilePath);
    } catch (error) {
        console.error('Error writing data:', error);
    }
};

export default (req, res) => {
    if (req.method === 'POST') {
        const { firstName, lastName, email, role } = req.body;

        // Validate all required fields
        if (!firstName || !lastName || !email || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
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
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
};
