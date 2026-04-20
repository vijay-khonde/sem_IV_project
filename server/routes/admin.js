import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check admin or authority (simplified for hackathon/project)
const isAdmin = async (req, res, next) => {
  // Normally use JWT here
  const { adminId } = req.query; // Just for simplicity, in reality extract from JWT
  if (!adminId) return res.status(401).json({ message: 'No auth' });
  const user = await User.findById(adminId);
  const authRoles = ['admin', 'gov', 'ngo', 'healthcare'];
  if (user && authRoles.includes(user.role)) {
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

// Delete a report
router.delete('/report/:id', isAdmin, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// INTERVENTION EFFECTIVENESS TRACKER
// ==========================================

import Intervention from '../models/Intervention.js';

// Get all interventions
router.get('/interventions', isAdmin, async (req, res) => {
  try {
    const interventions = await Intervention.find().sort({ createdAt: -1 });
    res.json(interventions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new intervention
router.post('/intervention', isAdmin, async (req, res) => {
  try {
    const { title, type, longitude, latitude, radius } = req.body;
    const { adminId } = req.query;
    
    const newIntervention = new Intervention({
      title,
      type,
      location: {
         type: 'Point',
         coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      radius: radius || 5000,
      authorityId: adminId
    });
    
    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate Intervention (Calculate risk reduction)
router.put('/intervention/:id/evaluate', isAdmin, async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) return res.status(404).json({ message: 'Not found' });
    
    intervention.status = 'completed';
    intervention.endDate = new Date();
    
    // Calculate Effectiveness: Compare reports before and after the start date within the radius
    const thirtyDaysBefore = new Date(intervention.startDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    const now = new Date();
    
    // Reports 30 days before intervention
    const reportsBefore = await Report.countDocuments({
      createdAt: { $gte: thirtyDaysBefore, $lt: intervention.startDate },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: intervention.location.coordinates },
          $maxDistance: intervention.radius
        }
      }
    });
    
    // Reports after intervention started
    const reportsAfter = await Report.countDocuments({
      createdAt: { $gte: intervention.startDate, $lte: now },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: intervention.location.coordinates },
          $maxDistance: intervention.radius
        }
      }
    });

    // Normalize counts to a 30-day window to compare fairly
    const daysSinceStart = Math.max(1, (now.getTime() - intervention.startDate.getTime()) / (1000 * 3600 * 24));
    const normalizedReportsAfter = reportsAfter * (30 / daysSinceStart);

    let riskReduction = 0;
    if (reportsBefore > 0) {
      riskReduction = ((reportsBefore - normalizedReportsAfter) / reportsBefore) * 100;
      // Cap between -100 (100% increase in risk) and 100 (100% reduction)
      riskReduction = Math.max(-100, Math.min(100, riskReduction));
    } else if (reportsBefore === 0 && reportsAfter === 0) {
      riskReduction = 0; // No data
    } else {
      riskReduction = -100; // Increased from zero
    }
    
    intervention.riskReduction = Math.round(riskReduction);
    await intervention.save();
    
    res.json(intervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
