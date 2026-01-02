-- Dashboard Preferences Table
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modules_enabled TEXT[] NOT NULL DEFAULT ARRAY['astrology', 'numerology', 'tarot', 'palmistry']::TEXT[],
  widget_order TEXT[] NOT NULL DEFAULT ARRAY['astrology', 'insights', 'tarot', 'numerology', 'palmistry']::TEXT[],
  show_insights BOOLEAN DEFAULT true,
  daily_card_time VARCHAR(10) DEFAULT '09:00',
  weekly_read_day VARCHAR(20) DEFAULT 'Monday',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dashboard_preferences_user_id ON dashboard_preferences(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_preferences_updated_at
    BEFORE UPDATE ON dashboard_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
