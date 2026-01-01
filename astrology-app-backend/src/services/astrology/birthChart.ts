/**
 * Birth Chart Calculation Service
 * Handles complete birth chart calculations including ascendant, planets, houses
 */

import { EphemerisService, EphemerisPosition, JulianDate } from './ephemeris';
import {
  PlanetId,
  AyanamsaSystem,
  ZodiacSigns,
  PlanetDetails,
  ExaltationDegrees,
  DebilitationDegrees,
  NaturalBenefics,
  NaturalMalefics
} from './astrologyConstants';
import Decimal from 'decimal.js';

export interface BirthData {
  date: Date;
  timezone: string;
  latitude: number;
  longitude: number;
  ayanamsaSystem?: AyanamsaSystem;
}

export interface BirthChart {
  birthData: BirthData;
  julianDate: JulianDate;
  ayanamsa: number;
  ayanamsaSystem: AyanamsaSystem;
  ascendant: AscendantInfo;
  planets: { [key: string]: PlanetPosition };
  houses: HouseInfo[];
  lunar: LunarInfo;
  nakshatra: string;
  errors?: string[];
}

export interface AscendantInfo {
  sign: string;
  signIndex: number;
  degree: number;
  minutes: number;
  seconds: number;
  nakshatra: string;
  nakshatraPada: number;
  cuspDegrees: { [key: number]: number }; // House cusp degrees (1-12)
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  signIndex: number;
  degree: number;
  minutes: number;
  seconds: number;
  house: number;
  isRetrograde: boolean;
  isExalted: boolean;
  isDebilitated: boolean;
  isBenefic: boolean;
  isMalefic: boolean;
  distanceAU: number;
  dispositor: string;
  nakshatra: string;
  nakshatraPada: number;
}

export interface HouseInfo {
  house: number;
  cusp: number; // House cusp degree in 0-360
  sign: string;
  signIndex: number;
  degreesInSign: number;
  planets: string[];
  meaning: string;
  ruler: string;
}

export interface LunarInfo {
  tithi: string;
  tithiNumber: number;
  paksha: string; // Shukla or Krishna
  karana: string;
  yoga: string;
}

export class BirthChartService {
  private ephemerisService: EphemerisService;

  constructor(ephemerisService: EphemerisService) {
    this.ephemerisService = ephemerisService;
  }

  /**
   * Calculate complete birth chart
   */
  async calculateBirthChart(birthData: BirthData): Promise<BirthChart> {
    try {
      // Validate birth data
      if (!this.validateBirthData(birthData)) {
        throw new Error('Invalid birth data provided');
      }

      // Calculate Julian Date
      const jd = this.ephemerisService.calculateJulianDate(birthData.date);

      // Calculate Ayanamsa
      const ayanamsaSystem = birthData.ayanamsaSystem || AyanamsaSystem.LAHIRI;
      const ayanamsa = this.ephemerisService.calculateAyanamsa(jd.jd, ayanamsaSystem);

      // Calculate all planets
      const planets = await this.calculateAllPlanets(jd.jd, ayanamsa);

      // Calculate Ascendant
      const ascendant = await this.calculateAscendant(jd.jd, birthData.latitude, birthData.longitude, ayanamsa);

      // Calculate houses
      const houses = this.calculateHouses(ascendant);

      // Place planets in houses
      const planetsWithHouses = this.placePlanetsInHouses(planets, houses);

      // Calculate lunar data
      const lunarData = this.calculateLunarData(planets.moon, planets.sun);

      // Calculate nakshatra
      const nakshatra = this.calculateNakshatra(ascendant.cuspDegrees[1]);

      // Compile complete chart
      const chart: BirthChart = {
        birthData,
        julianDate: jd,
        ayanamsa,
        ayanamsaSystem,
        ascendant,
        planets: planetsWithHouses,
        houses,
        lunar: lunarData,
        nakshatra,
        errors: []
      };

      // Add interpretations
      this.addInterpretations(chart);

      return chart;

    } catch (error) {
      console.error('Error calculating birth chart:', error);
      throw error;
    }
  }

  /**
   * Validate birth data
   */
  private validateBirthData(birthData: BirthData): boolean {
    if (!birthData.date || !(birthData.date instanceof Date)) {
      throw new Error('Invalid date format');
    }
    if (Math.abs(birthData.latitude) > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (Math.abs(birthData.longitude) > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    return true;
  }

  /**
   * Calculate all planets
   */
  private async calculateAllPlanets(jd: number, ayanamsa: number): Promise<{ [key: string]: any }> {
    const planets: { [key: string]: any } = {};

    const planetIds = [
      { id: PlanetId.SUN, name: 'sun' },
      { id: PlanetId.MOON, name: 'moon' },
      { id: PlanetId.MERCURY, name: 'mercury' },
      { id: PlanetId.VENUS, name: 'venus' },
      { id: PlanetId.MARS, name: 'mars' },
      { id: PlanetId.JUPITER, name: 'jupiter' },
      { id: PlanetId.SATURN, name: 'saturn' },
      { id: PlanetId.RAHU, name: 'rahu' }
    ];

    // Calculate main planets
    for (const planet of planetIds) {
      const position = await this.ephemerisService.calculatePlanetPosition(
        planet.id,
        jd,
        ayanamsa,
        planet.name
      );

      planets[planet.name] = {
        ...position,
        house: 0, // Will be updated later
        dispositor: '', // Will be calculated later
        nakshatra: this.calculateNakshatra(position.longitude).name,
        nakshatraPada: this.calculateNakshatra(position.longitude).pada,
        isExalted: this.checkExaltation(planet.name, position.longitude),
        isDebilitated: this.checkDebilitation(planet.name, position.longitude),
        isBenefic: this.checkBenefic(planet.name, position.signIndex),
        isMalefic: this.checkMalefic(planet.name, position.signIndex),
        isRetrograde: position.retrograde
      };
    }

    // Calculate Ketu (opposite Rahu)
    const rahuLongitude = planets.rahu.longitude;
    const ketuLongitude = this.ephemerisService.normalizeLongitude(rahuLongitude + 180);
    const ketuSignIndex = Math.floor(ketuLongitude / 30);
    const ketuDegreesInSign = ketuLongitude - (ketuSignIndex * 30);

    const moonSpeed = planets.moon.speed;
    const isKetuRetrograde = moonSpeed > 0; // Ketu moves opposite to Moon

    // Calculate Ketu position
    const ketu = await this.ephemerisService.calculatePlanetPosition(
      PlanetId.RAHU, // Reuse Rahu calculation
      jd,
      ayanamsa - 180, // Offset by 180 degrees
      'ketu'
    );

    // Manual override for Ketu
    planets.ketu = {
      name: 'ketu',
      longitude: this.ephemerisService.roundToPrecision(ketuLongitude, 6),
      sign: ZodiacSigns[ketuSignIndex] || 'Aries',
      signIndex: ketuSignIndex,
      degree: Math.floor(ketuDegreesInSign),
      minutes: Math.floor((ketuDegreesInSign - Math.floor(ketuDegreesInSign)) * 60),
      seconds: Math.round(((ketuDegreesInSign - Math.floor(ketuDegreesInSign)) * 60 - Math.floor((ketuDegreesInSign - Math.floor(ketuDegreesInSign)) * 60)) * 60 * 100) / 100,
      house: 0, // Will be updated later
      isRetrograde: isKetuRetrograde,
      isExalted: this.checkExaltation('ketu', ketuLongitude),
      isDebilitated: this.checkDebilitation('ketu', ketuLongitude),
      isBenefic: this.checkBenefic('ketu', ketuSignIndex),
      isMalefic: this.checkMalefic('ketu', ketuSignIndex),
      distanceAU: planets.rahu.distanceAU || 0,
      speed: planets.moon.speed || 0,
      dispositor: '', // Will be calculated later
      nakshatra: this.calculateNakshatra(ketuLongitude).name,
      nakshatraPada: this.calculateNakshatra(ketuLongitude).pada
    };

    return planets;
  }

  /**
   * Calculate ascendant house cusps
   */
  private async calculateAscendant(
    jd: number,
    latitude: number,
    longitude: number,
    ayanamsa: number
  ): Promise<AscendantInfo> {
    const hsys = 'P'; // Placidus house system
    const serr = { error: '' };

    // Convert longitude to hours (for houses)
    const ut = jd - Math.floor(jd); // UT fraction of day

    try {
      // Calculate houses using Swiss Ephemeris
      const houses = swisseph.swe_houses_ex(jd, swisseph.SEFLG_SPEED, latitude, longitude, hsys);

      if (houses.error) {
        throw new Error(`Error calculating houses: ${houses.error}`);
      }

      // Ascendant is first house cusp
      const ascendantLong = this.ephemerisService.normalizeLongitude(houses.ascendant - ayanamsa);
      const signIndex = Math.floor(ascendantLong / 30);
      const degreesInSign = ascendantLong - (signIndex * 30);

      const nakshatraData = this.calculateNakshatra(ascendantLong);

      // House cusps
      const cuspDegrees: { [key: number]: number } = {};
      for (let i = 1; i <= 12; i++) {
        if (houses.house && houses.house[i - 1] !== undefined) {
          cuspDegrees[i] = this.ephemerisService.normalizeLongitude(houses.house[i - 1] - ayanamsa);
        } else {
          // Fallback calculation (equal houses)
          cuspDegrees[i] = this.ephemerisService.normalizeLongitude(ascendantLong + ((i - 1) * 30));
        }
      }

      return {
        sign: ZodiacSigns[signIndex] || 'Aries',
        signIndex,
        degree: Math.floor(degreesInSign),
        minutes: Math.floor((degreesInSign - Math.floor(degreesInSign)) * 60),
        seconds: Math.round(((degreesInSign - Math.floor(degreesInSign)) * 60 - Math.floor((degreesInSign - Math.floor(degreesInSign)) * 60)) * 60 * 100) / 100,
        nakshatra: nakshatraData.name,
        nakshatraPada: nakshatraData.pada,
        cuspDegrees
      };

    } catch (error) {
      console.error('Error calculating ascendant:', error);
      // Fallback with equal houses
      return this.calculateEqualHouseAscendant(jd, latitude, longitude, ayanamsa);
    }
  }

  /**
   * Fallback ascendant calculation using equal houses
   */
  private calculateEqualHouseAscendant(
    jd: number,
    latitude: number,
    longitude: number,
    ayanamsa: number
  ): AscendantInfo {
    console.warn('Using fallback ascendant calculation');

    // Simplified ascendant calculation
    const baseLong = (jd * 360 / 365.2422) % 360;
    const ascendantLong = this.ephemerisService.normalizeLongitude(baseLong - longitude / 360 * 30);

    const signIndex = Math.floor(ascendantLong / 30);
    const degreesInSign = ascendantLong - (signIndex * 30);

    const nakshatraData = this.calculateNakshatra(ascendantLong);

    // Equal house cusps
    const cuspDegrees: { [key: number]: number } = {};
    for (let i = 1; i <= 12; i++) {
      cuspDegrees[i] = this.ephemerisService.normalizeLongitude(ascendantLong + ((i - 1) * 30));
    }

    return {
      sign: ZodiacSigns[signIndex] || 'Aries',
      signIndex,
      degree: Math.floor(degreesInSign),
      minutes: Math.floor((degreesInSign - Math.floor(degreesInSign)) * 60),
      seconds: Math.round(((degreesInSign - Math.floor(degreesInSign)) * 60 - Math.floor((degreesInSign - Math.floor(degreesInSign)) * 60)) * 60 * 100) / 100,
      nakshatra: nakshatraData.name,
      nakshatraPada: nakshatraData.pada,
      cuspDegrees
    };
  }

  /**
   * Calculate houses
   */
  private calculateHouses(ascendant: AscendantInfo): HouseInfo[] {
    const houses: HouseInfo[] = [];

    for (let i = 1; i <= 12; i++) {
      const cuspDegree = ascendant.cuspDegrees[i] || 0;
      const signIndex = Math.floor(cuspDegree / 30);
      const degreesInSign = cuspDegree - (signIndex * 30);

      houses.push({
        house: i,
        cusp: this.ephemerisService.roundToPrecision(cuspDegree, 6),
        sign: ZodiacSigns[signIndex] || 'Aries',
        signIndex,
        degreesInSign: this.ephemerisService.roundToPrecision(degreesInSign, 6),
        planets: [], // Will be populated later
        meaning: this.getHouseMeaning(i),
        ruler: PlanetDetails[ZodiacSigns[signIndex]?.toLowerCase() || 'aries']?.name || 'Mars'
      });
    }

    return houses;
  }

  /**
   * Place planets in houses
   */
  private placePlanetsInHouses(planets: { [key: string]: any }, houses: HouseInfo[]): { [key: string]: PlanetPosition } {
    const planetNames = Object.keys(planets);

    for (const house of houses) {
      const houseStart = house.cusp;
      const houseEnd = houses[house.house % 12]?.cusp || 360;

      for (const planetName of planetNames) {
        const planet = planets[planetName];
        let planetDegree = planet.longitude;

        // Handle 360-degree wraparound
        if (houseStart > houseEnd) {
          if (planetDegree >= houseStart || planetDegree < houseEnd) {
            planet.house = house.house;
            house.planets.push(planetName);
          }
        } else {
          if (planetDegree >= houseStart && planetDegree < houseEnd) {
            planet.house = house.house;
            house.planets.push(planetName);
          }
        }
      }
    }

    // Add dispositor relationships
    for (const planetName of planetNames) {
      const planet = planets[planetName];
      const signRuler = PlanetDetails[planet.sign.toLowerCase()]?.name?.toLowerCase() || 'mars';
      planet.dispositor = signRuler;
    }

    return planets;
  }

  /**
   * Calculate nakshatra
   */
  private calculateNakshatra(longitude: number): { name: string; pada: number } {
    const nakshatraLength = 360 / 27; // 13.333... degrees per nakshatra
    const nakshatraIndex = Math.floor(longitude / nakshatraLength);
    const pada = Math.floor((longitude - (nakshatraIndex * nakshatraLength)) / (nakshatraLength / 4)) + 1;

    return {
      name: (
        ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
          'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
          'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
          'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
          'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'][nakshatraIndex]
      ),
      pada
    };
  }

  /**
   * Calculate lunar data (tithi, paksha, karana, yoga)
   */
  private calculateLunarData(moon: any, sun: any): LunarInfo {
    const moonLong = moon.longitude;
    const sunLong = sun.longitude;

    // Tithi calculation
    const tithiAngle = (moonLong - sunLong + 360) % 360;
    const tithiNumber = Math.floor(tithiAngle / 12) + 1;
    const paksha = tithiNumber > 15 ? 'Krishna' : 'Shukla';
    const adjustedTithi = tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;

    // Tithi name
    const tithiNames = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
      'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
      'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
    ];

    // Karana (half-tithi)
    const karanaIndex = Math.floor(((tithiAngle % 12) * 2) / 12);
    const karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
    const karana = karanas[karanaIndex];

    // Yoga (Sun-Moon combination)
    const yogaAngle = (moonLong + sunLong) % 360;
    const yogaIndex = Math.floor(yogaAngle / 13.333);
    const yogas = [
      'Vishkambha', 'Prithi', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
      'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
      'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
      'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
      'Brahma', 'Indra', 'Vaidhriti'
    ];
    const yoga = yogas[yogaIndex];

    return {
      tithi: `${tithiNames[adjustedTithi - 1] || 'Pratipada'}`,
      tithiNumber: adjustedTithi,
      paksha,
      karana,
      yoga
    };
  }

  /**
   * Check exaltation
   */
  private checkExaltation(planet: string, longitude: number): boolean {
    const exaltationDegree = ExaltationDegrees[planet];
    if (!exaltationDegree) return false;

    // Check if within orb (±5 degrees)
    const diff = Math.abs(longitude - exaltationDegree);
    return diff <= 5;
  }

  /**
   * Check debilitation
   */
  private checkDebilitation(planet: string, longitude: number): boolean {
    const debilitationDegree = DebilitationDegrees[planet];
    if (!debilitationDegree) return false;

    // Check if within orb (±5 degrees)
    const diff = Math.abs(longitude - debilitationDegree);
    return diff <= 5;
  }

  /**
   * Check if benefic
   */
  private checkBenefic(planet: string, signIndex: number): boolean {
    if (NaturalBenefics.includes(planet)) {
      return true;
    }

    // Temporal benefic based on house lordship
    const friendlySigns: { [key: string]: number[] } = {
      sun: [0, 4, 5, 6, 9, 10], // Aries, Leo, Sagittarius, Capricorn
      moon: [1, 2, 4, 5, 7, 9],  // Taurus, Cancer, Leo, Libra, Sagittarius
      mars: [0, 3, 4, 7, 8, 10], // Aries, Cancer, Scorpio, Capricorn
      jupiter: [0, 2, 4, 5, 8, 9], // Aries, Gemini, Leo, Scorpio, Sagittarius
      venus: [1, 2, 3, 5, 6, 9]    // Taurus, Gemini, Virgo, Libra, Sagittarius
    };

    const planetFriendly = friendlySigns[planet] || [];
    return planetFriendly.includes(signIndex);
  }

  /**
   * Check if malefic
   */
  private checkMalefic(planet: string, signIndex: number): boolean {
    if (NaturalMalefics.includes(planet)) {
      return true;
    }
    return false;
  }

  /**
   * Add interpretations to chart
   */
  private addInterpretations(chart: BirthChart): void {
    // Add description for ascendant
    chart.ascendant['description'] = `${chart.ascendant.sign} ascendant at ${chart.ascendant.degree}°${chart.ascendant.minutes}'${chart.ascendant.seconds}"`;

    // Add interpretations for planets
    for (const planetKey of Object.keys(chart.planets)) {
      const planet = chart.planets[planetKey];
      planet.interpretation = this.getPlanetInterpretation(planetKey, planet);
    }
  }

  /**
   * Get house meaning
   */
  private getHouseMeaning(house: number): string {
    const meanings = [
      'Self, Body, Personality',
      'Wealth, Family, Speech',
      'Siblings, Courage,
Skills',
      'Home, Mother, Happiness',
      'Children, Creativity, Intelligence',
      'Health, Enemies, Debts',
      'Marriage, Partnerships, Spouse',
      'Longevity, Death, Transformation',
      'Fortune, Father, Long Journeys',
      'Career, Profession, Reputation',
      'Gains, Income, Friends',
      'Losses, Expenses, Spirituality'
    ];
    return meanings[house - 1] || '';
  }

  /**
   * Get planet interpretation
   */
  private getPlanetInterpretation(planetName: string, planet: PlanetPosition): string {
    const traits: { [key: string]: string } = {
      sun: 'Self, authority, leadership, vitality',
      moon: 'Emotions, mind, mother, comfort',
      mars: 'Energy, courage, action, siblings',
      mercury: 'Intellect, communication, business',
      jupiter: 'Wisdom, wealth, children, growth',
      venus: 'Love, relationships, luxury, spouse',
      saturn: 'Discipline, responsibility, longevity',
      rahu: 'Ambition, materialism, foreign',
      ketu: 'Spirituality, detachment, moksha'
    };

    const strengths = [];
    if (planet.isExalted) strengths.push('exalted');
    if (planet.isDebilitated) strengths.push('debilitated');
    if (planet.isRetrograde) strengths.push('retrograde');
    if (planet.isBenefic) strengths.push('benefic');
    if (planet.isMalefic) strengths.push('malefic');

    return `${planetName} in ${planet.sign} (House ${planet.house}) - ${traits[planetName] || 'Planetary influence'}. ${strengths.length > 0 ? '(' + strengths.join(', ') + ')' : ''}`;
  }
}

export default BirthChartService;