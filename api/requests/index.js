// api/requests/index.js
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = '/tmp/requests.json'; // Use /tmp for writable storage on Vercel

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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await initializeDB();

  // GET all requests
  if (req.method === 'GET') {
    try {
      const requests = await readRequests();
      // Sort by date (newest first)
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(requests);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Error fetching requests' });
    }
  }

  // POST new request
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
      
      // Check for duplicate email in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentDuplicate = requests.find(request => 
        request.email === email && 
        new Date(request.createdAt) > twentyFourHoursAgo
      );
      
      if (recentDuplicate) {
        return res.status(400).json({ 
          message: 'You have already submitted a request recently. Please wait 24 hours.' 
        });
      }
      
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
      
      // Log for debugging (check Vercel logs)
      console.log('New request submitted:', { email, name });
      
      return res.status(201).json({
        message: 'Request submitted successfully',
        request: newRequest
      });
      
    } catch (error) {
      console.error('Error submitting request:', error);
      return res.status(500).json({ message: 'Error submitting request' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}