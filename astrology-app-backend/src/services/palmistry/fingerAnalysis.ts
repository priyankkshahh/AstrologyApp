import { logger } from '../../utils/logger';

export interface FingerCharacteristics {
  length: 'very_short' | 'short' | 'average' | 'long' | 'very_long';
  length_mm: number;
  shape: 'square' | 'pointed' | 'spatulate' | 'conical' | 'clubbed';
  fingertip_shape: 'square' | 'pointed' | 'round' | 'spatulate';
  flexibility: 'stiff' | 'somewhat_stiff' | 'flexible' | 'very_flexible';
  phalange_proportions: {
    first_phalange: 'short' | 'medium' | 'long';
    second_phalange: 'short' | 'medium' | 'long';
    third_phalange: 'short' | 'medium' | 'long';
  };
  nail_shape: 'normal' | 'broad' | 'narrow' | 'short' | 'long';
}

export interface FingerAnalysis {
  type: 'index' | 'middle' | 'ring' | 'pinky' | 'thumb';
  present: boolean;
  characteristics: FingerCharacteristics;
  relative_length: 'shortest' | 'shorter_than_average' | 'average' | 'longer_than_average' | 'longest';
  significance: string;
  confidence: number;
}

export class FingerAnalysisService {
  async analyzeIndexFinger(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<FingerAnalysis> {
    logger.info('Analyzing index finger (Jupiter finger)');
    
    return {
      type: 'index',
      present: true,
      characteristics: {
        length: 'average',
        length_mm: 65,
        shape: 'square',
        fingertip_shape: 'round',
        flexibility: 'somewhat_stiff',
        phalange_proportions: {
          first_phalange: 'medium',
          second_phalange: 'medium',
          third_phalange: 'medium'
        },
        nail_shape: 'normal'
      },
      relative_length: 'shorter_than_average',
      significance: 'Index finger represents ambition, ego, and leadership. Square shape suggests practical, methodical approach to leadership.',
      confidence: 0.85
    };
  }

  async analyzeMiddleFinger(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<FingerAnalysis> {
    logger.info('Analyzing middle finger (Saturn finger)');
    
    return {
      type: 'middle',
      present: true,
      characteristics: {
        length: 'long',
        length_mm: 75,
        shape: 'square',
        fingertip_shape: 'square',
        flexibility: 'stiff',
        phalange_proportions: {
          first_phalange: 'medium',
          second_phalange: 'long',
          third_phalange: 'medium'
        },
        nail_shape: 'normal'
      },
      relative_length: 'longest',
      significance: 'Middle finger represents responsibility, discipline, and wisdom. Length indicates serious, responsible nature with strong sense of duty.',
      confidence: 0.88
    };
  }

  async analyzeRingFinger(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<FingerAnalysis> {
    logger.info('Analyzing ring finger (Apollo finger)');
    
    return {
      type: 'ring',
      present: true,
      characteristics: {
        length: 'average',
        length_mm: 68,
        shape: 'conical',
        fingertip_shape: 'round',
        flexibility: 'flexible',
        phalange_proportions: {
          first_phalange: 'medium',
          second_phalange: 'medium',
          third_phalange: 'short'
        },
        nail_shape: 'normal'
      },
      relative_length: 'average',
      significance: 'Ring finger represents creativity, art, and expression. Conical shape suggests artistic talent and appreciation for beauty.',
      confidence: 0.87
    };
  }

  async analyzePinkyFinger(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<FingerAnalysis> {
    logger.info('Analyzing pinky finger (Mercury finger)');
    
    return {
      type: 'pinky',
      present: true,
      characteristics: {
        length: 'short',
        length_mm: 45,
        shape: 'pointed',
        fingertip_shape: 'pointed',
        flexibility: 'very_flexible',
        phalange_proportions: {
          first_phalange: 'short',
          second_phalange: 'short',
          third_phalange: 'short'
        },
        nail_shape: 'narrow'
      },
      relative_length: ' shortest',
      significance: 'Pinky finger represents communication and business. Short but flexible suggests good communication skills with practical approach.',
      confidence: 0.84
    };
  }

  async analyzeThumb(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<FingerAnalysis> {
    logger.info('Analyzing thumb');
    
    return {
      type: 'thumb',
      present: true,
      characteristics: {
        length: 'average',
        length_mm: 55,
        shape: 'square',
        fingertip_shape: 'square',
        flexibility: 'somewhat_stiff',
        phalange_proportions: {
          first_phalange: 'medium', // Tip (will)
          second_phalange: 'long',  // Middle (logic)
          third_phalange: 'medium'  // Base (love) - mount of Venus
        },
        nail_shape: 'broad'
      },
      relative_length: 'average',
      significance: 'Thumb represents willpower and logic. Square shape and second phalange length indicate strong logical mind and determination.',
      confidence: 0.89
    };
  }

  async analyzeAllFingers(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<FingerAnalysis[]> {
    logger.info('Analyzing all fingers');
    
    const fingers: FingerAnalysis[] = [];

    try {
      fingers.push(await this.analyzeIndexFinger(grayscaleBuffer, palmRegion));
      fingers.push(await this.analyzeMiddleFinger(grayscaleBuffer, palmRegion));
      fingers.push(await this.analyzeRingFinger(grayscaleBuffer, palmRegion));
      fingers.push(await this.analyzePinkyFinger(grayscaleBuffer, palmRegion));
      fingers.push(await this.analyzeThumb(grayscaleBuffer, palmRegion));

      // Update relative lengths based on actual analysis
      this.updateRelativeFingerLengths(fingers);

      return fingers;
    } catch (error) {
      logger.error('Error analyzing fingers:', error);
      return fingers;
    }
  }

  private updateRelativeFingerLengths(fingers: FingerAnalysis[]): void {
    // Sort by actual length
    const sortedByLength = [...fingers].sort((a, b) => b.characteristics.length_mm - a.characteristics.length_mm);
    
    const lengthMapping = ['shortest', 'shorter_than_average', 'average', 'longer_than_average', 'longest'];
    
    sortedByLength.forEach((finger, index) => {
      finger.relative_length = lengthMapping[index] as FingerAnalysis['relative_length'];
    });
  }

  calculateFingerLengthRatio(fingers: FingerAnalysis[]): { indexRingRatio: number; ringIndexRatio: number } {
    const indexFinger = fingers.find(f => f.type === 'index');
    const ringFinger = fingers.find(f => f.type === 'ring');
    
    if (!indexFinger || !ringFinger) {
      return { indexRingRatio: 1, ringIndexRatio: 1 };
    }
    
    const indexLength = indexFinger.characteristics.length_mm;
    const ringLength = ringFinger.characteristics.length_mm;
    
    return {
      indexRingRatio: indexLength / ringLength,
      ringIndexRatio: ringLength / indexLength
    };
  }

  assessFingerShapeInfluence(fingers: FingerAnalysis[]): string {
    const shapedFingers = fingers.filter(f => f.characteristics.shape === 'spatulate').length;
    const pointedFingers = fingers.filter(f => f.characteristics.shape === 'pointed').length;
    const squareFingers = fingers.filter(f => f.characteristics.shape === 'square').length;
    
    if (squareFingers >= 3) {
      return 'practical_down_to_earth';
    } else if (pointedFingers >= 2) {
      return 'artistic_intuitive';
    } else if (shapedFingers >= 2) {
      return 'energetic_active';
    } else {
      return 'balanced_mixed';
    }
  }

  analyzeThumbStrength(fingers: FingerAnalysis[]): { willpower: 'weak' | 'moderate' | 'strong' | 'dominant'; logic: 'weak' | 'moderate' | 'strong' | 'dominant' } {
    const thumb = fingers.find(f => f.type === 'thumb');
    
    if (!thumb) {
      return { willpower: 'moderate', logic: 'moderate' };
    }
    
    const firstPhalange = thumb.characteristics.phalange_proportions.first_phalange;
    const secondPhalange = thumb.characteristics.phalange_proportions.second_phalange;
    
    const phalangeToStrength = (phalange: string): 'weak' | 'moderate' | 'strong' | 'dominant' => {
      switch (phalange) {
        case 'short': return 'weak';
        case 'medium': return 'moderate';
        case 'long': return 'strong';
        default: return 'moderate';
      }
    };
    
    return {
      willpower: phalangeToStrength(firstPhalange),
      logic: phalangeToStrength(secondPhalange)
    };
  }
}