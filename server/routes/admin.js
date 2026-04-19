import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check admin (simplified for hackathon/project)
const isAdmin = async (req, res, next) => {
  // Normally use JWT here
  const { adminId } = req.query; // Just for simplicity, in reality extract from JWT
  if (!adminId) return res.status(401).json({ message: 'No auth' });
  const user = await User.findById(adminId);
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
};

router.get('/stats', isAdmin, async (req, res) => {
  try {
    const count = await Report.countDocuments();
    const resolved = await Report.countDocuments({ status: 'resolved' });
    const verified = await Report.countDocuments({ status: 'verified' });
    const usersCount = await User.countDocuments();
    res.json({ totalReports: count, resolved, verified, users: usersCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update report status
router.put('/report/:id', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    
    report.status = status;
    await report.save();
    
    // Update user trust score based on report verification
    if (status === 'verified') {
      const author = await User.findById(report.userId);
      if (author) {
        author.validReports += 1;
        author.trustScore = Math.min(100, author.trustScore + 5);
        await author.save();
      }
    } else if (status === 'rejected') {
      const author = await User.findById(report.userId);
      if (author) {
        author.trustScore = Math.max(0, author.trustScore - 10);
        await author.save();
      }
    }
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
