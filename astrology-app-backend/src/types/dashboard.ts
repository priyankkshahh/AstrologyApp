export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    timezone?: string;
  };
  date: string;
  astrology: AstrologyWidgetData | null;
  numerology: NumerologyWidgetData | null;
  tarot: TarotWidgetData | null;
  palmistry: PalmistryWidgetData | null;
  crossModuleInsights: CrossModuleInsight[];
  preferences: DashboardPreferences | null;
}

export interface AstrologyWidgetData {
  todayHoroscope: string;
  moonPhase: string;
  dominantPlanet: string;
  sunSign: string;
  luckyNumber?: number;
  luckyColor?: string;
}

export interface NumerologyWidgetData {
  dailyNumber: number;
  lifePathNumber?: number;
  numerologyMessage: string;
  luckyColor: string;
  favorableTime?: string;
}

export interface TarotWidgetData {
  dailyCard: {
    name: string;
    interpretation: string;
    keywords?: string[];
  };
  cardImage?: string;
  orientation: 'upright' | 'reversed';
}

export interface PalmistryWidgetData {
  lastReading: string | null;
  recentPhotosCount: number;
  dominantHand?: 'left' | 'right';
  handShape?: string;
  personalityHighlight?: string;
}

export interface CrossModuleInsight {
  id: string;
  title: string;
  description: string;
  modules: ('astrology' | 'numerology' | 'tarot' | 'palmistry')[];
  strength: 'low' | 'medium' | 'high';
  category: 'harmonious' | 'challenging' | 'opportunities' | 'warnings';
  created_at: string;
}

export interface DashboardPreferences {
  id?: string;
  user_id: string;
  modules_enabled: ('astrology' | 'numerology' | 'tarot' | 'palmistry')[];
  widget_order: string[];
  show_insights: boolean;
  daily_card_time?: string;
  weekly_read_day?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReadingsSummary {
  total_readings: number;
  by_module: {
    astrology: number;
    numerology: number;
    tarot: number;
    palmistry: number;
  };
  recent_readings: ReadingSummaryItem[];
  streak_days?: number;
  most_frequent_module?: string;
}

export interface ReadingSummaryItem {
  id: string;
  type: 'astrology' | 'numerology' | 'tarot' | 'palmistry';
  subtype: string;
  date: string;
  preview?: string;
}

export interface QuickCard {
  id: string;
  module: 'astrology' | 'numerology' | 'tarot' | 'palmistry';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action?: string;
}
