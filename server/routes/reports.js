import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import rateLimit from 'express-rate-limit';
import Report from '../models/Report.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Spam Detection: Rate Limiter Middleware
const reportSpamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, // Limit each IP to 5 reports per 15 minutes
  message: { message: "Spam Detection Triggered: Too many reports submitted from this IP. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

import fs from 'fs';

let upload;
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'demo') {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'chrais_reports',
      allowedFormats: ['jpg', 'png', 'jpeg']
    }
  });
  upload = multer({ storage: storage });
} else {
  // Fallback to local memory/disk if Cloudinary is not configured
  const dir = './uploads';
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/') },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
  });
  upload = multer({ storage: storage });
}

// Helper function to call Hugging Face free Inference API
async function analyzeThreatAI(description) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: description,
          parameters: { candidate_labels: ["critical emergency", "high risk threat", "suspicious activity", "benign", "false alarm"] },
        }),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("HF API Error:", error);
    return null;
  }
}

// Create a report with Spam Limiter
router.post('/', reportSpamLimiter, upload.single('image'), async (req, res) => {
  try {
    const { userId, title, description, category, longitude, latitude, address } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let aiRiskModifier = 0;
    
    // Call the free Hugging Face model (Wait asynchronously so it doesn't block the initial saving if it's slow, or wait synchronously if we want it immediately)
    if (process.env.HUGGINGFACE_API_KEY) {
       const aiAnalysis = await analyzeThreatAI(title + " . " + description);
       console.log("AI Analysis Result:", aiAnalysis);
       
       if (aiAnalysis && aiAnalysis.labels && aiAnalysis.scores) {
          const topLabel = aiAnalysis.labels[0];
          const topScore = aiAnalysis.scores[0];
          
          if (topLabel === "critical emergency" && topScore > 0.5) aiRiskModifier += 4;
          else if (topLabel === "high risk threat" && topScore > 0.4) aiRiskModifier += 2.5;
          else if (topLabel === "suspicious activity" && topScore > 0.4) aiRiskModifier += 1;
          else if (topLabel === "false alarm" && topScore > 0.4) aiRiskModifier -= 2;
       }
    }

    // --- Community Trust Scoring System ---
    // 1. Base credibility on user's historical trust score
    let credibilityScore = user.trustScore / 100;

    // 2. Frequency / Spam Check: Has the user submitted too many reports recently?
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReportsCount = await Report.countDocuments({ 
      userId: user._id, 
      createdAt: { $gte: oneHourAgo } 
    });

    if (recentReportsCount > 3) {
      // Penalize credibility for rapid-fire reporting (potential spam)
      credibilityScore -= 0.3; 
    }

    // 3. Consistency: Check if there are other verified reports nearby (boosts credibility)
    let nearbyVerifiedReports = 0;
    try {
      nearbyVerifiedReports = await Report.countDocuments({
        status: 'verified',
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            $maxDistance: 2000 // 2km radius
          }
        }
      });
    } catch (geoErr) {
      console.log('Geo spatial query failed (index might not be built yet):', geoErr.message);
    }

    if (nearbyVerifiedReports > 0) {
      credibilityScore += 0.2; // Corroborated by historical verified activity in the area
    }

    // Cap credibility
    credibilityScore = Math.max(0.1, Math.min(credibilityScore, 1.0));

    let calculatedRiskScore = (credibilityScore * 10) + aiRiskModifier;
    
    // Bounds checking
    if(calculatedRiskScore > 10) calculatedRiskScore = 10;
    if(calculatedRiskScore < 0) calculatedRiskScore = 0;

    // 4. Auto-Reject severely untrustworthy reports
    let initialStatus = 'pending';
    if (credibilityScore < 0.2 || user.trustScore < 20) {
       initialStatus = 'rejected'; // Auto-flag as spam/misuse
    }

    const newReport = new Report({
      userId,
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address,
      imageUrl,
      credibility: credibilityScore,
      riskScore: calculatedRiskScore,
      status: initialStatus
    });

    user.reportsSubmitted += 1;
    await user.save();
    
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
});

// Get all reports (can be filtered)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().populate('userId', 'name trustScore');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
