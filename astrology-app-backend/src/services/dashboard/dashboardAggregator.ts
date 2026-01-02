import { pool } from '../../config/database';
import { logger } from '../../utils/logger';
import { 
  DashboardData, 
  AstrologyWidgetData, 
  NumerologyWidgetData, 
  TarotWidgetData, 
  PalmistryWidgetData,
  DashboardPreferences
} from '../../types/dashboard';

export class DashboardAggregator {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getDashboardData(userId: string): Promise<DashboardData> {
    const cacheKey = `dashboard_${userId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info(`Returning cached dashboard data for user ${userId}`);
      return cached.data;
    }

    logger.info(`Aggregating dashboard data for user ${userId}`);

    try {
      // Fetch user data in parallel
      const [user, profile, preferences] = await Promise.all([
        this.getUserData(userId),
        this.getUserProfile(userId),
        this.getDashboardPreferences(userId)
      ]);

      // Fetch module data in parallel (with error handling)
      const [astrology, numerology, tarot, palmistry] = await Promise.allSettled([
        this.getAstrologyData(userId),
        this.getNumerologyData(userId),
        this.getTarotData(userId),
        this.getPalmistryData(userId)
      ]);

      const dashboardData: DashboardData = {
        user: {
          id: userId,
          name: profile?.full_name || user?.email || 'Seeker',
          email: user?.email || '',
          timezone: profile?.timezone
        },
        date: new Date().toISOString().split('T')[0],
        astrology: astrology.status === 'fulfilled' ? astrology.value : null,
        numerology: numerology.status === 'fulfilled' ? numerology.value : null,
        tarot: tarot.status === 'fulfilled' ? tarot.value : null,
        palmistry: palmistry.status === 'fulfilled' ? palmistry.value : null,
        crossModuleInsights: await this.generateBasicInsights(
          astrology.status === 'fulfilled' ? astrology.value : null,
          numerology.status === 'fulfilled' ? numerology.value : null,
          tarot.status === 'fulfilled' ? tarot.value : null,
          palmistry.status === 'fulfilled' ? palmistry.value : null
        ),
        preferences: preferences
      };

      // Cache the result
      this.cache.set(cacheKey, { data: dashboardData, timestamp: Date.now() });

      return dashboardData;
    } catch (error) {
      logger.error('Error aggregating dashboard data:', error);
      throw error;
    }
  }

  private async getUserData(userId: string) {
    try {
      const result = await pool.query(
        'SELECT id, email, phone FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching user data:', error);
      return null;
    }
  }

  private async getUserProfile(userId: string) {
    try {
      const result = await pool.query(
        'SELECT full_name, timezone FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      return null;
    }
  }

  private async getDashboardPreferences(userId: string): Promise<DashboardPreferences | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM dashboard_preferences WHERE user_id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching dashboard preferences:', error);
      return null;
    }
  }

  private async getAstrologyData(userId: string): Promise<AstrologyWidgetData | null> {
    try {
      // Get user's birth details for sun sign
      const profileResult = await pool.query(
        'SELECT date_of_birth, birth_city FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      if (!profileResult.rows[0]?.date_of_birth) {
        return null;
      }

      const dateOfBirth = new Date(profileResult.rows[0].date_of_birth);
      const sunSign = this.calculateSunSign(dateOfBirth);
      
      // Get most recent reading for this user
      const readingResult = await pool.query(
        `SELECT data, created_at FROM reading_history 
         WHERE user_id = $1 AND type = 'astrology' 
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      // Generate daily horoscope based on sun sign
      const todayHoroscope = this.generateDailyHoroscope(sunSign);
      const moonPhase = this.calculateMoonPhase();
      const dominantPlanet = this.calculateDominantPlanet(sunSign);

      return {
        todayHoroscope,
        moonPhase,
        dominantPlanet,
        sunSign,
        luckyNumber: this.calculateLuckyNumber(dateOfBirth),
        luckyColor: this.getLuckyColor(sunSign)
      };
    } catch (error) {
      logger.error('Error fetching astrology data:', error);
      return null;
    }
  }

  private async getNumerologyData(userId: string): Promise<NumerologyWidgetData | null> {
    try {
      const profileResult = await pool.query(
        'SELECT date_of_birth, full_name FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      if (!profileResult.rows[0]?.date_of_birth) {
        return null;
      }

      const dateOfBirth = new Date(profileResult.rows[0].date_of_birth);
      const dailyNumber = this.calculateDailyNumber(dateOfBirth);
      const lifePathNumber = this.calculateLifePathNumber(dateOfBirth);
      const fullName = profileResult.rows[0].full_name || '';

      return {
        dailyNumber,
        lifePathNumber,
        numerologyMessage: this.generateNumerologyMessage(dailyNumber),
        luckyColor: this.getNumerologyLuckyColor(dailyNumber),
        favorableTime: this.getFavorableTime(dailyNumber)
      };
    } catch (error) {
      logger.error('Error fetching numerology data:', error);
      return null;
    }
  }

  private async getTarotData(userId: string): Promise<TarotWidgetData | null> {
    try {
      // Get most recent tarot reading
      const readingResult = await pool.query(
        `SELECT data, created_at FROM reading_history 
         WHERE user_id = $1 AND type = 'tarot' 
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      // If no recent reading, generate a daily card
      const dailyCard = readingResult.rows[0]?.data?.dailyCard
        ? readingResult.rows[0].data.dailyCard
        : this.generateDailyTarotCard();

      return {
        dailyCard: {
          name: dailyCard.name,
          interpretation: dailyCard.interpretation,
          keywords: dailyCard.keywords
        },
        cardImage: dailyCard.image,
        orientation: dailyCard.orientation || 'upright'
      };
    } catch (error) {
      logger.error('Error fetching tarot data:', error);
      return null;
    }
  }

  private async getPalmistryData(userId: string): Promise<PalmistryWidgetData | null> {
    try {
      // Get user's palm photos
      const photosResult = await pool.query(
        'SELECT * FROM palm_photos WHERE user_id = $1 ORDER BY upload_date DESC',
        [userId]
      );

      if (photosResult.rows.length === 0) {
        return {
          lastReading: null,
          recentPhotosCount: 0
        };
      }

      // Get latest palm analysis
      const latestPhotoId = photosResult.rows[0].id;
      const analysisResult = await pool.query(
        'SELECT * FROM palm_analysis WHERE palm_photo_id = $1',
        [latestPhotoId]
      );

      const analysis = analysisResult.rows[0];

      return {
        lastReading: photosResult.rows[0].upload_date,
        recentPhotosCount: photosResult.rows.length,
        dominantHand: photosResult.rows[0].hand_side,
        handShape: analysis?.hand_shape,
        personalityHighlight: this.extractPersonalityHighlight(analysis)
      };
    } catch (error) {
      logger.error('Error fetching palmistry data:', error);
      return null;
    }
  }

  private async generateBasicInsights(
    astrology: AstrologyWidgetData | null,
    numerology: NumerologyWidgetData | null,
    tarot: TarotWidgetData | null,
    palmistry: PalmistryWidgetData | null
  ) {
    const insights = [];

    // Astrology + Numerology insight
    if (astrology && numerology) {
      const isHarmonious = this.checkAstrologyNumerologyHarmony(
        astrology.sunSign,
        numerology.dailyNumber
      );
      insights.push({
        id: `insight_${Date.now()}_1`,
        title: isHarmonious ? 'Cosmic Harmony' : 'Balancing Energies',
        description: isHarmonious
          ? `Your ${astrology.sunSign} energy aligns beautifully with numerology day ${numerology.dailyNumber}. Embrace this harmonious flow.`
          : `Today's numerology day ${numerology.dailyNumber} may challenge your ${astrology.sunSign} nature. Stay adaptable.`,
        modules: ['astrology', 'numerology'],
        strength: 'medium' as const,
        category: isHarmonious ? 'harmonious' : 'challenging',
        created_at: new Date().toISOString()
      });
    }

    // Tarot + Astrology insight
    if (tarot && astrology) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        title: 'Card of Destiny',
        description: `The ${tarot.dailyCard.name} card complements your ${astrology.sunSign} traits today, ${tarot.orientation === 'upright' ? 'amplifying positive energies.' : 'encouraging introspection.'}`,
        modules: ['tarot', 'astrology'],
        strength: 'high' as const,
        category: 'harmonious',
        created_at: new Date().toISOString()
      });
    }

    // Palmistry + Numerology insight
    if (palmistry && numerology && palmistry.lastReading) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        title: 'Life Path Reflection',
        description: `Your palm reading reveals traits that resonate strongly with life path number ${numerology.lifePathNumber || numerology.dailyNumber}. Trust your innate abilities.`,
        modules: ['palmistry', 'numerology'],
        strength: 'medium' as const,
        category: 'opportunities',
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  // Helper methods for calculations
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

  private calculateMoonPhase(): string {
    const phases = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 
                    'full moon', 'waning gibbous', 'last quarter', 'waning crescent'];
    const now = new Date();
    const index = Math.floor((now.getTime() / (29.53 * 24 * 60 * 60 * 1000)) * 8) % 8;
    return phases[index];
  }

  private calculateDominantPlanet(sunSign: string): string {
    const planetMap: Record<string, string> = {
      'Aries': 'Mars',
      'Taurus': 'Venus',
      'Gemini': 'Mercury',
      'Cancer': 'Moon',
      'Leo': 'Sun',
      'Virgo': 'Mercury',
      'Libra': 'Venus',
      'Scorpio': 'Pluto',
      'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn',
      'Aquarius': 'Uranus',
      'Pisces': 'Neptune'
    };
    return planetMap[sunSign] || 'Sun';
  }

  private calculateLuckyNumber(dateOfBirth: Date): number {
    return ((dateOfBirth.getDate() + dateOfBirth.getMonth() + 1) % 9) + 1;
  }

  private getLuckyColor(sunSign: string): string {
    const colorMap: Record<string, string> = {
      'Aries': '#FF0000',
      'Taurus': '#228B22',
      'Gemini': '#FFFF00',
      'Cancer': '#C0C0C0',
      'Leo': '#FFD700',
      'Virgo': '#8B4513',
      'Libra': '#FF69B4',
      'Scorpio': '#8B0000',
      'Sagittarius': '#9400D3',
      'Capricorn': '#000000',
      'Aquarius': '#00CED1',
      'Pisces': '#87CEEB'
    };
    return colorMap[sunSign] || '#FFD700';
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

  private generateNumerologyMessage(dailyNumber: number): string {
    const messages: Record<number, string> = {
      1: 'A day for new beginnings and leadership. Take initiative on your goals.',
      2: 'Focus on partnerships, diplomacy, and harmony in your relationships.',
      3: 'Express your creativity and communicate openly. Joy is available.',
      4: 'Build solid foundations. Hard work and practicality bring rewards.',
      5: 'Embrace change and adventure. Freedom calls to you today.',
      6: 'Nurture your home and relationships. Balance brings peace.',
      7: 'Seek wisdom through introspection. Trust your inner guidance.',
      8: 'Financial opportunities and professional growth are highlighted.',
      9: 'Complete cycles and let go of what no longer serves you.'
    };
    return messages[dailyNumber] || 'Find harmony in your actions today.';
  }

  private getNumerologyLuckyColor(dailyNumber: number): string {
    const colors: Record<number, string> = {
      1: '#FF0000',
      2: '#FFA500',
      3: '#FFFF00',
      4: '#008000',
      5: '#0000FF',
      6: '#FF1493',
      7: '#9400D3',
      8: '#808080',
      9: '#FFD700'
    };
    return colors[dailyNumber] || '#FFD700';
  }

  private getFavorableTime(dailyNumber: number): string {
    const times: Record<number, string> = {
      1: '6:00 AM - 10:00 AM',
      2: '9:00 AM - 12:00 PM',
      3: '3:00 PM - 6:00 PM',
      4: '10:00 AM - 2:00 PM',
      5: '11:00 AM - 3:00 PM',
      6: '5:00 PM - 8:00 PM',
      7: '7:00 AM - 9:00 AM',
      8: '10:00 AM - 12:00 PM',
      9: '3:00 PM - 5:00 PM'
    };
    return times[dailyNumber] || 'Flexible today';
  }

  private generateDailyHoroscope(sunSign: string): string {
    const horoscopes: Record<string, string> = {
      'Aries': 'Your energy is high today. Take action on your most important goals.',
      'Taurus': 'Stability is your strength. Focus on building lasting foundations.',
      'Gemini': 'Communication flows easily. Share your ideas with others.',
      'Cancer': 'Your intuition is heightened. Trust your feelings in relationships.',
      'Leo': 'Step into the spotlight naturally. Your charisma is magnetic.',
      'Virgo': 'Attention to detail pays off. Organize and plan effectively.',
      'Libra': 'Balance is key. Seek harmony in all your interactions.',
      'Scorpio': 'Your insight is profound. Trust your transformative power.',
      'Sagittarius': 'Expand your horizons. Adventure and learning await.',
      'Capricorn': 'Ambition drives you. Patient effort brings success.',
      'Aquarius': 'Innovation is your gift. Think outside conventional bounds.',
      'Pisces': 'Dreams inspire you. Channel creativity into meaningful pursuits.'
    };
    return horoscopes[sunSign] || 'Embrace the cosmic energies of the day.';
  }

  private generateDailyTarotCard() {
    const cards = [
      { name: 'The Magician', interpretation: 'You have all the tools you need. Take action and manifest your desires.', keywords: ['power', 'action', 'potential'] },
      { name: 'The High Priestess', interpretation: 'Trust your intuition. Hidden knowledge is available to you.', keywords: ['intuition', 'mystery', 'wisdom'] },
      { name: 'The Empress', interpretation: 'Abundance and creativity surround you. Nurturing brings growth.', keywords: ['abundance', 'creativity', 'fertility'] },
      { name: 'The Emperor', interpretation: 'Structure and authority guide you. Establish order and stability.', keywords: ['authority', 'structure', 'control'] },
      { name: 'The Chariot', interpretation: 'Willpower and determination lead to victory. Move forward with confidence.', keywords: ['willpower', 'victory', 'determination'] },
      { name: 'The Sun', interpretation: 'Joy and success illuminate your path. Optimism brings rewards.', keywords: ['joy', 'success', 'positivity'] },
      { name: 'The Moon', interpretation: 'Illusions may confuse. Trust your inner wisdom through uncertainty.', keywords: ['illusion', 'intuition', 'subconscious'] },
      { name: 'The Star', interpretation: 'Hope and inspiration guide you. Your dreams are within reach.', keywords: ['hope', 'inspiration', 'renewal'] }
    ];

    const today = new Date();
    const index = (today.getDate() + today.getMonth()) % cards.length;
    const card = cards[index];

    return {
      ...card,
      orientation: Math.random() > 0.7 ? 'reversed' : 'upright'
    };
  }

  private extractPersonalityHighlight(analysis: any): string | undefined {
    if (!analysis) return undefined;
    // Extract key personality trait from palm analysis
    return analysis.signs_data?.find((s: any) => s.type === 'star')?.meaning || 
           'Your palm reveals unique strengths and capabilities.';
  }

  private checkAstrologyNumerologyHarmony(sunSign: string, dailyNumber: number): boolean {
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

  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(`dashboard_${userId}`);
      logger.info(`Cleared dashboard cache for user ${userId}`);
    } else {
      this.cache.clear();
      logger.info('Cleared all dashboard cache');
    }
  }
}
