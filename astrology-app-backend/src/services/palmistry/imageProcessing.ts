import sharp from 'sharp';
import { logger } from '../../utils/logger';

export interface PalmImageData {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  qualityScore: number;
}

export interface HandDetectionResult {
  hasHand: boolean;
  palmRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  handSide: 'left' | 'right' | 'unknown';
  orientation: number;
  confidence: number;
  qualityIssues: string[];
}

export class ImageProcessingService {
  // Minimum image requirements
  private readonly MIN_WIDTH = 1000;
  private readonly MIN_HEIGHT = 1000;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ACCEPTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];

  async validateImage(file: Express.Multer.File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum limit of 10MB`);
    }

    // Check format
    const format = file.mimetype.split('/')[1];
    if (!this.ACCEPTED_FORMATS.includes(format)) {
      errors.push(`Unsupported format: ${format}. Accept: JPEG, PNG, WebP`);
    }

    // Check dimensions
    const metadata = await sharp(file.buffer).metadata();
    if (metadata.width && metadata.height) {
      if (metadata.width < this.MIN_WIDTH || metadata.height < this.MIN_HEIGHT) {
        errors.push(`Image too small: minimum ${this.MIN_WIDTH}x${this.MIN_HEIGHT}px requires`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async processPalmImage(file: Express.Multer.File): Promise<{ processed: PalmImageData; grayscale: Buffer }> {
    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      // Apply preprocessing
      const grayscaleBuffer = await image
        .grayscale()
        .normalize() // Histogram equalization
        .median(2) // Noise reduction
        .modulate({
          brightness: 1.1, // Slight brightness enhancement
          contrast: 1.15 // Contrast enhancement
        })
        .toBuffer();

      // Keep original in memory for analysis
      const processedBuffer = await image
        .resize(2000, 2000, { // Standardize size for analysis
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      return {
        processed: {
          buffer: processedBuffer,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: format || 'unknown',
          qualityScore: this.assessImageQuality(metadata, file.buffer)
        },
        grayscale: grayscaleBuffer
      };
    } catch (error) {
      logger.error('Error processing palm image:', error);
      throw new Error('Failed to process palm image');
    }
  }

  async detectHand(grayscaleBuffer: Buffer): Promise<HandDetectionResult> {
    try {
      // This is a placeholder for hand detection logic
      // In a real implementation, you would use OpenCV or TensorFlow
      const image = sharp(grayscaleBuffer);
      const metadata = await image.metadata();

      // Simulate hand detection with basic heuristics
      const qualityIssues = this.checkImageQuality(grayscaleBuffer, metadata);
      
      // For now, assume hand is present and centered
      const palmRegion = metadata.width && metadata.height ? {
        x: Math.floor((metadata.width * 0.25)),
        y: Math.floor((metadata.height * 0.3)),
        width: Math.floor((metadata.width * 0.5)),
        height: Math.floor((metadata.height * 0.4))
      } : undefined;

      return {
        hasHand: qualityIssues.length === 0,
        palmRegion,
        handSide: this.detectHandSide(grayscaleBuffer, metadata),
        orientation: 0, // Assume upright
        confidence: qualityIssues.length === 0 ? 0.85 : 0.5,
        qualityIssues
      };
    } catch (error) {
      logger.error('Error detecting hand:', error);
      return {
        hasHand: false,
        handSide: 'unknown',
        orientation: 0,
        confidence: 0,
        qualityIssues: ['Error during hand detection']
      };
    }
  }

  private detectHandSide(buffer: Buffer, metadata: sharp.Metadata): 'left' | 'right' | 'unknown' {
    // In a real implementation, this would analyze the thumb position
    // For now, return unknown
    return 'unknown';
  }

  private checkImageQuality(buffer: Buffer, metadata: sharp.Metadata): string[] {
    const issues: string[] = [];

    // Check brightness
    if (metadata.density && metadata.density < 72) {
      issues.push('Low image density may affect quality');
    }

    // TODO: Add more sophisticated quality checks
    // - Lighting assessment
    // - Sharpness detection
    // - Finger visibility check
    // - Palm clarity evaluation

    return issues;
  }

  private assessImageQuality(metadata: sharp.Metadata, buffer: Buffer): number {
    let score = 1.0;

    // Penalize for small resolution
    if (metadata.width && metadata.width < 1500) {
      score -= 0.2;
    }

    // Penalize for low quality
    if (metadata.size && metadata.size < this.MAX_FILE_SIZE * 0.2) {
      score -= 0.1;
    }

    // Penalize for potential compression artifacts
    if (metadata.hasAlpha) {
      score -= 0.05;
    }

    return Math.max(0.1, Math.min(1.0, score));
  }
}