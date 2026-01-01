-- Palmistry Module Database Tables
-- Append to main schema.sql

-- Extending palm_photos table with Phase 5 enhancements
ALTER TABLE palm_photos 
ADD COLUMN IF NOT EXISTS processed_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3, 2),
ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(50) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed'));

-- Store detailed palm analysis results
CREATE TABLE IF NOT EXISTS palm_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  palm_photo_id UUID NOT NULL REFERENCES palm_photos(id) ON DELETE CASCADE,
  
  -- Hand characteristics
  hand_shape VARCHAR(50),
  hand_size VARCHAR(20),
  hand_flexibility VARCHAR(20),
  palm_color VARCHAR(50),
  
  -- Analysis data (JSONB for flexibility)
  lines_data JSONB,
  mounts_data JSONB,
  fingers_data JSONB,
  signs_data JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_palm_analysis_palm_photo_id ON palm_analysis(palm_photo_id);
CREATE INDEX idx_palm_analysis_created_at ON palm_analysis(created_at);

-- Store interpretation readings
CREATE TABLE IF NOT EXISTS palmistry_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  palm_analysis_id UUID REFERENCES palm_analysis(id),
  reading_type VARCHAR(50) NOT NULL CHECK (reading_type IN (
    'personality_profile', 'life_path', 'career_guidance', 
    'relationship_analysis', 'health_assessment', 'destiny_reading', 'compatibility'
  )),
  interpretation TEXT NOT NULL,
  confidence_score DECIMAL(3, 2),
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_palmistry_readings_user_id ON palmistry_readings(user_id);
CREATE INDEX idx_palmistry_readings_reading_type ON palmistry_readings(reading_type);

-- Store compatibility analysis between users
CREATE TABLE IF NOT EXISTS palmistry_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score INT CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  analysis TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_palmistry_compatibility_users ON palmistry_compatibility(user1_id, user2_id);
CREATE INDEX idx_palmistry_compatibility_score ON palmistry_compatibility(compatibility_score);

-- Track async analysis processing
CREATE TABLE IF NOT EXISTS palmistry_analysis_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  palm_photo_id UUID NOT NULL REFERENCES palm_photos(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_palmistry_tracking_photo_id ON palmistry_analysis_tracking(palm_photo_id);
CREATE INDEX idx_palmistry_tracking_status ON palmistry_analysis_tracking(status);

-- GIN indexes for JSONB queries
CREATE INDEX idx_palm_analysis_lines_gin ON palm_analysis USING GIN (lines_data jsonb_path_ops);
CREATE INDEX idx_palm_analysis_mounts_gin ON palm_analysis USING GIN (mounts_data jsonb_path_ops);
CREATE INDEX idx_palm_analysis_fingers_gin ON palm_analysis USING GIN (fingers_data jsonb_path_ops);
CREATE INDEX idx_palm_analysis_signs_gin ON palm_analysis USING GIN (signs_data jsonb_path_ops);

-- Updated_at triggers
CREATE TRIGGER update_palm_analysis_updated_at BEFORE UPDATE ON palm_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_palmistry_readings_updated_at BEFORE UPDATE ON palmistry_readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();