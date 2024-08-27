const fs = require('fs').promises;
const path = require('path');

// Path to the JSON file where user data will be stored on the persistent disk
const dataFilePath = process.env.RENDER_DISK_PATH 
  ? path.join(process.env.RENDER_DISK_PATH, 'data.json')
  : path.join(process.cwd(), 'data', 'data.json');

// Helper function to ensure the directory exists
const ensureDirectoryExists = async () => {
  const dir = path.dirname(dataFilePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Helper function to read data from the JSON file
const readData = async () => {
  try {
    await fs.access(dataFilePath);
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('data.json does not exist. Creating a new one...');
      await fs.writeFile(dataFilePath, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
};

// Helper function to write data to the JSON file
const writeData = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Data successfully written to', dataFilePath);
};

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      await ensureDirectoryExists();
      
      const { firstName, lastName, email, role } = req.body;
      
      // Validate all required fields
      if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }
      
      // Read existing data
      const users = await readData();
      
      // Check if the email is already registered
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This email is already registered.' });
      }
      
      // Add new user to the list
      const newUser = { firstName, lastName, email, role };
      users.push(newUser);
      
      // Write updated data back to the file
      await writeData(users);
      
      // Send a success response
      res.json({ success: true, message: 'Successfully registered!' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
