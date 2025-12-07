// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database file path
const DB_FILE = path.join(__dirname, 'requests.json');

// Initialize database file if it doesn't exist
const initializeDB = async () => {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty array
    await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
  }
};

// Helper function to read requests
const readRequests = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading requests:', error);
    return [];
  }
};

// Helper function to write requests
const writeRequests = async (requests) => {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(requests, null, 2));
  } catch (error) {
    console.error('Error writing requests:', error);
    throw error;
  }
};

// Routes

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await readRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get single request by ID
app.get('/api/requests/:id', async (req, res) => {
  try {
    const requests = await readRequests();
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request' });
  }
});

// Submit new request
app.post('/api/requests', async (req, res) => {
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
      status: 'pending', // pending, contacted, completed, rejected
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    await writeRequests(requests);
    
    // In production, you would send an email notification here
    console.log(`New request submitted by ${email}`);
    
    res.status(201).json({
      message: 'Request submitted successfully',
      request: newRequest
    });
    
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Error submitting request' });
  }
});

// Update request status
app.put('/api/requests/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['pending', 'contacted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const requests = await readRequests();
    const requestIndex = requests.findIndex(r => r.id === req.params.id);
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    requests[requestIndex] = {
      ...requests[requestIndex],
      status,
      notes: notes || requests[requestIndex].notes,
      updatedAt: new Date().toISOString()
    };
    
    await writeRequests(requests);
    
    res.json({
      message: 'Request updated successfully',
      request: requests[requestIndex]
    });
    
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Delete request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const requests = await readRequests();
    const filteredRequests = requests.filter(r => r.id !== req.params.id);
    
    if (filteredRequests.length === requests.length) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await writeRequests(filteredRequests);
    
    res.json({ message: 'Request deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Error deleting request' });
  }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const requests = await readRequests();
    
    const statistics = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      contacted: requests.filter(r => r.status === 'contacted').length,
      completed: requests.filter(r => r.status === 'completed').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      last24Hours: requests.filter(r => {
        const requestTime = new Date(r.createdAt);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return requestTime > twentyFourHoursAgo;
      }).length
    };
    
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// Start server
app.listen(PORT, async () => {
  await initializeDB();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});