const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dataFilePath = process.env.RENDER_DISK_PATH 
  ? path.join(process.env.RENDER_DISK_PATH, 'data.json')
  : path.join(__dirname, 'data.json');

console.log('Data file path:', dataFilePath);

const ensureDirectoryExistence = async (filePath) => {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirname, { recursive: true });
    } else {
      throw error;
    }
  }
};

const readData = async () => {
  try {
    await ensureDirectoryExistence(dataFilePath);
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

const writeData = async (data) => {
  try {
    await ensureDirectoryExistence(dataFilePath);
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    
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
    
    await writeData(users);
    
    res.json({ success: true, message: 'Successfully registered!' });
  } catch (error) {
    console.error('Error processing registration:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
