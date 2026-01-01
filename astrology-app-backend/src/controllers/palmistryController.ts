import { Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { ImageProcessingService } from '../services/palmistry/imageProcessing';
import { LineDetectionService } from '../services/palmistry/lineDetection';
import { MountAnalysisService } from '../services/palmistry/mountAnalysis';
import { FingerAnalysisService } from '../services/palmistry/fingerAnalysis';
import { HandShapeAnalysisService } from '../services/palmistry/handShapeAnalysis';
import { SignsAndMarkingsService } from '../services/palmistry/signsAndMarkings';
import { PalmistryAIService } from '../services/palmistry/palmistryAI';

export class PalmistryController {
  private imageProcessingService: ImageProcessingService;
  private lineDetectionService: LineDetectionService;
  private mountAnalysisService: MountAnalysisService;
  private fingerAnalysisService: FingerAnalysisService;
  private handShapeAnalysisService: HandShapeAnalysisService;
  private signsAndMarkingsService: SignsAndMarkingsService;
  private palmistryAIService: PalmistryAIService;

  constructor() {
    this.imageProcessingService = new ImageProcessingService();
    this.lineDetectionService = new LineDetectionService();
    this.mountAnalysisService = new MountAnalysisService();
    this.fingerAnalysisService = new FingerAnalysisService();
    this.handShapeAnalysisService = new HandShapeAnalysisService();
    this.signsAndMarkingsService = new SignsAndMarkingsService();
    this.palmistryAIService = new PalmistryAIService();
  }

  // POST /api/palmistry/upload-palm/:user_id
  uploadPalmPhoto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;
      const { hand_side } = req.body;

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

      // Validate image
      const validation = await this.imageProcessingService.validateImage(req.file);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      // Process image
      const { processed, grayscale } = await this.imageProcessingService.processPalmImage(req.file);
      const handDetection = await this.imageProcessingService.detectHand(grayscale);

      // Upload to Firebase would happen here
      const firebaseUrl = `firebase://${user_id}/${Date.now()}_${hand_side}.jpg`;

      // Save to database
      const result = await pool.query(
        `INSERT INTO palm_photos (user_id, hand_side, firebase_url, is_processed, analysis_status, quality_score) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        [user_id, hand_side, firebaseUrl, true, 'processing', processed.qualityScore]
      );

      const palmPhotoId = result.rows[0].id;

      // Start async analysis
      this.performComprehensiveAnalysis(palmPhotoId, grayscale, handDetection.palmRegion);

      res.status(201).json({
        success: true,
        message: 'Palm photo uploaded successfully',
        data: {
          palm_id: palmPhotoId,
          hand_detection: handDetection,
          quality_score: processed.qualityScore,
          status: 'analysis_in_progress'
        }
      });
    } catch (error) {
      logger.error('Error uploading palm photo:', error);
      res.status(500).json({ success: false, message: 'Failed to upload palm photo' });
    }
  };

  // GET /api/palmistry/palm-photos/:user_id
  getUserPalmPhotos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;

      const result = await pool.query(
        `SELECT * FROM palm_photos WHERE user_id = $1 ORDER BY upload_date DESC`,
        [user_id]
      );

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      logger.error('Error fetching palm photos:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch palm photos' });
    }
  };

  // GET /api/palmistry/palm-analysis/:user_id/:palm_id
  getPalmAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, palm_id } = req.params;

      const result = await pool.query(
        `SELECT * FROM palm_analysis WHERE palm_photo_id = $1`,
        [palm_id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Analysis not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching palm analysis:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch palm analysis' });
    }
  };

  // DELETE /api/palmistry/palm-photos/:user_id/:palm_id
  deletePalmPhoto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, palm_id } = req.params;

      await pool.query('DELETE FROM palm_photos WHERE id = $1 AND user_id = $2', [palm_id, user_id]);

      res.status(200).json({
        success: true,
        message: 'Palm photo deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting palm photo:', error);
      res.status(500).json({ success: false, message: 'Failed to delete palm photo' });
    }
  };

  // GET /api/palmistry/lines/:palm_id
  getLineAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { palm_id } = req.params;

      // Get palm photo data (in real implementation, would fetch image from Firebase)
      // For now, simulate grayscale buffer
      const grayscaleBuffer = Buffer.alloc(1000 * 1000);

      const [heartLine, headLine, lifeLine, fateLine, sunLine, mercuryLine, marriageLines] = await Promise.all([
        this.lineDetectionService.detectHeartLine(grayscaleBuffer),
        this.lineDetectionService.detectHeadLine(grayscaleBuffer),
        this.lineDetectionService.detectLifeLine(grayscaleBuffer),
        this.lineDetectionService.detectFateLine(grayscaleBuffer),
        this.lineDetectionService.detectSunLine(grayscaleBuffer),
        this.lineDetectionService.detectMercuryLine(grayscaleBuffer),
        this.lineDetectionService.detectMarriageLines(grayscaleBuffer)
      ]);

      const allLines = [heartLine, headLine, lifeLine, fateLine, sunLine, mercuryLine, ...marriageLines];
      await this.lineDetectionService.analyzeLineCharacteristics(allLines);

      res.status(200).json({
        success: true,
        data: {
          lines: allLines,
          summary: this.generateLineSummary(allLines)
        }
      });
    } catch (error) {
      logger.error('Error analyzing lines:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze palm lines' });
    }
  };

  // GET /api/palmistry/mounts/:palm_id
  getMountAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { palm_id } = req.params;
      const grayscaleBuffer = Buffer.alloc(1000 * 1000);

      const mounts = await this.mountAnalysisService.analyzeAllMounts(grayscaleBuffer);
      const overallDevelopment = this.mountAnalysisService.calculateOverallMountDevelopment(mounts);

      res.status(200).json({
        success: true,
        data: {
          mounts,
          overall_development: overallDevelopment
        }
      });
    } catch (error) {
      logger.error('Error analyzing mounts:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze mounts' });
    }
  };

  // GET /api/palmistry/fingers/:palm_id
  getFingerAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { palm_id } = req.params;
      const grayscaleBuffer = Buffer.alloc(1000 * 1000);

      const fingers = await this.fingerAnalysisService.analyzeAllFingers(grayscaleBuffer);
      const thumbStrength = this.fingerAnalysisService.analyzeThumbStrength(fingers);
      const fingerInfluence = this.fingerAnalysisService.assessFingerShapeInfluence(fingers);
      const lengthRatios = this.fingerAnalysisService.calculateFingerLengthRatio(fingers);

      res.status(200).json({
        success: true,
        data: {
          fingers,
          thumb_analysis: thumbStrength,
          finger_influence: fingerInfluence,
          length_ratios: lengthRatios
        }
      });
    } catch (error) {
      logger.error('Error analyzing fingers:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze fingers' });
    }
  };

  // GET /api/palmistry/hand-shape/:palm_id
  getHandShapeAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { palm_id } = req.params;
      const grayscaleBuffer = Buffer.alloc(1000 * 1000);

      const analysis = await this.handShapeAnalysisService.analyzeCompleteHandShape(grayscaleBuffer);

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing hand shape:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze hand shape' });
    }
  };

  // GET /api/palmistry/signs-markings/:palm_id
  getSignsAndMarkings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { palm_id } = req.params;
      const grayscaleBuffer = Buffer.alloc(1000 * 1000);

      const signs = await this.signsAndMarkingsService.detectAllSigns(grayscaleBuffer);
      const signsByLocation = this.signsAndMarkingsService.analyzeSignsByLocation(signs);
      const overallBalance = this.signsAndMarkingsService.getOverallSignBalance(signs);

      res.status(200).json({
        success: true,
        data: {
          signs,
          location_analysis: signsByLocation,
          overall_balance: overallBalance
        }
      });
    } catch (error) {
      logger.error('Error analyzing signs:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze signs and markings' });
    }
  };

  // GET /api/palmistry/personality-profile/:user_id
  getPersonalityProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;

      // Get user's latest palm analysis
      const palmResult = await pool.query(
        `SELECT * FROM palm_photos WHERE user_id = $1 ORDER BY upload_date DESC LIMIT 1`,
        [user_id]
      );

      if (palmResult.rows.length === 0) {
        res.status(404).json({ success: false, message: 'No palm data found for user' });
        return;
      }

      const grayscaleBuffer = Buffer.alloc(1000 * 1000);
      
      // Get all analysis components
      const [mounts, fingers, handShape, signs] = await Promise.all([
        this.mountAnalysisService.analyzeAllMounts(grayscaleBuffer),
        this.fingerAnalysisService.analyzeAllFingers(grayscaleBuffer),
        this.handShapeAnalysisService.analyzeCompleteHandShape(grayscaleBuffer),
        this.signsAndMarkingsService.detectAllSigns(grayscaleBuffer)
      ]);

      // Generate features for AI prediction
      const features = this.extractPalmistryFeatures(mounts, fingers, handShape, signs);
      const aiPredictions = await this.palmistryAIService.predictPersonalityTraits(features);

      const profile = this.generatePersonalityProfile(mounts, fingers, handShape, signs, aiPredictions);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error generating personality profile:', error);
      res.status(500).json({ success: false, message: 'Failed to generate personality profile' });
    }
  };

  // Additional reading endpoints would follow similar patterns...
  getLifePathAnalysis = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Life path analysis endpoint' });
  };

  getCareerGuidance = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Career guidance endpoint' });
  };

  getRelationshipAnalysis = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Relationship analysis endpoint' });
  };

  getHealthAssessment = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Health assessment endpoint' });
  };

  getDestinyReading = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Destiny reading endpoint' });
  };

  getCompatibilityAnalysis = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Compatibility analysis endpoint' });
  };

  // Private helper methods
  private async performComprehensiveAnalysis(
    palmPhotoId: string,
    grayscaleBuffer: Buffer,
    palmRegion?: { x: number; y: number; width: number; height: number }
  ): Promise<void> {
    try {
      // Perform all analyses
      const [lines, mounts, fingers, handShape, signs] = await Promise.all([
        this.analyzeLines(grayscaleBuffer, palmRegion),
        this.mountAnalysisService.analyzeAllMounts(grayscaleBuffer, palmRegion),
        this.fingerAnalysisService.analyzeAllFingers(grayscaleBuffer, palmRegion),
        this.handShapeAnalysisService.analyzeCompleteHandShape(grayscaleBuffer, palmRegion),
        this.signsAndMarkingsService.detectAllSigns(grayscaleBuffer, palmRegion)
      ]);

      // Store analysis in database
      await pool.query(
        `INSERT INTO palm_analysis (
          palm_photo_id, hand_shape, hand_size, hand_flexibility, palm_color, 
          lines_data, mounts_data, fingers_data, signs_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          palmPhotoId,
          handShape.shape_analysis.shape,
          handShape.shape_analysis.hand_size,
          handShape.flexibility.overall_flexibility,
          handShape.skin_characteristics.color,
          JSON.stringify(lines),
          JSON.stringify(mounts),
          JSON.stringify(fingers),
          JSON.stringify(signs)
        ]
      );

      // Update palm photo status
      await pool.query(
        `UPDATE palm_photos SET analysis_status = 'completed', is_processed = true WHERE id = $1`,
        [palmPhotoId]
      );

      logger.info(`Palm analysis completed for photo ${palmPhotoId}`);
    } catch (error) {
      logger.error(`Error in comprehensive analysis for ${palmPhotoId}:`, error);
      
      // Update status to failed
      await pool.query(
        `UPDATE palm_photos SET analysis_status = 'failed' WHERE id = $1`,
        [palmPhotoId]
      );
    }
  }

  private async analyzeLines(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }) {
    const [heartLine, headLine, lifeLine, fateLine, sunLine, mercuryLine, marriageLines] = await Promise.all([
      this.lineDetectionService.detectHeartLine(grayscaleBuffer, palmRegion),
      this.lineDetectionService.detectHeadLine(grayscaleBuffer, palmRegion),
      this.lineDetectionService.detectLifeLine(grayscaleBuffer, palmRegion),
      this.lineDetectionService.detectFateLine(grayscaleBuffer, palmRegion),
      this.lineDetectionService.detectSunLine(grayscaleBuffer, palmRegion),
      this.lineDetectionService.detectMercuryLine(grayscaleBuffer, palmRegion),
      this.lineDetectionService.detectMarriageLines(grayscaleBuffer, palmRegion)
    ]);

    const allLines = [heartLine, headLine, lifeLine, fateLine, sunLine, mercuryLine, ...marriageLines];
    await this.lineDetectionService.analyzeLineCharacteristics(allLines);

    return allLines;
  }

  private generateLineSummary(lines: any[]) {
    return {
      total_lines_detected: lines.length,
      major_lines: lines.filter(line => ['heart', 'head', 'life'].includes(line.type)).length,
      lines_with_breaks: lines.filter(line => line.breaks.length > 0).length,
      overall_quality: lines.reduce((acc, line) => acc + line.confidence, 0) / lines.length
    };
  }

  private extractPalmistryFeatures(
    mounts: any[],
    fingers: any[],
    handShape: any,
    signs: any[]
  ) {
    return {
      hand_shape_type: ['earth', 'air', 'fire', 'water'].indexOf(handShape.shape_analysis.shape),
      palm_finger_ratio: handShape.shape_analysis.palm_finger_ratio,
      hand_size: ['small', 'medium', 'large'].indexOf(handShape.shape_analysis.hand_size),
      heart_line_length: 0.85, // Would calculate from actual line
      heart_line_depth: 1, // medium
      head_line_length: 0.75,
      head_line_curvature: 0, // straight
      life_line_length: 0.8,
      life_line_continuity: 0, // continuous
      fate_line_present: 1,
      sun_line_present: 1,
      venus_development: 2, // raised
      jupiter_development: 1,
      saturn_development: 0,
      apollo_development: 2,
      mercury_development: 2,
      luna_development: 1,
      mars_development: 1,
      index_length: 0.8,
      middle_length: 1,
      ring_length: 0.85,
      pinky_length: 0.6,
      thumb_length: 0.75,
      beneficial_signs_count: signs.filter(s => s.is_beneficial).length,
      challenging_signs_count: signs.filter(s => !s.is_beneficial).length
    };
  }

  private generatePersonalityProfile(mounts: any[], fingers: any[], handShape: any, signs: any[], aiPredictions: any[]) {
    const dominantTraits = aiPredictions.filter(p => p.probability > 0.7).slice(0, 5);

    return {
      hand_shape: handShape.shape_analysis.shape,
      summary: handShape.overall_assessment,
      dominant_traits: dominantTraits,
      personality_type: this.determinePersonalityType(handShape, mounts, fingers),
      key_characteristics: handShape.personality_traits,
      strengt
























hs: this.identifyStrengths(mounts, fingers, signs),
      challenges: this.identifyChallenges(mounts, signs),
      compatibility_factors: this.analyzeCompatibilityFactors(fingers, handShape),
      confidence: aiPredictions.reduce((acc, pred) => acc + pred.confidence, 0) / aiPredictions.length
    };
  }

  private determinePersonalityType(handShape: any, mounts: any[], fingers: any[]) {
    // Logic to determine MBTI-like personality type based on palmistry
    return 'INTJ-A'; // Simplified - would be more sophisticated
  }

  private identifyStrengths(mounts: any[], fingers: any[], signs: any[]) {
    return [
      'Strong communication abilities (Mercury mount)',
      'Creative talents (Apollo mount development)',
      'Leadership potential (Jupiter development)',
      'Practical mindset (hand shape analysis)'
    ];
  }

  private identifyChallenges(mounts: any[], signs: any[]) {
    const challenges = [];
    const challengingSigns = signs.filter((s: any) => !s.is_beneficial);
    
    if (challengingSigns.length > 0) {
      challenges.push('Life lessons indicated by palm markings');
    }
    
    return challenges;
  }

  private analyzeCompatibilityFactors(fingers: any[], handShape: any) {
    return {
      communication_style: 'Direct and clear',
      emotional_expression: 'Balanced',
      thinking_style: handShape.shape_analysis.shape === 'air' ? 'Analytical' : 'Practical',
      relationship_approach: 'Committed and loyal'
    };
  }
}