// api/admin/requests.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = mongoose.connection;
    console.log('✅ Admin: MongoDB connected');
    return cachedDb;
  } catch (error) {
    console.error('❌ Admin: MongoDB connection error:', error);
    throw error;
  }
}

// Define Contact Schema if not already defined
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  message: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  notes: String,
  contactedAt: Date,
  ip: String,
  userAgent: String
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// Simple authentication middleware
function authenticate(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  // Simple token check - in production use JWT or better auth
  return token === ADMIN_SECRET;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Authenticate (simple check)
  const authToken = req.headers.authorization;
  const expectedToken = `Bearer ${ADMIN_SECRET}`;
  
  if (!authToken || authToken !== expectedToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized. Invalid or missing token.' 
    });
  }
  
  try {
    await connectToDatabase();
    
    const { method } = req;
    const { id } = req.query;
    
    switch (method) {
      case 'GET':
        if (id) {
          // Get single request
          const request = await Contact.findById(id);
          if (!request) {
            return res.status(404).json({ 
              success: false, 
              message: 'Request not found' 
            });
          }
          return res.status(200).json({ 
            success: true, 
            request 
          });
        } else {
          // Get all requests sorted by date (newest first)
          const requests = await Contact.find({})
            .sort({ submittedAt: -1 })
            .limit(100); // Limit to 100 most recent
          
          return res.status(200).json({ 
            success: true, 
            requests 
          });
        }
        
      case 'PATCH':
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Request ID is required' 
          });
        }
        
        const { status, notes } = req.body;
        const updateData = {};
        
        if (status) {
          updateData.status = status;
          if (status === 'contacted') {
            updateData.contactedAt = new Date();
          }
        }
        
        if (notes !== undefined) {
          updateData.notes = notes;
        }
        
        const updatedRequest = await Contact.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        );
        
        if (!updatedRequest) {
          return res.status(404).json({ 
            success: false, 
            message: 'Request not found' 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Request updated successfully',
          request: updatedRequest
        });
        
      case 'DELETE':
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Request ID is required' 
          });
        }
        
        const deletedRequest = await Contact.findByIdAndDelete(id);
        
        if (!deletedRequest) {
          return res.status(404).json({ 
            success: false, 
            message: 'Request not found' 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Request deleted successfully' 
        });
        
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}