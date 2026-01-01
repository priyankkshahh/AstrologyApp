/**
 * Astrology Constants and Calculations
 * Contains astronomical constants, ayanamsa values, and general astrology calculations
 */

import Decimal from 'decimal.js';

// Ayanamsa systems (in arcseconds)
export enum AyanamsaSystem {
  LAHIRI = 'Lahiri',
  RAMAN = 'Raman',
  KRISHNAMURTI = 'Krishnamurti',
  FAGAN_BRADLEY = 'Fagan-Bradley',
  YUKTESHWAR = 'Yukteshwar'
}

// Planet IDs for Swiss Ephemeris
export enum PlanetId {
  SUN = 0,
  MOON = 1,
  MERCURY = 2,
  VENUS = 3,
  MARS = 4,
  JUPITER = 5,
  SATURN = 6,
  RAHU = 11, // Mean lunar node
  KETU = -1 // Calculated as opposite Rahu
}

// Zodiac signs (Vedic/Sidereal)
export const ZodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof ZodiacSigns[number];

// House systems
export enum HouseSystem {
  PLACIDUS = 'P',
  KOCK = 'K',
  PORPHYRI = 'O',
  REGIOMONTANUS = 'R',
  CAMPANUS = 'C',
  EQUAL = 'E',
  VEHLOW_EQUAL = 'V',
  WHOLE_SIGN = 'W'
}

// Nakshatras (27 lunar mansions)
export const Nakshatras = [
  { name: 'Ashwini', ruler: 'Ketu', pada: 4, lord: 'Mars' },
  { name: 'Bharani', ruler: 'Venus', pada: 4, lord: 'Venus' },
  { name: 'Krittika', ruler: 'Sun', pada: 4, lord: 'Sun' },
  { name: 'Rohini', ruler: 'Moon', pada: 4, lord: 'Moon' },
  { name: 'Mrigashira', ruler: 'Mars', pada: 4, lord: 'Mars' },
  { name: 'Ardra', ruler: 'Rahu', pada: 4, lord: 'Mercury' },
  { name: 'Punarvasu', ruler: 'Jupiter', pada: 4, lord: 'Jupiter' },
  { name: 'Pushya', ruler: 'Saturn', pada: 4, lord: 'Saturn' },
  { name: 'Ashlesha', ruler: 'Mercury', pada: 4, lord: 'Mercury' },
  { name: 'Magha', ruler: 'Ketu', pada: 4, lord: 'Ketu' },
  { name: 'Purva Phalguni', ruler: 'Venus', pada: 4, lord: 'Venus' },
  { name: 'Uttara Phalguni', ruler: 'Sun', pada: 4, lord: 'Sun' },
  { name: 'Hasta', ruler: 'Moon', pada: 4, lord: 'Moon' },
  { name: 'Chitra', ruler: 'Mars', pada: 4, lord: 'Mars' },
  { name: 'Swati', ruler: 'Rahu', pada: 4, lord: 'Rahu' },
  { name: 'Vishakha', ruler: 'Jupiter', pada: 4, lord: 'Jupiter' },
  { name: 'Anuradha', ruler: 'Saturn', pada: 4, lord: 'Saturn' },
  { name: 'Jyeshtha', ruler: 'Mercury', pada: 4, lord: 'Mercury' },
  { name: 'Mula', ruler: 'Ketu', pada: 4, lord: 'Ketu' },
  { name: 'Purva Ashadha', ruler: 'Venus', pada: 4, lord: 'Venus' },
  { name: 'Uttara Ashadha', ruler: 'Sun', pada: 4, lord: 'Sun' },
  { name: 'Shravana', ruler: 'Moon', pada: 4, lord: 'Moon' },
  { name: 'Dhanishtha', ruler: 'Mars', pada: 4, lord: 'Mars' },
  { name: 'Shatabhisha', ruler: 'Rahu', pada: 4, lord: 'Rahu' },
  { name: 'Purva Bhadrapada', ruler: 'Jupiter', pada: 4, lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn', pada: 4, lord: 'Saturn' },
  { name: 'Revati', ruler: 'Mercury', pada: 4, lord: 'Mercury' }
] as const;

export type NakshatraName = typeof Nakshatras[number]['name'];

// Planetary details
export interface PlanetInfo {
  id: PlanetId;
  name: string;
  symbol: string;
  color: string;
  nature: 'benefic' | 'malefic' | 'neutral';
  defaultExaltation: ZodiacSign;
  defaultDebilitation: ZodiacSign;
  directionalStrength: 'E' | 'W' | 'N' | 'S' | null;
  daysToOrbit: number;
}

export const PlanetDetails: Record<string, PlanetInfo> = {
  sun: {
    id: PlanetId.SUN,
    name: 'Sun',
    symbol: '☉',
    color: '#FF6B00',
    nature: 'malefic',
    defaultExaltation: 'Aries',
    defaultDebilitation: 'Libra',
    directionalStrength: 'S', // Mars rules South
    daysToOrbit: 365.2422
  },
  moon: {
    id: PlanetId.MOON,
    name: 'Moon',
    symbol: '☽',
    color: '#E0E0E0',
    nature: 'benefic',
    defaultExaltation: 'Taurus',
    defaultDebilitation: 'Scorpio',
    directionalStrength: 'N', // Rising: North
    daysToOrbit: 27.3217
  },
  mars: {
    id: PlanetId.MARS,
    name: 'Mars',
    symbol: '♂',
    color: '#D32F2F',
    nature: 'malefic',
    defaultExaltation: 'Capricorn',
    defaultDebilitation: 'Cancer',
    directionalStrength: 'S',
    daysToOrbit: 686.980
  },
  mercury: {
    id: PlanetId.MERCURY,
    name: 'Mercury',
    symbol: '☿',
    color: '#FF9800',
    nature: 'neutral',
    defaultExaltation: 'Virgo',
    defaultDebilitation: 'Pisces',
    directionalStrength: 'N',
    daysToOrbit: 87.969
  },
  jupiter: {
    id: PlanetId.JUPITER,
    name: 'Jupiter',
    symbol: '♃',
    color: '#4CAF50',
    nature: 'benefic',
    defaultExaltation: 'Cancer',
    defaultDebilitation: 'Capricorn',
    directionalStrength: 'N',
    daysToOrbit: 4332.589
  },
  venus: {
    id: PlanetId.VENUS,
    name: 'Venus',
    symbol: '♀',
    color: '#E91E63',
    nature: 'benefic',
    defaultExaltation: 'Pisces',
    defaultDebilitation: 'Virgo',
    directionalStrength: 'N',
    daysToOrbit: 224.701
  },
  saturn: {
    id: PlanetId.SATURN,
    name: 'Saturn',
    symbol: '♄',
    color: '#616161',
    nature: 'malefic',
    defaultExaltation: 'Libra',
    defaultDebilitation: 'Aries',
    directionalStrength: 'W',
    daysToOrbit: 10758.17
  },
  rahu: {
    id: PlanetId.RAHU,
    name: 'Rahu',
    symbol: '☊',
    color: '#2E7D32',
    nature: 'malefic',
    defaultExaltation: 'Taurus',
    defaultDebilitation: 'Scorpio',
    directionalStrength: null,
    daysToOrbit: 6561.6
  },
  ketu: {
    id: PlanetId.KETU,
    name: 'Ketu',
    symbol: '☋',
    color: '#AD1457',
    nature: 'malefic',
    defaultExaltation: 'Scorpio',
    defaultDebilitation: 'Taurus',
    directionalStrength: null,
    daysToOrbit: 6561.6
  }
};

// Exaltation and debilitation degrees
export const ExaltationDegrees: Record<string, number> = {
  sun: 10,
  moon: 33,
  mars: 298,
  mercury: 165,
  jupiter: 95,
  venus: 357,
  saturn: 203,
  rahu: 68, // Modern calculation reference
  ketu: 248
};

export const DebilitationDegrees: Record<string, number> = {
  sun: 190,
  moon: 213,
  mars: 118,
  mercury: 345,
  jupiter: 275,
  venus: 177,
  saturn: 23,
  rahu: 248,
  ketu: 68
};

// Divisional chart types
export const DivisionalChartTypes = {
  D1: 1,
  D2: 2,
  D3: 3,
  D4: 4,
  D5: 5,
  D7: 7,
  D9: 9,
  D10: 10,
  D12: 12,
  D16: 16,
  D20: 20,
  D24: 24,
  D27: 27,
  D30: 30,
  D40: 40,
  D45: 45,
  D60: 60
} as const;

export type DivisionalChartType = keyof typeof DivisionalChartTypes;

// Tithi (lunar day) information
export const Tithis = [
  { name: 'Pratipada', paksha: 'Shukla', deity: 'Brahma' },
  { name: 'Dwitiya', paksha: 'Shukla', deity: 'Durga' },
  { name: 'Tritiya', paksha: 'Shukla', deity: 'Shiva' },
  { name: 'Chaturthi', paksha: 'Shukla', deity: 'Kuber' },
  { name: 'Panchami', paksha: 'Shukla', deity: 'Naga' },
  { name: 'Shashthi', paksha: 'Shukla', deity: 'Kartikeya' },
  { name: 'Saptami', paksha: 'Shukla', deity: 'Surya' },
  { name: 'Ashtami', paksha: 'Shukla', deity: 'Shiva' },
  { name: 'Navami', paksha: 'Shukla', deity: 'Durga' },
  { name: 'Dashami', paksha: 'Shukla', deity: 'Dharma' },
  { name: 'Ekadashi', paksha: 'Shukla', deity: 'Vishnu' },
  { name: 'Dwadashi', paksha: 'Shukla', deity: 'Vishnu' },
  { name: 'Trayodashi', paksha: 'Shukla', deity: 'Kamadeva' },
  { name: 'Chaturdashi', paksha: 'Shukla', deity: 'Shiva' },
  { name: 'Purnima', paksha: 'Shukla', deity: 'Vishnu' },
  { name: 'Pratipada', paksha: 'Krishna', deity: 'Brahma' },
  { name: 'Dwitiya', paksha: 'Krishna', deity: 'Durga' },
  { name: 'Tritiya', paksha: 'Krishna', deity: 'Shiva' },
  { name: 'Chaturthi', paksha: 'Krishna', deity: 'Kuber' },
  { name: 'Panchami', paksha: 'Krishna', deity: 'Naga' },
  { name: 'Shashthi', paksha: 'Krishna', deity: 'Kartikeya' },
  { name: 'Saptami', paksha: 'Krishna', deity: 'Surya' },
  { name: 'Ashtami', paksha: 'Krishna', deity: 'Shiva' },
  { name: 'Navami', paksha: 'Krishna', deity: 'Durga' },
  { name: 'Dashami', paksha: 'Krishna', deity: 'Dharma' },
  { name: 'Ekadashi', paksha: 'Krishna', deity: 'Vishnu' },
  { name: 'Dwadashi', paksha: 'Krishna', deity: 'Vishnu' }, 
  { name: 'Trayodashi', paksha: 'Krishna', deity: 'Kamadeva' },
  { name: 'Amavasya', paksha: 'Krishna', deity: 'Pitri' }
] as const;

export type TithiName = typeof Tithis[number]['name'];

// Karana (half-tithi) information
export const Karanas = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
] as const;

export type KaranaName = typeof Karanas[number];

// Yoga (Sun-Moon combinations) - 27 total
export const Yogas = [
  'Vishkambha', 'Prithi', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
] as const;

export type YogaName = typeof Yogas[number];

// Days of week
export const DaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = typeof DaysOfWeek[number];

// Yogas (planetary combinations)
export interface YogaConfig {
  name: string;
  type: 'Raja' | 'Dhana' | 'Sanyasa' | 'Neecha Bhanga'; // etc.
  description: string;
  planets?: string[];
  houses?: number[];
  requires?: string[];
  strength?: number;
  check?: (chart: any) => boolean;
}

// Dasha configuration
export interface DashaPlanet {
  planet: string;
  duration: number; // in years
  order: number;
}

// Vimshottari Dasha sequence
export const VimshottariDasha: DashaPlanet[] = [
  { planet: 'Ketu', duration: 7, order: 0 },
  { planet: 'Venus', duration: 20, order: 1 },
  { planet: 'Sun', duration: 6, order: 2 },
  { planet: 'Moon', duration: 10, order: 3 },
  { planet: 'Mars', duration: 7, order: 4 },
  { planet: 'Rahu', duration: 18, order: 5 },
  { planet: 'Jupiter', duration: 16, order: 6 },
  { planet: 'Saturn', duration: 19, order: 7 },
  { planet: 'Mercury', duration: 17, order: 8 }
];

// Dasha calculations
export const NakshatraToDasha: Record<string, DashaPlanet> = {
  'Ashwini': VimshottariDasha.find(p => p.planet === 'Ketu')!,
  'Bharani': VimshottariDasha.find(p => p.planet === 'Venus')!,
  'Krittika': VimshottariDasha.find(p => p.planet === 'Sun')!,
  'Rohini': VimshottariDasha.find(p => p.planet === 'Moon')!,
  'Mrigashira': VimshottariDasha.find(p => p.planet === 'Mars')!,
  'Ardra': VimshottariDasha.find(p => p.planet === 'Rahu')!,
  'Punarvasu': VimshottariDasha.find(p => p.planet === 'Jupiter')!,
  'Pushya': VimshottariDasha.find(p => p.planet === 'Saturn')!,
  'Ashlesha': VimshottariDasha.find(p => p.planet === 'Mercury')!,
  'Magha': VimshottariDasha.find(p => p.planet === 'Ketu')!,
  'Purva Phalguni': VimshottariDasha.find(p => p.planet === 'Venus')!,
  'Uttara Phalguni': VimshottariDasha.find(p => p.planet === 'Sun')!,
  'Hasta': VimshottariDasha.find(p => p.planet === 'Moon')!,
  'Chitra': VimshottariDasha.find(p => p.planet === 'Mars')!,
  'Swati': VimshottariDasha.find(p => p.planet === 'Rahu')!,
  'Vishakha': VimshottariDasha.find(p => p.planet === 'Jupiter')!,
  'Anuradha': VimshottariDasha.find(p => p.planet === 'Saturn')!,
  'Jyeshtha': VimshottariDasha.find(p => p.planet === 'Mercury')!,
  'Mula': VimshottariDasha.find(p => p.planet === 'Ketu')!,
  'Purva Ashadha': VimshottariDasha.find(p => p.planet === 'Venus')!,
  'Uttara Ashadha': VimshottariDasha.find(p => p.planet === 'Sun')!,
  'Shravana': VimshottariDasha.find(p => p.planet === 'Moon')!,
  'Dhanishtha': VimshottariDasha.find(p => p.planet === 'Mars')!,
  'Shatabhisha': VimshottariDasha.find(p => p.planet === 'Rahu')!,
  'Purva Bhadrapada': VimshottariDasha.find(p => p.planet === 'Jupiter')!,
  'Uttara Bhadrapada': VimshottariDasha.find(p => p.planet === 'Saturn')!,
  'Revati': VimshottariDasha.find(p => p.planet === 'Mercury')!
};

// Aspects in degrees
export const TraditionalAspects: Record<string, number[]> = {
  sun: [0, 60, 90, 120, 180],  // Can aspect 3 signs forward (60° and 120°)
  moon: [0, 60, 90, 120, 180, 240, 300], // Full aspects
  mars: [0, 90, 120, 180], // Special aspect 120° (full), 180° includes 120° sweep
  mercury: [0, 60, 90, 120, 180, 210, 240, 300, 330], // Can aspect all 
  jupiter: [0, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360],
  venus: [0, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  saturn: [0, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  rahu: [0, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  ketu: [0, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
};

export const TraditionalAspectOrbs: Record<string, number> = {
  sun: 15,
  moon: 13,
  mars: 8,
  mercury: 7,
  jupiter: 9,
  venus: 7,
  saturn: 9,
  rahu: 7, // Rahu/Ketu use similar to Jupiter/Saturn
  ketu: 7
};

// Orb adjustments for strength
export const OrbStrengthFactors: Record<string, number> = {
  'conjunction': 1.0,
  'opposition': 0.9,
  'trine': 0.8,
  'square': 0.7,
  'sextile': 0.6,
  'harmonic': 0.5
};

// Muhurat types and activities
export const MuhuratActivities = [
  'marriage',
  'business_launch',
  'travel',
  'education',
  'medical',
  'moving',
  'investment',
  'spiritual',
  'legal',
  'construction'
] as const;

export type MuhuratActivity = typeof MuhuratActivities[number];

// House significations
export const HouseMeanings: Record<number, string> = {
  1: 'Self, Body, Personality, Physical Appearance, Dignity',
  2: 'Wealth, Possessions, Family, Speech, Values',
  3: 'Siblings, Courage, Short Journeys, Communication, Skills',
  4: 'Home, Mother, Happiness, Education, Property, Vehicles',
  5: 'Children, Creativity, Intelligence, Speculation, Love Affairs',
  6: 'Health, Diseases, Enemies, Debts, Service, Daily Work',
  7: 'Marriage, Partnerships, Spouse, Business, Legal Matters',
  8: 'Longevity, Death, Transformation, Occult, Inheritance',
  9: 'Fortune, Father, Long Journeys, Higher Education, Religion',
  10: 'Career, Profession, Boss, Authority, Reputation',
  11: 'Gains, Income, Friends, Networks, Aspirations',
  12: 'Losses, Expenses, Foreign Lands, Spirituality, Liberation'
};

// Planetary significations
export const PlanetaryMeanings: Record<string, string> = {
  sun: 'Self, Soul, Father, Authority, Courage, Health, Leadership',
  moon: 'Mind, Mother, Emotions, Comfort, Fluids, Public',
  mars: 'Energy, Action, Conflict, Courage, Siblings, Sports',
  mercury: 'Intelligence, Communication, Business, Skills, Education',
  jupiter: 'Wisdom, Wealth, Teachers, Children, Growth, Expansion',
  venus: 'Love, Relationships, Beauty, Luxury, Creativity, Spouse',
  saturn: 'Discipline, Delay, Hardship, Longevity, Responsibilities',
  rahu: 'Ambition, Confusion, Materialism, Foreign, Unusual',
  ketu: 'Spirituality, Detachment, Isolation, Moksha, Mysticism'
};

// Benefic/Malefic determination
export const NaturalBenefics = ['jupiter', 'venus', 'waxing moon'];
export const NaturalMalefics = ['mars', 'saturn', 'rahu', 'ketu', 'waning moon', 'afflicted sun'];

// House significators (Karakas)
export const HouseKarakas: Record<number, string> = {
  1: 'sun',
  2: 'jupiter',
  3: 'mars',
  4: 'moon',
  5: 'jupiter',
  6: 'mars',
  7: 'venus',
  8: 'saturn',
  9: 'jupiter',
  10: 'mercury',
  11: 'jupiter',
  12: 'saturn'
};

// Transit interpretation strength
export const TransitStrength = {
  VERY_HIGH: 10,
  HIGH: 8,
  MEDIUM_HIGH: 7,
  MEDIUM: 5,
  LOW_MEDIUM: 3,
  LOW: 1
};

// Gemstone recommendations
export const GemstoneRecommendations: Record<string, {
  gemstone: string;
  metal: string;
  finger: string;
  day: string;
  weight_carat: string;
  mantra: string;
}> = {
  sun: { gemstone: 'Ruby', metal: 'Gold', finger: 'Ring finger', day: 'Sunday', weight_carat: '5 carats', mantra: 'Om Suryaya Namaha' },
  moon: { gemstone: 'Pearl', metal: 'Silver', finger: 'Little finger', day: 'Monday', weight_carat: '5 carats', mantra: 'Om Chandraya Namaha' },
  mars: { gemstone: 'Red Coral', metal: 'Gold/Silver', finger: 'Ring finger', day: 'Tuesday', weight_carat: '7 carats', mantra: 'Om Kujaya Namaha' },
  mercury: { gemstone: 'Emerald', metal: 'Gold', finger: 'Little finger', day: 'Wednesday', weight_carat: '5 carats', mantra: 'Om Budhaya Namaha' },
  jupiter: { gemstone: 'Yellow Sapphire', metal: 'Gold', finger: 'Index finger', day: 'Thursday', weight_carat: '5 carats', mantra: 'Om Gurave Namaha' },
  venus: { gemstone: 'Diamond', metal: 'Gold/Silver', finger: 'Middle finger', day: 'Friday', weight_carat: '1 carat', mantra: 'Om Shukraya Namaha' },
  saturn: { gemstone: 'Blue Sapphire', metal: 'Silver/Panchadhatu', finger: 'Middle finger', day: 'Saturday', weight_carat: '5 carats', mantra: 'Om Shanaishcharaya Namaha' },
  rahu: { gemstone: 'Hessonite', metal: 'Silver/Panchadhatu', finger: 'Middle finger', day: 'Saturday', weight_carat: '6 carats', mantra: 'Om Rahave Namaha' },
  ketu: { gemstone: 'Cats Eye', metal: 'Silver/Panchadhatu', finger: 'Middle finger', day: 'Tuesday', weight_carat: '5 carats', mantra: 'Om Ketave Namaha' }
};
