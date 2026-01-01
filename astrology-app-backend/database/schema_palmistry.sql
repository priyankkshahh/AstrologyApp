-- Palmistry Module Database Schema Extensions
-- Add these tables to existing schema

-- Extending palm_photos table with additional columns as per Phase 5 specs
ALTER TABLE palm_photos 
ADD COLUMN IF NOT EXISTS processed_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3, 2),
ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(50) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create palm_analysis table for detailed analysis results
CREATE TABLE IF NOT EXISTS palm_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  palm_photo_id UUID NOT NULL REFERENCES palm_photos(id) ON DELETE CASCADE,
  
  -- Hand Shape & General Characteristics
  hand_shape VARCHAR(50),
  hand_size VARCHAR(20),
  hand_flexibility VARCHAR(20),
  palm_color VARCHAR(50),
  
  -- Lines Analysis (stored as JSON for flexibility)
  lines_data JSONB,
  
  -- Mounts Analysis
  mounts_data JSONB,
  
  -- Fingers Analysis
  fingers_data JSONB,
  
  -- Signs and Markings
  signs_data JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_palm_analysis_palm_photo_id ON palm_analysis(palm_photo_id);
CREATE INDEX IF NOT EXISTS idx_palm_analysis_created_at ON palm_analysis(created_at);

-- Create palmistry_readings table for interpretation results
CREATE TABLE IF NOT EXISTS palmistry_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  palm_analysis_id UUID REFERENCES palm_analysis(id),
  reading_type VARCHAR(50) NOT NULL CHECK (reading_type IN (
    'personality_profile',
    'life_path',
    'career_guidance', 
    'relationship_analysis',
    'health_assessment',
    'destiny_reading',
    'compatibility_analysis'
  )),
  interpretation TEXT NOT NULL,
  confidence_score DECIMAL(3, 2),
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_palmistry_readings_user_id ON palmistry_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_palmistry_readings_reading_type ON palmistry_readings(reading_type);
CREATE INDEX IF NOT EXISTS idx_palmistry_readings_created_at ON palmistry_readings(created_at);

-- Create palmistry_compatibility table for relationship analysis
CREATE TABLE IF NOT EXISTS palmistry_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score INT CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  compatibility_factors JSONB, -- Detailed breakdown of compatibility
  analysis TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_palmistry_compatibility_users ON palmistry_compatibility(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_palmistry_compatibility_score ON palmistry_compatibility(compatibility_score);

-- Create extended analysis tracking table (for complex features)
CREATE TABLE IF NOT EXISTS palmistry_analysis_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  palm_photo_id UUID NOT NULL REFERENCES palm_photos(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_data JSONB,
  error_message TEXT,
  processing_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_palmistry_tracking_photo_id ON palmistry_analysis_tracking(palm_photo_id);
CREATE INDEX IF NOT EXISTS idx_palmistry_tracking_status ON palmistry_analysis_tracking(status);

-- Create indexes for improved query performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_palm_analysis_lines_gin ON palm_analysis USING GIN (lines_data jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_palm_analysis_mounts_gin ON palm_analysis USING GIN (mounts_data jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_palm_analysis_fingers_gin ON palm_analysis USING GIN (fingers_data jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_palm_analysis_signs_gin ON palm_analysis USING GIN (signs_data jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_palmistry_compatibility_gin ON palmistry_compatibility USING GIN (compatibility_factors jsonb_path_ops);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_palm_analysis_updated_at BEFORE UPDATE ON palm_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_palmistry_readings_updated_at BEFORE UPDATE ON palmistry_readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced palm_photos view for easier queries
CREATE OR REPLACE VIEW palmistry_overview AS
SELECT 
    pp.id as photo_id,
    pp.user_id,
    pp.hand_side,
    pp.firebase_url,
    pp.upload_date,
    pp.quality_score,
    pp.analysis_status,
    pa.id as analysis_id,
    pa.hand_shape,
    pa.hand_size,
    pa.palm_color,
    pa.lines_data,
    pa.mounts_data,
    pa.fingers_data,
    pa.signs_data,
    pa.created_at as analysis_date
FROM palm_photos pp
LEFT JOIN palm_analysis pa ON pp.id = pa.palm_photo_id;

-- Analytics view for reading statistics
CREATE OR REPLACE VIEW palmistry_readings_stats AS
SELECT 
    user_id,
    reading_type,
    COUNT(*) as reading_count,
    AVG(confidence_score) as avg_confidence,
    MAX(created_at) as last_reading_date,
    MIN(created_at) as first_reading_date
FROM palmistry_readings
GROUP BY user_id, reading_type;

-- Compatibility analysis view
CREATE OR REPLACE VIEW compatibility_analytics AS
SELECT 
    user1_id,
    user2_id,
    compatibility_score,
    analysis,
    created_at,
    CASE 
        WHEN compatibility_score >= 80 THEN 'excellent'
        WHEN compatibility_score >= 60 THEN 'good'
        WHEN compatibility_score >= 40 THEN 'moderate'
        ELSE 'challenging'
    END as compatibility_level
FROM palmistry_compatibility;