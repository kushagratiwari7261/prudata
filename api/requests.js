// api/requests.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  try {
    const { name, email, company, message } = req.body;
    
    console.log('📨 Form submission received:', { name, email, company });
    
    // Validate input
    if (!name || !email || !company || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }
    
    // In a real app, you would save to MongoDB here
    // For now, we'll just log it and return success
    
    // Log the submission (in production, save to database)
    const submission = {
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      message: message.trim(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    
    console.log('📝 Submission logged:', submission);
    
    // Success response
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your request has been submitted successfully.',
      requestId: Date.now(), // In production, use database ID
      timestamp: submission.timestamp
    });
    
  } catch (error) {
    console.error('💥 Server error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
}