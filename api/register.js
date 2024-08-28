const fs = require('fs').promises;
const path = require('path');

const dataFilePath = process.env.RENDER_DISK_PATH 
  ? path.join(process.env.RENDER_DISK_PATH, 'data/data.json')
  : path.join(process.cwd(), 'data', 'data.json');

const ensureDirectoryExists = async () => {
  const dir = path.dirname(dataFilePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

const readData = async () => {
  try {
    await fs.access(dataFilePath);
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

const writeData = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      await ensureDirectoryExists();
      
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
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
