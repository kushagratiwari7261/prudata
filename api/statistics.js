// api/statistics.js
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = '/tmp/requests.json';

const readRequests = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const requests = await readRequests();
      
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const statistics = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        contacted: requests.filter(r => r.status === 'contacted').length,
        completed: requests.filter(r => r.status === 'completed').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        last24Hours: requests.filter(r => {
          const requestTime = new Date(r.createdAt);
          return requestTime > twentyFourHoursAgo;
        }).length
      };
      
      return res.status(200).json(statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return res.status(500).json({ message: 'Error fetching statistics' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}