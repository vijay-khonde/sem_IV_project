import express from 'express';
import Report from '../models/Report.js';
import { protect, isAuthority } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/analytics/overview ───────────────────────────────────────────────
// Returns summary stats for the dashboard charts
router.get('/overview', protect, isAuthority, async (req, res) => {
  try {
    // Reports per day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyReports = await Report.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgRisk: { $avg: '$riskScore' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, avgRisk: { $round: ['$avgRisk', 1] }, _id: 0 } }
    ]);

    // Reports by category
    const byCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // Reports by status
    const byStatus = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // High-risk clustering: top 10 reports by riskScore
    const highRiskHotspots = await Report.find({ riskScore: { $gte: 6 } })
      .select('title riskScore location address category status createdAt')
      .sort({ riskScore: -1 })
      .limit(10);

    // Reports per week for the last 12 weeks
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
    const weeklyTrend = await Report.aggregate([
      { $match: { createdAt: { $gte: twelveWeeksAgo } } },
      {
        $group: {
          _id: { $week: '$createdAt' },
          count: { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { week: '$_id', count: 1, verified: 1, _id: 0 } }
    ]);

    res.json({ dailyReports, byCategory, byStatus, highRiskHotspots, weeklyTrend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analytics/heatmap ────────────────────────────────────────────────
// Returns all geo-located reports for the map heatmap (public)
router.get('/heatmap', async (req, res) => {
  try {
    const reports = await Report.find({
      'location.coordinates': { $exists: true },
      status: { $ne: 'rejected' }
    })
      .select('location riskScore category status title address createdAt isAnonymous')
      .sort({ riskScore: -1 })
      .limit(500);

    // Shape data for Leaflet heatmap: [lat, lng, intensity]
    const heatPoints = reports.map(r => ({
      lat: r.location.coordinates[1],
      lng: r.location.coordinates[0],
      intensity: r.riskScore / 10,
      riskScore: r.riskScore,
      category: r.category,
      status: r.status,
      title: r.title,
      address: r.address
    }));

    res.json(heatPoints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
