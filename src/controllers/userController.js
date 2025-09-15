import User from '../models/User.js';
import Query from '../models/Query.js';
import Session from '../models/Session.js';

const createUser = async (req, res) => {
  try {
    const user = await User.createUser(req.body);
    
    // Automatically create a session for the new user
    const session = await Session.createSession(user.id, {
      loginTime: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    
    res.status(201).json({ 
      success: true, 
      data: {
        user,
        session
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const { limit = parseInt(process.env.USER_HISTORY_DEFAULT_LIMIT) || 50 } = req.query;
    const queries = await Query.getQueriesByUserId(req.params.id, parseInt(limit));
    res.json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await User.getAllUsers({ limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Find user by email or name
    let user = null;
    if (email) {
      const users = await User.getAllUsers({ limit: 1000 });
      user = users.find(u => u.email === email);
    }
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Create new session for login
    const session = await Session.createSession(user.id, {
      loginTime: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    
    res.json({
      success: true,
      data: {
        user,
        session
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  createUser,
  getUserById,
  getUserHistory,
  updateUser,
  getAllUsers,
  deleteUser,
  loginUser
};