import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import Intervention from '../models/Intervention.js';
import { protect, isAuthority, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require a valid JWT via protect middleware
// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', protect, isAuthority, async (req, res) => {
  try {
    const [total, resolved, verified, rejected, pending, users] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'verified' }),
      Report.countDocuments({ status: 'rejected' }),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments()
    ]);
    res.json({ totalReports: total, resolved, verified, rejected, pending, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/users — List all users (admin only) ───────────────────────
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/users/:id — Update user role / trust score ─────────────────
router.put('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const { role, trustScore } = req.body;
    const allowedRoles = ['user', 'gov', 'ngo', 'healthcare', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const updates = {};
    if (role) updates.role = role;
    if (trustScore !== undefined) updates.trustScore = Math.min(100, Math.max(0, parseInt(trustScore)));

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/users/:id — Delete user (admin only) ───────────────────
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/report/:id — Update report status ─────────────────────────
router.put('/report/:id', protect, isAuthority, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['pending', 'verified', 'rejected', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    const prevStatus = report.status;
    report.status = status;
    if (adminNote) report.adminNote = adminNote;
    if (status === 'resolved') report.resolvedAt = new Date();

    await report.save();

    // Adjust author trust score based on authority decision
    const author = await User.findById(report.userId);
    if (author) {
      if (status === 'verified' && prevStatus !== 'verified') {
        author.validReports = (author.validReports || 0) + 1;
        author.trustScore = Math.min(100, (author.trustScore || 50) + 5);
      } else if (status === 'rejected' && prevStatus !== 'rejected') {
        author.trustScore = Math.max(0, (author.trustScore || 50) - 10);
      }
      await author.save();
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/report/:id ─────────────────────────────────────────────
router.delete('/report/:id', protect, isAuthority, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json({ message: 'Report deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/interventions ──────────────────────────────────────────────
router.get('/interventions', protect, isAuthority, async (req, res) => {
  try {
    const interventions = await Intervention.find().sort({ createdAt: -1 });
    res.json(interventions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/intervention ─────────────────────────────────────────────
router.post('/intervention', protect, isAuthority, async (req, res) => {
  try {
    const { title, type, longitude, latitude, radius } = req.body;
    if (!title || !type || !longitude || !latitude) {
      return res.status(400).json({ message: 'title, type, longitude, and latitude are required.' });
    }

    const newIntervention = new Intervention({
      title,
      type,
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
      radius: radius || 5000,
      authorityId: req.user.id
    });

    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/intervention/:id/evaluate ─────────────────────────────────
router.put('/intervention/:id/evaluate', protect, isAuthority, async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) return res.status(404).json({ message: 'Intervention not found.' });

    intervention.status = 'completed';
    intervention.endDate = new Date();

    const thirtyDaysBefore = new Date(intervention.startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const geoQuery = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: intervention.location.coordinates },
          $maxDistance: intervention.radius
        }
      }
    };

    const [reportsBefore, reportsAfter] = await Promise.all([
      Report.countDocuments({ createdAt: { $gte: thirtyDaysBefore, $lt: intervention.startDate }, ...geoQuery }),
      Report.countDocuments({ createdAt: { $gte: intervention.startDate, $lte: new Date() }, ...geoQuery })
    ]);

    const daysSinceStart = Math.max(1, (Date.now() - intervention.startDate.getTime()) / (1000 * 3600 * 24));
    const normalizedAfter = reportsAfter * (30 / daysSinceStart);

    let riskReduction = 0;
    if (reportsBefore > 0) {
      riskReduction = Math.max(-100, Math.min(100, ((reportsBefore - normalizedAfter) / reportsBefore) * 100));
    } else if (reportsAfter > 0) {
      riskReduction = -100;
    }

    intervention.riskReduction = Math.round(riskReduction);
    await intervention.save();
    res.json(intervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
