/**
 * Divisional Charts (Varga) Calculation Service
 * Calculates various divisional charts for detailed analysis
 */

import { BirthChart } from './birthChart';
import { DivisionalChartType, DivisionalChartTypes } from './astrologyConstants';

export interface DivisionalChart {
  chartType: DivisionalChartType;
  division: number;
  planets: { [key: string]: DivisionalPlanet };
  ascendant: DivisionalAscendant;
  interpretation?: string;
}

export interface DivisionalPlanet {
  name: string;
  sign: string;
  signIndex: number;
  degree: number;
  house: number;
  originalPosition?: {
    sign: string;
    degree: number;
    house: number;
  };
}

export interface DivisionalAscendant {
  sign: string;
  signIndex: number;
  degree: number;
}

export class DivisionalChartsService {
  /**
   * Calculate divisional chart
   */
  calculateDivisionalChart(
    birthChart: BirthChart,
    chartType: DivisionalChartType
  ): DivisionalChart {
    const division = DivisionalChartTypes[chartType];

    // Calculate D1 (main chart) - return as is
    if (chartType === 'D1') {
      return this.createD1Chart(birthChart);
    }

    // Calculate other divisional charts
    const planets: { [key: string]: DivisionalPlanet } = {};
    const ascendant = this.calculateDivisionalAscendant(birthChart, division);

    // Calculate each planet's position in divisional chart
    for (const [planetName, planet] of Object.entries(birthChart.planets)) {
      planets[planetName] = this.calculateDivisionalPlanet(
        planet.longitude,
        planet.signIndex,
        division,
        planetName,
        planet.house
      );
    }

    // Add interpretation
    const interpretation = this.getInterpretation(chartType, planets, ascendant);

    return {
      chartType,
      division,
      planets,
      ascendant,
      interpretation
    };
  }

  /**
   * Create D1 chart (main birth chart)
   */
  private createD1Chart(birthChart: BirthChart): DivisionalChart {
    const planets: { [key: string]: DivisionalPlanet } = {};
    
    for (const [planetName, planet] of Object.entries(birthChart.planets)) {
      planets[planetName] = {
        name: planetName,
        sign: planet.sign,
        signIndex: planet.signIndex,
        degree: planet.degree,
        house: planet.house
      };
    }

    return {
      chartType: 'D1',
      division: 1,
      planets,
      ascendant: {
        sign: birthChart.ascendant.sign,
        signIndex: birthChart.ascendant.signIndex,
        degree: birthChart.ascendant.degree
      }
    };
  }

  /**
   * Calculate divisional planet position
   */
  private calculateDivisionalPlanet(
    longitude: number,
    originalSignIndex: number,
    division: number,
    planetName: string,
    originalHouse: number
  ): DivisionalPlanet {
    // Calculate degrees within sign (0-30)
    const degreesInSign = (longitude % 30);
    
    // Calculate the position in divisional chart
    // Each sign is divided into 'division' parts
    const divisionPart = (degreesInSign * division) / 30;
    const divisionIndex = Math.floor(divisionPart);
    
    // Calculate the new sign
    // The formula varies based on division type
    let newSignIndex: number;
    
    if (division === 9) { // Navamsa (D9)
      // Special logic for Navamsa
      const signCycles = Math.floor(originalSignIndex / 3); // 0, 1, 2, 3
      const startSign = (signCycles * 3 + divisionIndex) % 12;
      newSignIndex = startSign;
    } else if (division === 10) { // Dashamsa (D10)
      // Special logic for Dashamsa
      const zodiacType = originalSignIndex % 2; // 0 = odd, 1 = even
      if (zodiacType === 0) { // Odd sign
        newSignIndex = divisionIndex;
      } else { // Even sign
        newSignIndex = (divisionIndex + 9) % 12;
      }
    } else if (division === 12) { // Dwadashamsa (D12)
      newSignIndex = divisionIndex;
    } else if (division === 30) { // Trimsamsa (D30)
      // Complex logic based on degree ranges
      const degreeParts = [
        { min: 0, max: 5, sign: (originalSignIndex + 8) % 12 },
        { min: 5, max: 10, sign: (originalSignIndex + 4) % 12 },
        { min: 10, max: 18, sign: originalSignIndex },
        { min: 18, max: 25, sign: (originalSignIndex + 6) % 12 },
        { min: 25, max: 30, sign: (originalSignIndex + 2) % 12 }
      ];
      
      const part = degreeParts.find(p => degreesInSign >= p.min && degreesInSign < p.max);
      newSignIndex = part ? part.sign : originalSignIndex;
    } else if (division === 60) { // Shashtiyamsa (D60)
      newSignIndex = divisionIndex % 12;
    } else {
      // General formula for most divisional charts
      newSignIndex = (originalSignIndex + divisionIndex) % 12;
    }

    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    return {
      name: planetName,
      sign: zodiacSigns[newSignIndex],
      signIndex: newSignIndex,
      degree: this.roundToPrecision(degreesInSign, 2),
      house: 0, // Will be calculated based on ascendant
      originalPosition: {
        sign: planet.sign,
        degree: planet.degree,
        house: originalHouse
      }
    };
  }

  /**
   * Calculate divisional ascendant
   */
  private calculateDivisionalAscendant(
    birthChart: BirthChart,
    division: number
  ): DivisionalAscendant {
    const ascendantLong = birthChart.ascendant.cuspDegrees[1]; // First house cusp
    const ascendantSignIndex = Math.floor(ascendantLong / 30);
    const degreesInSign = ascendantLong % 30;
    
    const divisionPart = (degreesInSign * division) / 30;
    const divisionIndex = Math.floor(divisionPart);
    
    let newSignIndex: number;
    
    if (division === 9) { // Navamsa
      const signCycles = Math.floor(ascendantSignIndex / 3);
      const startSign = (signCycles * 3 + divisionIndex) % 12;
      newSignIndex = startSign;
    } else if (division === 10) { // Dashamsa
      const zodiacType = ascendantSignIndex % 2;
      if (zodiacType === 0) {
        newSignIndex = divisionIndex;
      } else {
        newSignIndex = (divisionIndex + 9) % 12;
      }
    } else if (division === 12) { // Dwadashamsa
      newSignIndex = divisionIndex;
    } else if (division === 30) { // Trimsamsa
      const degreeParts = [
        { min: 0, max: 5, sign: (ascendantSignIndex + 8) % 12 },
        { min: 5, max: 10, sign: (ascendantSignIndex + 4) % 12 },
        { min: 10, max: 18, sign: ascendantSignIndex },
        { min: 18, max: 25, sign: (ascendantSignIndex + 6) % 12 },
        { min: 25, max: 30, sign: (ascendantSignIndex + 2) % 12 }
      ];
      
      const part = degreeParts.find(p => degreesInSign >= p.min && degreesInSign < p.max);
      newSignIndex = part ? part.sign : ascendantSignIndex;
    } else if (division === 60) { // Shashtiyamsa
      newSignIndex = divisionIndex % 12;
    } else {
      newSignIndex = (ascendantSignIndex + divisionIndex) % 12;
    }

    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    return {
      sign: zodiacSigns[newSignIndex],
      signIndex: newSignIndex,
      degree: this.roundToPrecision(degreesInSign, 2)
    };
  }

  /**
   * Get chart interpretation
   */
  private getInterpretation(
    chartType: DivisionalChartType,
    planets: { [key: string]: DivisionalPlanet },
    ascendant: DivisionalAscendant
  ): string {
    const interpretations: Record<DivisionalChartType, string> = {
      D1: 'Main birth chart - all aspects of life',
      D9: 'Navamsa chart - marriage, dharma, and spouse character',
      D10: 'Dashamsa chart - career, profession, and public status',
      D12: 'Dwadashamsa chart - parents, lineage, and family',
      D30: 'Trimsamsa chart - misfortunes, diseases, and challenges',
      D60: 'Shashtiyamsa chart - detailed life events and past life karma'
    };

    return interpretations[chartType] || 'Divisional chart analysis';
  }

  /**
   * Calculate all divisional charts
   */
  calculateAllDivisionalCharts(birthChart: BirthChart): Record<DivisionalChartType, DivisionalChart> {
    const charts: Record<DivisionalChartType, DivisionalChart> = {
      D1: this.calculateDivisionalChart(birthChart, 'D1'),
      D9: this.calculateDivisionalChart(birthChart, 'D9'),
      D10: this.calculateDivisionalChart(birthChart, 'D10'),
      D12: this.calculateDivisionalChart(birthChart, 'D12'),
      D30: this.calculateDivisionalChart(birthChart, 'D30'),
      D60: this.calculateDivisionalChart(birthChart, 'D60')
    };

    return charts;
  }

  /**
   * Util: round to precision
   */
  private roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }
}

export default DivisionalChartsService;