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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chrais_reports',
    allowedFormats: ['jpg', 'png', 'jpeg']
  }
});
const upload = multer({ storage: storage });

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

    let calculatedRiskScore = ((user.trustScore / 100) * 10) + aiRiskModifier;
    
    // Bounds checking
    if(calculatedRiskScore > 10) calculatedRiskScore = 10;
    if(calculatedRiskScore < 0) calculatedRiskScore = 0;

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
      credibility: user.trustScore / 100,
      riskScore: calculatedRiskScore
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
