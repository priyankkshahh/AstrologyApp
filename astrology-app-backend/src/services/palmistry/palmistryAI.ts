import * as tf from '@tensorflow/tfjs-node';
import { logger } from '../../utils/logger';

export interface AIPrediction {
  trait: string;
  probability: number;
  confidence: number;
  context: string;
}

export interface PalmistryFeatures {
  // Hand shape features
  hand_shape_type: number; // 0-3: earth, air, fire, water
  palm_finger_ratio: number;
  hand_size: number; // 0-2: small, medium, large
  
  // Line features
  heart_line_length: number; // 0-1
  heart_line_depth: number; // 0-2: faint, clear, deep
  head_line_length: number;
  head_line_curvature: number; // 0-3: straight, slightly_curved, curved, very_curved
  life_line_length: number;
  life_line_continuity: number; // 0-2: continuous, broken, chained
  fate_line_present: number; // 0-1
  sun_line_present: number; // 0-1
  
  // Mount features
  venus_development: number; // 0-4: flat, slightly_raised, raised, prominent, overdeveloped
  jupiter_development: number;
  saturn_development: number;
  apollo_development: number;
  mercury_development: number;
  luna_development: number;
  mars_development: number;
  
  // Finger features
  index_length: number; // Relative to palm
  middle_length: number;
  ring_length: number;
  pinky_length: number;
  thumb_length: number;
  
  // Signs and markings
  beneficial_signs_count: number;
  challenging_signs_count: number;
  
  // 40 total features
}

export class PalmistryAIService {
  private model: tf.LayersModel | null = null;
  private featureMeans: number[] = [];
  private featureStds: number[] = [];

  constructor() {
    // Initialize with pre-trained weights if available
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      // Create a simple neural network for palmistry prediction
      // In production, this would load a pre-trained model
      const model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [40],
            units: 128,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 16,
            activation: 'sigmoid'
          })
        ]
      });

      // Compile the model
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.model = model;
      
      // Initialize normalization parameters (would be loaded from training data)
      this.featureMeans = new Array(40).fill(0.5);
      this.featureStds = new Array(40).fill(0.3);
      
      logger.info('Palmistry AI model initialized');
    } catch (error) {
      logger.error('Error initializing palmistry AI model:', error);
      // Continue without AI model - will use rule-based predictions
    }
  }

  async predictPersonalityTraits(features: PalmistryFeatures): Promise<AIPrediction[]> {
    const predictions: AIPrediction[] = [];

    try {
      if (this.model) {
        // Normalize features
        const normalizedFeatures = this.normalizeFeatures(features);
        
        // Convert to tensor
        const inputTensor = tf.tensor2d([normalizedFeatures]);
        
        // Make prediction
        const prediction = this.model.predict(inputTensor) as tf.Tensor;
        const probabilities = await prediction.array() as number[][];
        
        // Process predictions
        const traitLabels = this.getPersonalityTraitLabels();
        probabilities[0].forEach((prob, index) => {
          if (index < traitLabels.length) {
            predictions.push({
              trait: traitLabels[index],
              probability: prob,
              confidence: prob > 0.7 ? 0.8 : prob > 0.5 ? 0.6 : 0.4,
              context: this.getTraitContext(traitLabels[index], features)
            });
          }
        });
        
        // Cleanup tensors
        inputTensor.dispose();
        prediction.dispose();
      } else {
        // Fallback to rule-based predictions if model not loaded
        predictions.push(...this.ruleBasedPersonalityPredictions(features));
      }
    } catch (error) {
      logger.error('Error in AI personality prediction:', error);
      // Fallback to rule-based predictions
      predictions.push(...this.ruleBasedPersonalityPredictions(features));
    }

    return predictions.sort((a, b) => b.probability - a.probability).slice(0, 10);
  }

  async predictLifeEvents(features: PalmistryFeatures): Promise<AIPrediction[]> {
    const predictions: AIPrediction[] = [];

    try {
      // Rule-based life event predictions
      
      // Career success
      if (features.apollo_development > 2 || features.sun_line_present > 0.7) {
        predictions.push({
          trait: 'career_success',
          probability: 0.8,
          confidence: 0.75,
          context: 'Strong Apollo mount or Sun line indicates recognition and success in career'
        });
      }

      // Relationship patterns
      if (features.heart_line_length > 0.7 && features.heart_line_depth > 1) {
        predictions.push({
          trait: 'strong_relationships',
          probability: 0.75,
          confidence: 0.7,
          context: 'Clear, long heart line suggests emotional stability and capacity for deep relationships'
        });
      }

      // Health vitality
      if (features.life_line_length > 0.7 && features.life_line_continuity < 1) {
        predictions.push({
          trait: 'good_health_vitality',
          probability: 0.78,
          confidence: 0.72,
          context: 'Long, unbroken life line indicates strong constitution and vitality'
        });
      }

      // Leadership potential
      if (features.jupiter_development > 2 || features.index_length > 0.8) {
        predictions.push({
          trait: 'leadership_potential',
          probability: 0.72,
          confidence: 0.68,
          context: 'Well-developed Jupiter mount or long index finger suggests natural leadership abilities'
        });
      }

      // Creative abilities
      if (features.ring_length > 0.75 && features.apollo_development > 1.5) {
        predictions.push({
          trait: 'creative_talent',
          probability: 0.8,
          confidence: 0.75,
          context: 'Long ring finger and developed Apollo mount indicate artistic and creative abilities'
        });
      }

      // Communication skills
      if (features.mercury_development > 2 || features.pinky_length > 0.7) {
        predictions.push({
          trait: 'communication_skills',
          probability: 0.77,
          confidence: 0.71,
          context: 'Well-developed Mercury mount or Mercury finger suggests eloquence and business acumen'
        });
      }

      // Challenges
      if (features.challenging_signs_count > 3) {
        predictions.push({
          trait: 'life_challenges',
          probability: 0.7,
          confidence: 0.6,
          context: 'Multiple challenging signs suggest significant life lessons and growth opportunities'
        });
      }

    } catch (error) {
      logger.error('Error in life events prediction:', error);
    }

    return predictions;
  }

  async predictCompatibility(features1: PalmistryFeatures, features2: PalmistryFeatures): Promise<AIPrediction[]> {
    const predictions: AIPrediction[] = [];

    try {
      // Calculate compatibility based on hand shape and features
      
      // Overall compatibility score
      let compatibilityScore = 0.5; // Base score
      
      // Hand shape compatibility
      if (Math.abs(features1.hand_shape_type - features2.hand_shape_type) <= 1) {
        compatibilityScore += 0.15;
      }
      
      // Palm-finger ratio compatibility (similar proportions)
      if (Math.abs(features1.palm_finger_ratio - features2.palm_finger_ratio) < 2) {
        compatibilityScore += 0.1;
      }
      
      // Communication compatibility (Mercury features)
      if (features1.mercury_development > 1.5 && features2.mercury_development > 1.5) {
        compatibilityScore += 0.1;
        predictions.push({
          trait: 'communication_compatibility',
          probability: 0.85,
          confidence: 0.8,
          context: 'Both partners have strong communication indicators'
        });
      }
      
      // Emotional compatibility (heart line features)
      if (Math.abs(features1.heart_line_depth - features2.heart_line_depth) < 1) {
        compatibilityScore += 0.1;
        predictions.push({
          trait: 'emotional_compatibility',
          probability: 0.8,
          confidence: 0.75,
          context: 'Similar emotional depth and expression patterns'
        });
      }
      
      // Intellectual compatibility (head line features)
      if (Math.abs(features1.head_line_curvature - features2.head_line_curvature) <= 1) {
        compatibilityScore += 0.1;
        predictions.push({
          trait: 'intellectual_compatibility',
          probability: 0.78,
          confidence: 0.73,
          context: 'Similar thinking styles and mental approaches'
        });
      }
      
      // Add overall compatibility
      predictions.unshift({
        trait: 'overall_compatibility',
        probability: Math.min(1, Math.max(0, compatibilityScore)),
        confidence: 0.7,
        context: 'Overall palmistry-based compatibility assessment'
      });

    } catch (error) {
      logger.error('Error in compatibility prediction:', error);
    }

    return predictions;
  }

  private normalizeFeatures(features: PalmistryFeatures): number[] {
    const featureArray: number[] = [];
    
    // Convert features object to array
    featureArray.push(features.hand_shape_type);
    featureArray.push(features.palm_finger_ratio);
    featureArray.push(features.hand_size);
    featureArray.push(features.heart_line_length);
    featureArray.push(features.heart_line_depth);
    featureArray.push(features.head_line_length);
    featureArray.push(features.head_line_curvature);
    featureArray.push(features.life_line_length);
    featureArray.push(features.life_line_continuity);
    featureArray.push(features.fate_line_present);
    featureArray.push(features.sun_line_present);
    featureArray.push(features.venus_development);
    featureArray.push(features.jupiter_development);
    featureArray.push(features.saturn_development);
    featureArray.push(features.apollo_development);
    featureArray.push(features.mercury_development);
    featureArray.push(features.luna_development);
    featureArray.push(features.mars_development);
    featureArray.push(features.index_length);
    featureArray.push(features.middle_length);
    featureArray.push(features.ring_length);
    featureArray.push(features.pinky_length);
    featureArray.push(features.thumb_length);
    featureArray.push(features.beneficial_signs_count / 10); // Normalize
    featureArray.push(features.challenging_signs_count / 10);
    
    // Fill remaining features with zeros if needed (total 40 features)
    while (featureArray.length < 40) {
      featureArray.push(0);
    }
    
    // Apply z-score normalization
    return featureArray.map((value, index) => {
      const mean = this.featureMeans[index] || 0.5;
      const std = this.featureStds[index] || 0.3;
      return (value - mean) / (std + 1e-7);
    });
  }

  private ruleBasedPersonalityPredictions(features: PalmistryFeatures): AIPrediction[] {
    const predictions: AIPrediction[] = [];
    
    // Rule-based system using traditional palmistry knowledge
    
    // Hand shape traits
    switch (features.hand_shape_type) {
      case 0: // Earth
        predictions.push({
          trait: 'practical',
          probability: 0.85,
          confidence: 0.8,
          context: 'Earth hand shape indicates practical, grounded nature'
        });
        predictions.push({
          trait: 'reliable',
          probability: 0.8,
          confidence: 0.75,
          context: 'Earth hands are known for reliability and consistency'
        });
        break;
      case 1: // Air
        predictions.push({
          trait: 'intellectual',
          probability: 0.85,
          confidence: 0.8,
          context: 'Air hand shape indicates strong intellectual capacity'
        });
        predictions.push({
          trait: 'communicative',
          probability: 0.82,
          confidence: 0.77,
          context: 'Air hands are naturally communicative and social'
        });
        break;
      case 2: // Fire
        predictions.push({
          trait: 'creative',
          probability: 0.88,
          confidence: 0.83,
          context: 'Fire hand shape indicates creative and passionate nature'
        });
        predictions.push({
          trait: 'energetic',
          probability: 0.85,
          confidence: 0.8,
          context: 'Fire hands possess abundant energy and enthusiasm'
        });
        break;
      case 3: // Water
        predictions.push({
          trait: 'intuitive',
          probability: 0.87,
          confidence: 0.82,
          context: 'Water hand shape indicates strong intuition and empathy'
        });
        predictions.push({
          trait: 'artistic',
          probability: 0.83,
          confidence: 0.78,
          context: 'Water hands are naturally artistic and emotionally expressive'
        });
        break;
    }
    
    return predictions;
  }

  private getPersonalityTraitLabels(): string[] {
    return [
      'practical', 'intellectual', 'creative', 'intuitive', 'reliable', 'communicative',
      'energetic', 'artistic', 'analytical', 'social', 'passionate', 'empathetic',
      'grounded', 'innovative', 'sensitive', 'dynamic', 'methodical', 'inspiring',
      'thoughtful', 'adaptable'
    ];
  }

  private getTraitContext(trait: string, features: PalmistryFeatures): string {
    const contexts: Record<string, string> = {
      practical: 'Based on earth hand shape characteristics',
      intellectual: 'Derived from air hand features and head line patterns',
      creative: 'Indicated by fire hand shape and artistic markers',
      intuitive: 'Reflected in water hand characteristics',
      reliable: 'Suggested by consistent line patterns and earth elements',
      communicative: 'Supported by Mercury mount development',
      energetic: 'Shown by fire hand characteristics and life line vitality',
      artistic: 'Indicated by Apollo mount and creative hand features',
      analytical: 'Derived from head line characteristics and air hand traits',
      social: 'Evident from communication lines and hand shape'
    };
    
    return contexts[trait] || 'Based on comprehensive palmistry analysis';
  }
}