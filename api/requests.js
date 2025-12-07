// api/requests.js
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'requests.json');

// Initialize database
const initializeDB = async () => {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
  }
};

const readRequests = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeRequests = async (requests) => {
  await fs.writeFile(DB_FILE, JSON.stringify(requests, null, 2));
};

module.exports = async (req, res) => {
  // Initialize CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await initializeDB();

  // Handle GET requests (get all requests)
  if (req.method === 'GET') {
    try {
      const requests = await readRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching requests' });
    }
    return;
  }

  // Handle POST requests (submit new request)
  if (req.method === 'POST') {
    try {
      const { name, email, company, message } = req.body;
      
      // Basic validation
      if (!name || !email || !company || !message) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      const requests = await readRequests();
      
      // Create new request
      const newRequest = {
        id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        company,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      requests.push(newRequest);
      await writeRequests(requests);
      
      res.status(201).json({
        message: 'Request submitted successfully',
        request: newRequest
      });
      
    } catch (error) {
      console.error('Error submitting request:', error);
      res.status(500).json({ message: 'Error submitting request' });
    }
    return;
  }

  // Handle other methods
  res.status(405).json({ message: 'Method not allowed' });
};