import { calculateBirthChart, calculateDasha, calculateTransits } from '../../../services/astrology/astrologyService';

describe('Astrology Service', () => {
  const mockBirthData = {
    dateOfBirth: '1990-01-15',
    timeOfBirth: '08:30:00',
    placeOfBirth: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
  };

  describe('calculateBirthChart', () => {
    it('should calculate birth chart successfully', () => {
      const result = calculateBirthChart(mockBirthData);

      expect(result).toBeDefined();
      expect(result.sun).toBeDefined();
      expect(result.moon).toBeDefined();
      expect(result.ascendant).toBeDefined();
      expect(result.planets).toBeDefined();
      expect(result.houses).toBeDefined();
      expect(result.chartData).toBeDefined();
    });

    it('should throw error for invalid date', () => {
      const invalidData = {
        ...mockBirthData,
        dateOfBirth: 'invalid-date',
      };

      expect(() => calculateBirthChart(invalidData)).toThrow();
    });

    it('should calculate correct sun sign', () => {
      const result = calculateBirthChart(mockBirthData);
      expect(result.sun.sign).toBeDefined();
      expect(result.sun.sign).toMatch(/Capricorn|Aquarius/);
    });

    it('should include all planets', () => {
      const result = calculateBirthChart(mockBirthData);
      const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      expectedPlanets.forEach(planet => {
        expect(result.planets[planet]).toBeDefined();
      });
    });

    it('should calculate houses correctly', () => {
      const result = calculateBirthChart(mockBirthData);
      expect(result.houses).toHaveLength(12);
      result.houses.forEach(house => {
        expect(house.number).toBeGreaterThan(0);
        expect(house.number).toBeLessThanOrEqual(12);
      });
    });
  });

  describe('calculateDasha', () => {
    it('should calculate current dasha period', () => {
      const moonNakshatra = 3; // Krittika
      const result = calculateDasha(moonNakshatra, new Date());

      expect(result).toBeDefined();
      expect(result.currentDasha).toBeDefined();
      expect(result.currentDasha.planet).toBeDefined();
      expect(result.currentDasha.startDate).toBeDefined();
      expect(result.currentDasha.endDate).toBeDefined();
    });

    it('should calculate sub-dasha (antar-dasha)', () => {
      const moonNakshatra = 5;
      const result = calculateDasha(moonNakshatra, new Date());

      expect(result.currentAntarDasha).toBeDefined();
      expect(result.currentAntarDasha.planet).toBeDefined();
    });

    it('should return valid dasha sequence', () => {
      const result = calculateDasha(1, new Date());
      const validDashaPlanets = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      ];

      expect(validDashaPlanets).toContain(result.currentDasha.planet);
    });
  });

  describe('calculateTransits', () => {
    it('should calculate current transits', () => {
      const natalChart = calculateBirthChart(mockBirthData);
      const result = calculateTransits(natalChart, new Date());

      expect(result).toBeDefined();
      expect(result.transitPlanets).toBeDefined();
      expect(result.significantAspects).toBeDefined();
      expect(result.importantTransits).toBeDefined();
    });

    it('should identify major planetary aspects', () => {
      const natalChart = calculateBirthChart(mockBirthData);
      const result = calculateTransits(natalChart, new Date());

      expect(result.significantAspects).toBeInstanceOf(Array);
      result.significantAspects.forEach(aspect => {
        expect(aspect.planet).toBeDefined();
        expect(aspect.aspect).toBeDefined();
        expect(aspect.influence).toBeDefined();
      });
    });

    it('should highlight important transits', () => {
      const natalChart = calculateBirthChart(mockBirthData);
      const result = calculateTransits(natalChart, new Date());

      expect(result.importantTransits).toBeInstanceOf(Array);
    });
  });

  describe('Edge Cases', () => {
    it('should handle coordinates near poles', () => {
      const polarData = {
        ...mockBirthData,
        latitude: 89.999,
        longitude: 0,
      };

      const result = calculateBirthChart(polarData);
      expect(result).toBeDefined();
    });

    it('should handle international date line', () => {
      const dateLineData = {
        ...mockBirthData,
        longitude: 179.999,
      };

      const result = calculateBirthChart(dateLineData);
      expect(result).toBeDefined();
    });

    it('should handle very old dates', () => {
      const oldDate = {
        ...mockBirthData,
        dateOfBirth: '1900-01-01',
      };

      const result = calculateBirthChart(oldDate);
      expect(result).toBeDefined();
    });

    it('should handle future dates', () => {
      const futureDate = {
        ...mockBirthData,
        dateOfBirth: '2050-01-01',
      };

      const result = calculateBirthChart(futureDate);
      expect(result).toBeDefined();
    });
  });
});
