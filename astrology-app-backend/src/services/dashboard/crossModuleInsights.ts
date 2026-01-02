import { pool } from '../../config/database';
import { logger } from '../../utils/logger';
import { CrossModuleInsight } from '../../types/dashboard';

export class CrossModuleInsightsService {
  /**
   * Generate comprehensive cross-module insights
   * Correlates data from astrology, numerology, tarot, and palmistry
   */
  async generateInsights(userId: string): Promise<CrossModuleInsight[]> {
    try {
      logger.info(`Generating cross-module insights for user ${userId}`);

      // Fetch recent readings from all modules
      const recentReadings = await this.getRecentReadings(userId);

      // Fetch user profile for birth details
      const profile = await this.getUserProfile(userId);

      if (!profile?.date_of_birth) {
        logger.warn('No birth date found for user, cannot generate insights');
        return [];
      }

      // Generate insights based on available data
      const insights: CrossModuleInsight[] = [];

      // Generate different types of insights
      insights.push(...await this.generateHarmonyInsights(profile, recentReadings));
      insights.push(...await this.generateOpportunityInsights(profile, recentReadings));
      insights.push(...await this.generateWarningInsights(profile, recentReadings));
      insights.push(...await this.generateChallengeInsights(profile, recentReadings));

      // Sort by strength and limit to top 10
      insights.sort((a, b) => {
        const strengthOrder = { high: 0, medium: 1, low: 2 };
        return strengthOrder[a.strength] - strengthOrder[b.strength];
      });

      return insights.slice(0, 10);
    } catch (error) {
      logger.error('Error generating cross-module insights:', error);
      return [];
    }
  }

  /**
   * Get recent readings from all modules
   */
  private async getRecentReadings(userId: string) {
    try {
      const result = await pool.query(
        `SELECT type, subtype, data, created_at 
         FROM reading_history 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 20`,
        [userId]
      );

      return {
        astrology: result.rows.filter(r => r.type === 'astrology'),
        numerology: result.rows.filter(r => r.type === 'numerology'),
        tarot: result.rows.filter(r => r.type === 'tarot'),
        palmistry: result.rows.filter(r => r.type === 'palmistry')
      };
    } catch (error) {
      logger.error('Error fetching recent readings:', error);
      return { astrology: [], numerology: [], tarot: [], palmistry: [] };
    }
  }

  /**
   * Get user profile
   */
  private async getUserProfile(userId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Generate harmony insights - when modules align positively
   */
  private async generateHarmonyInsights(profile: any, readings: any): Promise<CrossModuleInsight[]> {
    const insights: CrossModuleInsight[] = [];
    const dateOfBirth = new Date(profile.date_of_birth);
    const sunSign = this.calculateSunSign(dateOfBirth);
    const dailyNumber = this.calculateDailyNumber(dateOfBirth);

    // Astrology + Numerology Harmony
    if (this.checkElementHarmony(sunSign, dailyNumber)) {
      insights.push({
        id: `harmony_astro_num_${Date.now()}`,
        title: 'Cosmic Harmony',
        description: `Your ${sunSign} energy flows in perfect sync with numerology day ${dailyNumber}. This rare alignment amplifies your natural strengths and brings ease to your endeavors.`,
        modules: ['astrology', 'numerology'],
        strength: 'high',
        category: 'harmonious',
        created_at: new Date().toISOString()
      });
    }

    // Tarot + Astrology Harmony
    if (readings.tarot.length > 0) {
      const latestTarot = readings.tarot[0];
      const cardName = latestTarot.data?.dailyCard?.name || latestTarot.data?.card?.name;
      
      if (cardName && this.checkCardSignHarmony(cardName, sunSign)) {
        insights.push({
          id: `harmony_tarot_astro_${Date.now()}`,
          title: 'Divine Synchronicity',
          description: `The ${cardName} card resonates powerfully with your ${sunSign} nature. The universe is sending you clear messages - trust the guidance you're receiving.`,
          modules: ['tarot', 'astrology'],
          strength: 'high',
          category: 'harmonious',
          created_at: new Date().toISOString()
        });
      }
    }

    // All modules alignment
    if (readings.astrology.length > 0 && readings.numerology.length > 0 && 
        readings.tarot.length > 0 && readings.palmistry.length > 0) {
      insights.push({
        id: `harmony_all_${Date.now()}`,
        title: 'Complete Cosmic Alignment',
        description: 'All four divination systems are showing remarkable convergence. This is a powerful time for major decisions and transformative action.',
        modules: ['astrology', 'numerology', 'tarot', 'palmistry'],
        strength: 'high',
        category: 'harmonious',
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Generate opportunity insights - potential for growth
   */
  private async generateOpportunityInsights(profile: any, readings: any): Promise<CrossModuleInsight[]> {
    const insights: CrossModuleInsight[] = [];

    // Career opportunities
    const careerInsight = this.analyzeCareerOpportunities(profile, readings);
    if (careerInsight) {
      insights.push(careerInsight);
    }

    // Relationship opportunities
    const relationshipInsight = this.analyzeRelationshipOpportunities(profile, readings);
    if (relationshipInsight) {
      insights.push(relationshipInsight);
    }

    // Personal growth opportunities
    const growthInsight = this.analyzeGrowthOpportunities(profile, readings);
    if (growthInsight) {
      insights.push(growthInsight);
    }

    return insights;
  }

  /**
   * Generate warning insights - cautionary advice
   */
  private async generateWarningInsights(profile: any, readings: any): Promise<CrossModuleInsight[]> {
    const insights: CrossModuleInsight[] = [];
    const dateOfBirth = new Date(profile.date_of_birth);
    const sunSign = this.calculateSunSign(dateOfBirth);

    // Check for challenging card + sign combination
    if (readings.tarot.length > 0) {
      const latestTarot = readings.tarot[0];
      const cardName = latestTarot.data?.dailyCard?.name;
      const isReversed = latestTarot.data?.dailyCard?.orientation === 'reversed';

      if (cardName && isReversed && this.isChallengingCard(cardName)) {
        insights.push({
          id: `warning_tarot_astro_${Date.now()}`,
          title: 'Cosmic Caution',
          description: `The reversed ${cardName} card combined with your ${sunSign} energy suggests temporary challenges. Patience and introspection will serve you well now.`,
          modules: ['tarot', 'astrology'],
          strength: 'medium',
          category: 'warnings',
          created_at: new Date().toISOString()
        });
      }
    }

    // Check for number disharmony
    const dailyNumber = this.calculateDailyNumber(dateOfBirth);
    if (this.isChallengingNumberDay(sunSign, dailyNumber)) {
      insights.push({
        id: `warning_num_astro_${Date.now()}`,
        title: 'Energy Alignment Alert',
        description: `Numerology day ${dailyNumber} may create some tension with your ${sunSign} nature. Focus on adaptability and avoid major decisions today.`,
        modules: ['numerology', 'astrology'],
        strength: 'medium',
        category: 'warnings',
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Generate challenge insights - areas requiring attention
   */
  private async generateChallengeInsights(profile: any, readings: any): Promise<CrossModuleInsight[]> {
    const insights: CrossModuleInsight[] = [];

    // Check for palmistry challenges
    if (readings.palmistry.length > 0) {
      const latestPalmistry = readings.palmistry[0];
      const handShape = latestPalmistry.data?.hand_shape;
      
      if (handShape === 'water' && profile.date_of_birth) {
        const sunSign = this.calculateSunSign(new Date(profile.date_of_birth));
        if (!['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) {
          insights.push({
            id: `challenge_palm_astro_${Date.now()}`,
            title: 'Emotional Intelligence Development',
            description: `Your water hands suggest deep emotional sensitivity, while your ${sunSign} sun sign craves action. Balancing these energies is your key growth area.`,
            modules: ['palmistry', 'astrology'],
            strength: 'medium',
            category: 'challenging',
            created_at: new Date().toISOString()
          });
        }
      }
    }

    // Check for contradictory readings
    if (readings.tarot.length > 1) {
      const lastTwo = readings.tarot.slice(0, 2);
      const cardsContradict = this.checkCardContradiction(
        lastTwo[0].data?.dailyCard?.name,
        lastTwo[1].data?.dailyCard?.name
      );

      if (cardsContradict) {
        insights.push({
          id: `challenge_tarot_${Date.now()}`,
          title: 'Crossroads Energy',
          description: 'Recent tarot readings show conflicting energies. This indicates you are at a significant decision point. Trust your intuition over logic now.',
          modules: ['tarot'],
          strength: 'high',
          category: 'challenging',
          created_at: new Date().toISOString()
        });
      }
    }

    return insights;
  }

  /**
   * Analyze career opportunities across modules
   */
  private analyzeCareerOpportunities(profile: any, readings: any): CrossModuleInsight | null {
    const dateOfBirth = new Date(profile.date_of_birth);
    const lifePathNumber = this.calculateLifePathNumber(dateOfBirth);
    const sunSign = this.calculateSunSign(dateOfBirth);

    const careerNumbers = [8, 4, 1];
    const careerSigns = ['Capricorn', 'Virgo', 'Taurus'];

    if (careerNumbers.includes(lifePathNumber) && careerSigns.includes(sunSign)) {
      return {
        id: `opportunity_career_${Date.now()}`,
        title: 'Professional Ascension',
        description: `Life path ${lifePathNumber} and ${sunSign} sign create powerful career energy. Now is ideal for professional advancement, business ventures, or career changes.`,
        modules: ['numerology', 'astrology'],
        strength: 'high',
        category: 'opportunities',
        created_at: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Analyze relationship opportunities
   */
  private analyzeRelationshipOpportunities(profile: any, readings: any): CrossModuleInsight | null {
    if (readings.tarot.length === 0) return null;

    const latestTarot = readings.tarot[0];
    const cardName = latestTarot.data?.dailyCard?.name;

    const relationshipCards = ['The Lovers', 'The Empress', 'Two of Cups', 'The Star'];
    if (cardName && relationshipCards.includes(cardName)) {
      return {
        id: `opportunity_relationship_${Date.now()}`,
        title: 'Love & Connection Energy',
        description: `The ${cardName} card brings relationship blessings to your reading. This is an excellent time for deepening connections, new relationships, or resolving conflicts.`,
        modules: ['tarot'],
        strength: 'high',
        category: 'opportunities',
        created_at: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Analyze personal growth opportunities
   */
  private analyzeGrowthOpportunities(profile: any, readings: any): CrossModuleInsight | null {
    const dateOfBirth = new Date(profile.date_of_birth);
    const dailyNumber = this.calculateDailyNumber(dateOfBirth);

    const growthNumbers = [7, 9, 11, 22];
    if (growthNumbers.includes(dailyNumber)) {
      return {
        id: `opportunity_growth_${Date.now()}`,
        title: 'Spiritual Growth Window',
        description: `Numerology day ${dailyNumber} opens powerful channels for spiritual growth and self-discovery. Meditation, journaling, or learning new skills are especially favored.`,
        modules: ['numerology'],
        strength: 'high',
        category: 'opportunities',
        created_at: new Date().toISOString()
      };
    }

    return null;
  }

  // Helper methods
  private calculateSunSign(dateOfBirth: Date): string {
    const month = dateOfBirth.getMonth() + 1;
    const day = dateOfBirth.getDate();

    const zodiacSigns = [
      { name: 'Capricorn', start: [12, 22], end: [1, 19] },
      { name: 'Aquarius', start: [1, 20], end: [2, 18] },
      { name: 'Pisces', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Taurus', start: [4, 20], end: [5, 20] },
      { name: 'Gemini', start: [5, 21], end: [6, 20] },
      { name: 'Cancer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Scorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
    ];

    for (const sign of zodiacSigns) {
      if ((month === sign.start[0] && day >= sign.start[1]) ||
          (month === sign.end[0] && day <= sign.end[1])) {
        return sign.name;
      }
    }
    return 'Capricorn';
  }

  private calculateDailyNumber(dateOfBirth: Date): number {
    const today = new Date();
    const sum = dateOfBirth.getDate() + dateOfBirth.getMonth() + 1 + today.getDate() + today.getMonth() + 1;
    return this.reduceToSingleDigit(sum);
  }

  private calculateLifePathNumber(dateOfBirth: Date): number {
    const year = dateOfBirth.getFullYear();
    const month = dateOfBirth.getMonth() + 1;
    const day = dateOfBirth.getDate();

    let sum = 0;
    [year, month, day].forEach(num => {
      sum += this.reduceToSingleDigit(num);
    });
    return this.reduceToSingleDigit(sum);
  }

  private reduceToSingleDigit(num: number): number {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = String(num).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return num;
  }

  private checkElementHarmony(sunSign: string, dailyNumber: number): boolean {
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

    const fireNumbers = [1, 3, 9];
    const earthNumbers = [4, 6, 8];
    const airNumbers = [3, 5, 6];
    const waterNumbers = [2, 7];

    if (fireSigns.includes(sunSign)) return fireNumbers.includes(dailyNumber);
    if (earthSigns.includes(sunSign)) return earthNumbers.includes(dailyNumber);
    if (airSigns.includes(sunSign)) return airNumbers.includes(dailyNumber);
    if (waterSigns.includes(sunSign)) return waterNumbers.includes(dailyNumber);

    return true;
  }

  private checkCardSignHarmony(cardName: string, sunSign: string): boolean {
    const harmoniousPairs: Record<string, string[]> = {
      'The Sun': ['Leo', 'Aries'],
      'The Moon': ['Cancer', 'Pisces', 'Scorpio'],
      'The Star': ['Aquarius', 'Pisces'],
      'The Magician': ['Gemini', 'Virgo'],
      'The Empress': ['Taurus', 'Libra'],
      'The Emperor': ['Capricorn', 'Aries'],
      'The High Priestess': ['Pisces', 'Scorpio'],
      'The Chariot': ['Aries', 'Cancer']
    };

    return harmoniousPairs[cardName]?.includes(sunSign) || false;
  }

  private isChallengingCard(cardName: string): boolean {
    const challengingCards = ['The Tower', 'Death', 'The Devil', 'Ten of Swords'];
    return challengingCards.includes(cardName);
  }

  private isChallengingNumberDay(sunSign: string, dailyNumber: number): boolean {
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

    const conflictingNumbers: Record<string, number[]> = {
      fire: [2, 6, 7],
      earth: [1, 5, 9],
      air: [4, 8],
      water: [1, 3, 9]
    };

    if (fireSigns.includes(sunSign)) return conflictingNumbers.fire.includes(dailyNumber);
    if (earthSigns.includes(sunSign)) return conflictingNumbers.earth.includes(dailyNumber);
    if (airSigns.includes(sunSign)) return conflictingNumbers.air.includes(dailyNumber);
    if (waterSigns.includes(sunSign)) return conflictingNumbers.water.includes(dailyNumber);

    return false;
  }

  private checkCardContradiction(card1: string, card2: string): boolean {
    const oppositePairs = [
      ['The Sun', 'The Moon'],
      ['The Tower', 'The World'],
      ['Death', 'The Empress'],
      ['The Devil', 'The Star']
    ];

    return oppositePairs.some(pair => 
      (pair[0] === card1 && pair[1] === card2) || 
      (pair[1] === card1 && pair[0] === card2)
    );
  }
}
