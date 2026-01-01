/**
 * Ephemeris Service using Swiss Ephemeris
 * Provides planet position calculations and celestial body data
 */

import swisseph from 'swisseph';
import { logger } from '../../utils/logger';
import Decimal from 'decimal.js';
import {
  PlanetId,
  AyanamsaSystem,
  ZodiacSigns
} from './astrologyConstants';

export interface EphemerisPosition {
  planet: string;
  longitude: number; // in degrees (0-360)
  latitude: number; // in degrees
  speed: number; // daily motion in degrees
  distance: number; // distance in AU
  retrograde: boolean;
  degrees: number; // degree within sign (0-30)
  sign: string;
  signIndex: number; // 0-11
  minutes: number;
  seconds: number;
}

export interface JulianDate {
  jd: number;
  jdUt: number;
  deltaT: number;
  zodiacIndex: number; // 0 = Aries
}

export class EphemerisService {
  private initialized = false;
  private ayanamsa: number = 0; // in degrees
  private ayanamsaSystem: AyanamsaSystem = AyanamsaSystem.LAHIRI;
  private ephePath: string;

  constructor() {
    // Set ephemeris data path
    this.ephePath = process.env.EPHE_PATH || './ephe';
  }

  /**
   * Initialize Swiss Ephemeris library
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Set ephemeris path
      swisseph.swe_set_ephe_path(this.ephePath);
      
      // Verify version
      const version = swisseph.version;
      logger.info(`Swiss Ephemeris initialized, version: ${version}`);
      
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize Swiss Ephemeris:', error);
      throw new Error('Swiss Ephemeris initialization failed');
    }
  }

  /**
   * Calculate Julian Date from UTC date/time
   */
  calculateJulianDate(date: Date): JulianDate {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();

    const jd = swisseph.swe_julday(year, month, day, hour + minute / 60 + second / 3600, swisseph.SE_GREG_CAL);
    const deltaT = swisseph.swe_deltat_ex(jd, swisseph.SEFLG_SWIEPH).deltaT;
    const jdUt = jd - deltaT / 86400;

    return {
      jd,
      jdUt,
      deltaT,
      zodiacIndex: 0
    };
  }

  /**
   * Calculate Ayanamsa (precession) for a given date
   */
  calculateAyanamsa(jd: number, system: AyanamsaSystem = AyanamsaSystem.LAHIRI): number {
    let ayanamsa = 0;

    // Convert to Swiss Ephemeris format
    const year = new Date(Date.now()).getFullYear();
    const month = 1;
    const day = 1;
    const hour = 0;

    switch (system) {
      case AyanamsaSystem.LAHIRI:
        ayanamsa = swisseph.swe_get_ayanamsa_ex(jd, swisseph.SEFLG_SWIEPH).ayanamsa;
        break;
      case AyanamsaSystem.RAMAN:
        // Raman: Lahiri - 1°
        ayanamsa = swisseph.swe_get_ayanamsa_ex(jd, swisseph.SEFLG_SWIEPH).ayanamsa - 1.0;
        break;
      case AyanamsaSystem.KRISHNAMURTI:
        // Krishnamurti: Lahiri - 6 minutes
        ayanamsa = swisseph.swe_get_ayanamsa_ex(jd, swisseph.SEFLG_SWIEPH).ayanamsa - 0.1;
        break;
      case AyanamsaSystem.FAGAN_BRADLEY:
        // Fagan-Bradley: Slightly different from Lahiri
        ayanamsa = swisseph.swe_get_ayanamsa_ex(jd, swisseph.SEFLG_SWIEPH).ayanamsa - 0.2;
        break;
      case AyanamsaSystem.YUKTESHWAR:
        // Yukteshwar: Custom calculation
        ayanamsa = swisseph.swe_get_ayanamsa_ex(jd, swisseph.SEFLG_SWIEPH).ayanamsa - 0.3;
        break;
      default:
        ayanamsa = swisseph.swe_get_ayanamsa_ex(jd, swisseph.SEFLG_SWIEPH).ayanamsa;
    }

    return ayanamsa;
  }

  /**
   * Calculate planet position
   */
  async calculatePlanetPosition(
    planetId: PlanetId,
    jd: number,
    ayanamsa: number,
    planetName: string
  ): Promise<EphemerisPosition> {
    if (!this.initialized) {
      await this.initialize();
    }

    const flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH;
    
    try {
      const result = swisseph.swe_calc_ut(jd, planetId, flag);
      
      if (result.error) {
        throw new Error(`Error calculating position for ${planetName}: ${result.error}`);
      }

      let longitude = result.longitude;
      const latitude = result.latitude;
      const speed = result.speed;
      const distance = result.distance;

      // Check retrograde
      const retrograde = speed < 0;

      // Apply Ayanamsa for sidereal zodiac
      longitude = this.normalizeLongitude(longitude - ayanamsa);

      // Calculate sign and degrees
      const signIndex = Math.floor(longitude / 30);
      const degreesInSign = longitude - (signIndex * 30);
      const degrees = Math.floor(degreesInSign);
      const minutes = Math.floor((degreesInSign - degrees) * 60);
      const seconds = Math.round(((degreesInSign - degrees) * 60 - minutes) * 60 * 100) / 100;

      return {
        planet: planetName,
        longitude: this.roundToPrecision(longitude, 6),
        latitude: this.roundToPrecision(latitude, 6),
        speed: this.roundToPrecision(speed, 6),
        distance: this.roundToPrecision(distance, 6),
        retrograde,
        degrees: this.roundToPrecision(degreesInSign, 6),
        sign: ZodiacSigns[signIndex] || 'Aries',
        signIndex,
        minutes,
        seconds
      };
    } catch (error) {
      logger.error(`Error calculating position for ${planetName}:`, error);
      throw error;
    }
  }

  /**
   * Calculate time difference between two dates in years
   */
  calculateTimeDifferenceYears(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 365.2425);
  }

  /**
   * Normalize longitude to 0-360 range
   */
  normalizeLongitude(longitude: number): number {
    let normalized = longitude % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  }

  /**
   * Round to specified precision
   */
  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  /**
   * Check if ephemeris files are available
   */
  checkEphemerisFiles(): boolean {
    try {
      // Try calculating Sun position for current date
      const jd = this.calculateJulianDate(new Date()).jd;
      swisseph.swe_calc_ut(jd, PlanetId.SUN, swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH);
      return true;
    } catch (error) {
      logger.warn('Ephemeris files not found or corrupted');
      return false;
    }
  }
}

export default new EphemerisService();