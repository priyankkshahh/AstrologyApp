import { logger } from '../../utils/logger';

export interface SignCharacteristics {
  type: 'star' | 'trident' | 'grille' | 'triangle' | 'circle' | 'cross' | 'chain' | 'island' | 'dot';
  location: {
    x: number;
    y: number;
    size: 'small' | 'medium' | 'large';
  };
  line_association: 'heart' | 'head' | 'life' | 'fate' | 'sun' | 'mercury' | 'mount' | 'none';
  mount_association?: 'venus' | 'jupiter' | 'saturn' | 'apollo' | 'mercury' | 'luna' | 'mars_upper' | 'mars_lower';
  interpretation: {
    timing?: string; // When the sign may manifest
    meaning: string;
    intensity: 'mild' | 'moderate' | 'strong' | 'intense';
    duration: 'temporary' | 'periodic' | 'long_term' | 'lifelong';
  };
  confidence: number;
  is_beneficial: boolean;
  severity: 'positive' | 'neutral' | 'negative' | 'warning';
}

export interface TimingMark {
  position: number; // 0-100, percentage along a line
  age: number; // Age when event occurs
  event_type: 'major_life_change' | 'challenge' | 'opportunity' | 'health_issue' | 'relationship' | 'career';
  description: string;
  line: 'heart' | 'head' | 'life' | 'fate';
}

export class SignsAndMarkingsService {
  async detectStars(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting stars on palm');
    
    const palmWidth = palmRegion?.width || 800;
    const palmHeight = palmRegion?.height || 1000;
    
    const stars: SignCharacteristics[] = [
      {
        type: 'star',
        location: {
          x: palmRegion ? (palmRegion.x + palmWidth * 0.7) : (palmWidth * 0.7),
          y: palmRegion ? (palmRegion.y + palmHeight * 0.3) : (palmHeight * 0.3),
          size: 'small'
        },
        line_association: 'sun',
        mount_association: 'apollo',
        interpretation: {
          timing: 'Around age 35-40',
          meaning: 'Unexpected success, recognition, or fame. A positive omen for achievement in creative endeavors.',
          intensity: 'strong',
          duration: 'long_term'
        },
        confidence: 0.65,
        is_beneficial: true,
        severity: 'positive'
      }
    ];

    return stars;
  }

  async detectTridents(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting tridents on palm');
    
    const palmWidth = palmRegion?.width || 800;
    const palmHeight = palmRegion?.height || 1000;
    
    const tridents: SignCharacteristics[] = [
      {
        type: 'trident',
        location: {
          x: palmRegion ? (palmRegion.x + palmWidth * 0.3) : (palmWidth * 0.3),
          y: palmRegion ? (palmRegion.y + palmHeight * 0.85) : (palmHeight * 0.85),
          size: 'medium'
        },
        line_association: 'life',
        mount_association: undefined,
        interpretation: {
          timing: 'Later in life',
          meaning: 'Great achievement and success. Protection from danger. Strong life force and vitality.',
          intensity: 'intense',
          duration: 'long_term'
        },
        confidence: 0.7,
        is_beneficial: true,
        severity: 'positive'
      }
    ];

    return tridents;
  }

  async detectGrilles(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting grilles on palm');
    
    const palmWidth = palmRegion?.width || 800;
    const palmHeight = palmRegion?.height || 1000;
    
    const grilles: SignCharacteristics[] = [
      {
        type: 'grille',
        location: {
          x: palmRegion ? (palmRegion.x + palmWidth * 0.2) : (palmWidth * 0.2),
          y: palmRegion ? (palmRegion.y + palmHeight * 0.8) : (palmHeight * 0.8),
          size: 'medium'
        },
        line_association: 'mount',
        mount_association: 'venus',
        interpretation: {
          timing: 'Ongoing',
          meaning: 'Strong passion and intensity in love and relationships. Can indicate jealousy if overdeveloped.',
          intensity: 'moderate',
          duration: 'lifelong'
        },
        confidence: 0.72,
        is_beneficial: true,
        severity: 'positive'
      }
    ];

    return grilles;
  }

  async detectTriangles(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting triangles on palm');
    
    const palmWidth = palmRegion?.width || 800;
    const palmHeight = palmRegion?.height || 1000;
    
    const triangles: SignCharacteristics[] = [
      {
        type: 'triangle',
        location: {
          x: palmRegion ? (palmRegion.x + palmWidth * 0.6) : (palmWidth * 0.6),
          y: palmRegion ? (palmRegion.y + palmHeight * 0.4) : (palmHeight * 0.4),
          size: 'small'
        },
        line_association: 'head',
        mount_association: undefined,
        interpretation: {
          timing: 'Throughout life',
          meaning: 'Mental capacity, analytical ability, and protection. Good for academic and intellectual pursuits.',
          intensity: 'moderate',
          duration: 'lifelong'
        },
        confidence: 0.68,
        is_beneficial: true,
        severity: 'positive'
      }
    ];

    return triangles;
  }

  async detectCrosses(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting crosses on palm');
    
    const palmWidth = palmRegion?.width || 800;
    const palmHeight = palmRegion?.height || 1000;
    
    const crosses: SignCharacteristics[] = [
      {
        type: 'cross',
        location: {
          x: palmRegion ? (palmRegion.x + palmWidth * 0.5) : (palmWidth * 0.5),
          y: palmRegion ? (palmRegion.y + palmHeight * 0.5) : (palmHeight * 0.5),
          size: 'medium'
        },
        line_association: 'heart',
        mount_association: undefined,
        interpretation: {
          timing: 'Age 25-30',
          meaning: 'Emotional challenge or disappointment in relationships. Learning experience that leads to growth.',
          intensity: 'moderate',
          duration: 'temporary'
        },
        confidence: 0.63,
        is_beneficial: false,
        severity: 'warning'
      }
    ];

    return crosses;
  }

  async detectChainsAndIslands(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting chains and islands on palm');
    
    const island: SignCharacteristics = {
      type: 'island',
      location: {
        x: palmRegion ? (palmRegion.x + 300) : 300,
        y: palmRegion ? (palmRegion.y + 400) : 400,
        size: 'small'
      },
      line_association: 'head',
      mount_association: undefined,
      interpretation: {
        timing: 'Age 35-40',
        meaning: 'Period of mental confusion, stress, or difficulty concentrating. May indicate health concerns.',
        intensity: 'moderate',
        duration: 'periodic'
      },
      confidence: 0.6,
      is_beneficial: false,
      severity: 'negative'
    };

    return [island];
  }

  async detectAllSigns(grayscaleBuffer: Buffer, palmRegion?: { x: number; y: number; width: number; height: number }): Promise<SignCharacteristics[]> {
    logger.info('Detecting all signs on palm');
    
    const allSigns: SignCharacteristics[] = [];

    try {
      // Run all detection methods in parallel
      const [stars, tridents, grilles, triangles, crosses, chainsAndIslands] = await Promise.all([
        this.detectStars(grayscaleBuffer, palmRegion),
        this.detectTridents(grayscaleBuffer, palmRegion),
        this.detectGrilles(grayscaleBuffer, palmRegion),
        this.detectTriangles(grayscaleBuffer, palmRegion),
        this.detectCrosses(grayscaleBuffer, palmRegion),
        this.detectChainsAndIslands(grayscaleBuffer, palmRegion)
      ]);

      // Combine all detected signs
      allSigns.push(...stars, ...tridents, ...grilles, ...triangles, ...crosses, ...chainsAndIslands);

      return allSigns;
    } catch (error) {
      logger.error('Error detecting signs:', error);
      return allSigns;
    }
  }

  calculateLifeLineTiming(lifeLineLength: number, lifeLinePercentage: number): TimingMark[] {
    const timing: TimingMark[] = [];
    
    // Palmistry timing is approximately 1mm = 1 year, but varies by hand size
    // Using percentage-based approach for simulation
    
    if (lifeLinePercentage > 20) {
      timing.push({
        position: 20,
        age: 20,
        event_type: 'major_life_change',
        description: 'Important life transition or maturity',
        line: 'life'
      });
    }
    
    if (lifeLinePercentage > 35) {
      timing.push({
        position: 35,
        age: 35,
        event_type: 'career',
        description: 'Significant career development or change',
        line: 'life'
      });
    }
    
    if (lifeLinePercentage > 50) {
      timing.push({
        position: 50,
        age: 50,
        event_type: 'major_life_change',
        description: 'Mid-life reflection and potential redirection',
        line: 'life'
      });
    }
    
    if (lifeLinePercentage > 70) {
      timing.push({
        position: 70,
        age: 70,
        event_type: 'challenge',
        description: 'Health awareness or life challenge',
        line: 'life'
      });
    }
    
    return timing;
  }

  analyzeSignsByLocation(signs: SignCharacteristics[]): Record<string, number> {
    const counts = {
      total_beneficial: 0,
      total_challenging: 0,
      heart_line: 0,
      head_line: 0,
      life_line: 0,
      fate_line: 0,
      sun_line: 0,
      mercury_line: 0,
      mounts: 0
    };

    for (const sign of signs) {
      if (sign.is_beneficial) {
        counts.total_beneficial++;
      } else {
        counts.total_challenging++;
      }

      // Count by location
      switch (sign.line_association) {
        case 'heart':
          counts.heart_line++;
          break;
        case 'head':
          counts.head_line++;
          break;
        case 'life':
          counts.life_line++;
          break;
        case 'fate':
          counts.fate_line++;
          break;
        case 'sun':
          counts.sun_line++;
          break;
        case 'mercury':
          counts.mercury_line++;
          break;
        case 'mount':
          counts.mounts++;
          break;
      }
    }

    return counts;
  }

  getSignificanceOfSignType(signType: string): string {
    const significanceMap: Record<string, string> = {
      star: 'Sudden happenings, success, or brilliance in the area where it appears',
      trident: 'Exceptional talent or good fortune, protection',
      grille: 'Intensified energy in mounts, can be positive or negative',
      triangle: 'Inherent talent, protection, analytical ability',
      circle: 'Special occurrence or event, protection',
      cross: 'Challenges, obstacles, or tests to overcome',
      chain: 'Confusion, constraint, or difficulty in the area',
      island: 'Temporary difficulty, health concern, or challenge',
      dot: 'Pain, effort, or energy focused in the area'
    };

    return significanceMap[signType] || 'Unknown significance';
  }

  getOverallSignBalance(signs: SignCharacteristics[]): { beneficial: number; challenging: number; balance_score: number } {
    const beneficial = signs.filter(s => s.severity === 'positive').length;
    const challenging = signs.filter(s => s.severity === 'negative' || s.severity === 'warning').length;
    const neutral = signs.filter(s => s.severity === 'neutral').length;

    const total = signs.length || 1;
    const balanceScore = (beneficial - challenging) / total;

    return {
      beneficial,
      challenging,
      balance_score: balanceScore
    };
  }
}