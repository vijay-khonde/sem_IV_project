import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { protect, isAuthority } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// ── Rate limiter ──────────────────────────────────────────────────────────────
const reportSpamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many reports submitted. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── File Upload (Cloudinary or local fallback) ────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let upload;
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'demo') {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'chrais_reports', allowedFormats: ['jpg', 'png', 'jpeg'] }
  });
  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
} else {
  const dir = './uploads';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}

// ── Rule-Based Risk Scoring ───────────────────────────────────────────────────
/**
 * Calculates a risk score 0–10 using:
 * - User trust score
 * - Report frequency (spam detection)
 * - Nearby verified corroboration
 * - Category weight
 * - Severity tags
 */
async function calculateRiskScore(user, category, severityTags = [], longitude, latitude) {
  // 1. Base from user trust
  let credibility = user.trustScore / 100;

  // 2. Spam penalty: >3 reports in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await Report.countDocuments({ userId: user._id, createdAt: { $gte: oneHourAgo } });
  if (recentCount > 3) credibility -= 0.3;

  // 3. Location corroboration boost
  try {
    const nearbyVerified = await Report.countDocuments({
      status: 'verified',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: 2000
        }
      }
    });
    if (nearbyVerified > 0) credibility += 0.2;
    if (nearbyVerified > 5) credibility += 0.1; // hotspot bonus
  } catch { /* geo index may not exist yet */ }

  credibility = Math.max(0.1, Math.min(credibility, 1.0));

  // 4. Category weight
  const categoryWeight = {
    substance_use: 3,
    drug_paraphernalia: 2.5,
    suspicious_activity: 2,
    loitering: 1.5,
    other: 1
  };
  const catScore = categoryWeight[category] || 1;

  // 5. Severity tag multiplier
  const severityBonus = (severityTags || []).length * 0.4;

  let riskScore = (credibility * 5) + catScore + severityBonus;
  return {
    credibility,
    riskScore: Math.min(10, Math.max(0, parseFloat(riskScore.toFixed(2)))),
    autoReject: credibility < 0.2 || user.trustScore < 20
  };
}

// ── POST /api/reports — Submit a report ──────────────────────────────────────
router.post('/', protect, reportSpamLimiter, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, longitude, latitude, address, isAnonymous, severityTags } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Input validation
    if (!title || !description || !category || !longitude || !latitude) {
      return res.status(400).json({ message: 'title, description, category, and location coordinates are required.' });
    }
    if (title.trim().length < 5) return res.status(400).json({ message: 'Title must be at least 5 characters.' });
    if (description.trim().length < 20) return res.status(400).json({ message: 'Description must be at least 20 characters.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Parse severityTags (may arrive as JSON string from FormData)
    let parsedTags = [];
    try {
      parsedTags = severityTags ? JSON.parse(severityTags) : [];
    } catch { parsedTags = []; }

    const { credibility, riskScore, autoReject } = await calculateRiskScore(
      user, category, parsedTags, longitude, latitude
    );

    const newReport = new Report({
      userId: user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      severityTags: parsedTags,
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
      address: address?.trim(),
      imageUrl,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      credibility,
      riskScore,
      status: autoReject ? 'rejected' : 'pending'
    });

    user.reportsSubmitted += 1;
    await user.save();
    await newReport.save();

    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: 'Error creating report.', error: error.message });
  }
});

// ── GET /api/reports — All reports (public for map view) ─────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, category, limit = 200 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const reports = await Report.find(filter)
      .populate({
        path: 'userId',
        select: 'name trustScore role',
        // If anonymous, we'll mask on the fly below
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mask reporter identity for anonymous reports
    const sanitized = reports.map(r => {
      const obj = r.toObject();
      if (obj.isAnonymous) {
        obj.userId = { name: 'Anonymous', trustScore: null, role: null };
      }
      return obj;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ── GET /api/reports/my — Current user's own reports ─────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ── GET /api/reports/:id — Single report detail ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('userId', 'name role trustScore');
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    const obj = report.toObject();
    if (obj.isAnonymous) obj.userId = { name: 'Anonymous' };
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ── PUT /api/reports/:id/upvote — Upvote a report ────────────────────────────
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    const alreadyUpvoted = report.upvotes.includes(req.user.id);
    if (alreadyUpvoted) {
      report.upvotes = report.upvotes.filter(id => id.toString() !== req.user.id);
    } else {
      report.upvotes.push(req.user.id);
      // Upvotes from the community also boost risk score slightly
      report.riskScore = Math.min(10, report.riskScore + 0.1);
    }
    await report.save();
    res.json({ upvotes: report.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
