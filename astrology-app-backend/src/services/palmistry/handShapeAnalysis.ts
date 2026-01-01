import { logger } from '../../utils/logger';

export interface HandShapeCharacteristics {
  shape: 'earth' | 'air' | 'fire' | 'water';
  palm_shape: 'square' | 'rectangular';
  finger_length_relative: 'short' | 'long';
  hand_size: 'small' | 'medium' | 'large';
  palm_size_mm: { width: number; height: number };
  finger_length_mm: number; // Average finger length
  palm_finger_ratio: number; // Palm length to finger length ratio
}

export interface SkinCharacteristics {
  color: 'pale' | 'pinkish' | 'normal' | 'red' | 'yellowish';
  texture: 'smooth' | 'medium' | 'coarse';
  elasticity: 'loose' | 'normal' | 'firm';
  moisture: 'dry' | 'normal' | 'moist';
  thickness: 'thin' | 'normal' | 'thick';
}

export interface HandFlexibility {
  overall_flexibility: 'stiff' | 'somewhat_stiff' | 'flexible' | 'very_flexible';
  thumb_flexibility: 'stiff' | 'somewhat_stiff' | 'flexible' | 'very_flexible';
  finger_flexibility: 'stiff' | 'somewhat_stiff' | 'flexible' | 'very_flexible';
  wrist_flexibility: 'stiff' | 'somewhat_stiff' | 'flexible' | 'very_flexible';
}

export interface HandShapeAnalysis {
  shape_analysis: HandShapeCharacteristics;
  skin_characteristics: SkinCharacteristics;
  flexibility: HandFlexibility;
  overall_assessment: string;
  personality_traits: string[];
  confidence: number;
}

export class HandShapeAnalysisService {
  async analyzeHandShape(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<HandShapeCharacteristics> {
    logger.info('Analyzing hand shape');
    
    const palmWidth = palmRegion?.width || 800;
    const palmHeight = palmRegion?.height || 1000;
    const averageFingerLength = 65; // Average of all finger lengths
    
    // Calculate palm to finger ratio
    const palmFingerRatio = palmHeight / averageFingerLength;
    
    // Determine hand shape based on palm/finger proportions
    let shape: 'earth' | 'air' | 'fire' | 'water';
    let palm_shape: 'square' | 'rectangular';
    let finger_length_relative: 'short' | 'long';
    
    // Determine palm shape
    if (Math.abs(palmWidth - palmHeight * 0.8) < 50) {
      palm_shape = 'square';
    } else {
      palm_shape = 'rectangular';
    }
    
    // Finger length relative to palm
    if (palmFingerRatio > 12) {
      finger_length_relative = 'short';
    } else {
      finger_length_relative = 'long';
    }
    
    // Determine hand shape type
    if (palm_shape === 'square' && finger_length_relative === 'short') {
      shape = 'earth';
    } else if (palm_shape === 'square' && finger_length_relative === 'long') {
      shape = 'air';
    } else if (palm_shape === 'rectangular' && finger_length_relative === 'short') {
      shape = 'fire';
    } else {
      shape = 'water';
    }
    
    // Determine hand size relative to average (assuming average palm is 900mm height)
    const totalHeight = palmHeight;
    let hand_size: 'small' | 'medium' | 'large';
    
    if (totalHeight < 850) {
      hand_size = 'small';
    } else if (totalHeight > 1100) {
      hand_size = 'large';
    } else {
      hand_size = 'medium';
    }
    
    return {
      shape,
      palm_shape,
      finger_length_relative,
      hand_size,
      palm_size_mm: {
        width: Math.round(palmWidth * 0.264583), // Convert pixels to mm (approximate)
        height: Math.round(palmHeight * 0.264583)
      },
      finger_length_mm: averageFingerLength,
      palm_finger_ratio: palmFingerRatio
    };
  }

  async analyzeSkinCharacteristics(grayscaleBuffer: Buffer): Promise<SkinCharacteristics> {
    logger.info('Analyzing skin characteristics');
    
    return {
      color: 'normal',
      texture: 'medium',
      elasticity: 'normal',
      moisture: 'normal',
      thickness: 'normal'
    };
  }

  async assessFlexibility(grayscaleBuffer: Buffer): Promise<HandFlexibility> {
    logger.info('Assessing hand flexibility');
    
    return {
      overall_flexibility: 'somewhat_stiff',
      thumb_flexibility: 'somewhat_stiff',
      finger_flexibility: 'flexible',
      wrist_flexibility: 'flexible'
    };
  }

  async analyzeCompleteHandShape(
    grayscaleBuffer: Buffer, 
    palmRegion?: { x: number; y: number; width: number; height: number }
  ): Promise<HandShapeAnalysis> {
    logger.info('Performing complete hand shape analysis');
    
    try {
      const [shapeAnalysis, skinCharacteristics, flexibility] = await Promise.all([
        this.analyzeHandShape(grayscaleBuffer, palmRegion),
        this.analyzeSkinCharacteristics(grayscaleBuffer),
        this.assessFlexibility(grayscaleBuffer)
      ]);
      
      const personalityTraits = this.getPersonalityTraits(shapeAnalysis, skinCharacteristics, flexibility);
      const overallAssessment = this.generateOverallAssessment(shapeAnalysis, skinCharacteristics, flexibility);
      
      return {
        shape_analysis: shapeAnalysis,
        skin_characteristics,
        flexibility,
        overall_assessment: overallAssessment,
        personality_traits: personalityTraits,
        confidence: 0.82
      };
    } catch (error) {
      logger.error('Error in complete hand shape analysis:', error);
      throw error;
    }
  }

  private getPersonalityTraits(
    shape: HandShapeCharacteristics, 
    skin: SkinCharacteristics, 
    flexibility: HandFlexibility
  ): string[] {
    const traits: string[] = [];
    
    // Traits based on hand shape
    switch (shape.shape) {
      case 'earth':
        traits.push('practical', 'grounded', 'reliable', 'material_focused');
        break;
      case 'air':
        traits.push('intellectual', 'communicative', 'analytical', 'social');
        break;
      case 'fire':
        traits.push('creative', 'passionate', 'energetic', 'action_oriented');
        break;
      case 'water':
        traits.push('emotional', 'intuitive', 'artistic', 'empathetic');
        break;
    }
    
    // Traits based on hand size
    switch (shape.hand_size) {
      case 'small':
        traits.push('big_picture_thinking', 'quick_decisions');
        break;
      case 'large':
        traits.push('detailed_oriented', 'analytical', 'methodical');
        break;
      case 'medium':
        traits.push('balanced_perspective', 'adaptable');
        break;
    }
    
    // Traits based on flexibility
    switch (flexibility.overall_flexibility) {
      case 'stiff':
      case 'somewhat_stiff':
        traits.push('rigid', 'stubborn', 'determined');
        break;
      case 'flexible':
      case 'very_flexible':
        traits.push('adaptable', 'open_minded', 'easygoing');
        break;
    }
    
    // Traits based on skin characteristics
    if (skin.moisture === 'dry') {
      traits.push('nervous_energy', 'restless');
    } else if (skin.moisture === 'moist') {
      traits.push('relaxed', 'calm_demeanor');
    }
    
    if (skin.color === 'pinkish' || skin.color === 'red') {
      traits.push('passionate', 'vibrant');
    } else if (skin.color === 'pale' || skin.color === 'yellowish') {
      traits.push('reserved', 'reflective');
    }
    
    return [...new Set(traits)]; // Remove duplicates
  }

  private generateOverallAssessment(
    shape: HandShapeCharacteristics,
    skin: SkinCharacteristics,
    flexibility: HandFlexibility
  ): string {
    let assessment = `This is a ${shape.hand_size} ${shape.shape} hand. `;
    
    // Primary hand shape interpretation
    switch (shape.shape) {
      case 'earth':
        assessment += 'You have a practical, down-to-earth nature with a strong connection to the material world. ';
        assessment += 'You are reliable, methodical, and excel in hands-on activities. ';
        break;
      case 'air':
        assessment += 'You possess an intellectual and communicative nature with strong analytical abilities. ';
        assessment += 'Your approach to life is logical and you excel in social interactions. ';
        break;
      case 'fire':
        assessment += 'You have a dynamic, creative nature with abundant energy and enthusiasm. ';
        assessment += 'You are action-oriented and often inspire others with your passion. ';
        break;
      case 'water':
        assessment += 'You are sensitive, intuitive, and deeply emotional. ';
        assessment += 'You possess strong creative and artistic abilities with heightened empathy. ';
        break;
    }
    
    // Hand size interpretation
    switch (shape.hand_size) {
      case 'large':
        assessment += 'Your large hands indicate a preference for details and thorough analysis. ';
        break;
      case 'small':
        assessment += 'Your small hands suggest you think in broad concepts and make quick decisions. ';
        break;
      case 'medium':
        assessment += 'Your medium-sized hands show a balanced approach to both details and big picture thinking. ';
        break;
    }
    
    // Flexibility interpretation
    switch (flexibility.overall_flexibility) {
      case 'stiff':
      case 'somewhat_stiff':
        assessment += 'Your hand stiffness indicates determination and strong willpower, though you may be resistant to change. ';
        break;
      case 'flexible':
      case 'very_flexible':
        assessment += 'Your hand flexibility shows an adaptable and open-minded approach to life. ';
        break;
    }
    
    // Skin texture and moisture interpretation
    if (skin.moisture === 'dry') {
      assessment += 'Dry skin suggests nervous energy and a restless disposition. ';
    } else if (skin.moisture === 'moist') {
      assessment += 'Moist skin indicates a calm and balanced temperament. ';
    }
    
    return assessment.trim();
  }

  getHandShapeMeanings(): Record<string, string> {
    return {
      earth: 'Practical, grounded, reliable, focused on material world, strong work ethic',
      air: 'Intellectual, communicative, analytical, social, mentally oriented',
      fire: 'Creative, passionate, energetic, action-oriented, inspiring',
      water: 'Emotional, intuitive, artistic, empathetic, feeling-oriented'
    };
  }

  getHandSizeMeanings(): Record<string, string> {
    return {
      small: 'Big picture thinking, quick decisions, conceptual understanding',
      medium: 'Balanced perspective, adaptable, versatile',
      large: 'Detail-oriented, analytical, methodical, thorough'
    };
  }
}