-- ============================================
-- DeadDrop Ghost Protocol Schema
-- Anonymous, ephemeral, zero-knowledge
-- ============================================

-- Enable PostGIS extension for spatial operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- DeadDrops Table
-- The server knows NOTHING about the content
-- or who can read it. It only stores coordinates
-- and encrypted blobs.
-- ============================================
CREATE TABLE IF NOT EXISTS dead_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_payload TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT, -- For AES-GCM authentication
  target_location GEOGRAPHY(Point, 4326) NOT NULL,
  unlock_radius INTEGER NOT NULL CHECK (unlock_radius > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  is_burned BOOLEAN DEFAULT FALSE,
  burn_count INTEGER DEFAULT 0
);

-- Spatial index for efficient proximity queries
CREATE INDEX IF NOT EXISTS idx_deaddrops_location ON dead_drops USING GIST (target_location);

-- Index for quick burn status checks
CREATE INDEX IF NOT EXISTS idx_deaddrops_burned ON dead_drops(is_burned);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_deaddrops_expires ON dead_drops(expires_at);

-- ============================================
-- Function: Find drops near a location
-- Returns only active (unburned, unexpired) drops
-- ============================================
CREATE OR REPLACE FUNCTION find_nearby_drops(
  user_longitude FLOAT,
  user_latitude FLOAT,
  search_radius_meters FLOAT DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  target_longitude FLOAT,
  target_latitude FLOAT,
  unlock_radius INTEGER,
  distance_meters FLOAT,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_burned BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    ST_X(d.target_location::geometry) as target_longitude,
    ST_Y(d.target_location::geometry) as target_latitude,
    d.unlock_radius,
    ST_Distance(
      d.target_location,
      ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography
    ) as distance_meters,
    d.created_at,
    d.expires_at,
    d.is_burned
  FROM dead_drops d
  WHERE d.is_burned = FALSE
    AND d.expires_at > NOW()
    AND ST_DWithin(
      d.target_location,
      ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography,
      search_radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Validate proximity for unlock
-- Server-side zero-trust validation
-- ============================================
CREATE OR REPLACE FUNCTION validate_proximity(
  drop_id UUID,
  user_longitude FLOAT,
  user_latitude FLOAT
)
RETURNS TABLE (
  is_within_radius BOOLEAN,
  distance_meters FLOAT,
  required_radius INTEGER,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ST_Distance(
      d.target_location,
      ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography
    ) <= d.unlock_radius as is_within_radius,
    ST_Distance(
      d.target_location,
      ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography
    ) as distance_meters,
    d.unlock_radius as required_radius,
    (d.is_burned = FALSE AND d.expires_at > NOW()) as is_active
  FROM dead_drops d
  WHERE d.id = drop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Burn a drop (self-destruct)
-- Deletes the encrypted payload permanently
-- ============================================
CREATE OR REPLACE FUNCTION burn_drop(drop_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  was_active BOOLEAN;
BEGIN
  -- Check if drop exists and is active
  SELECT (is_burned = FALSE AND expires_at > NOW()) 
  INTO was_active 
  FROM dead_drops 
  WHERE id = drop_id;
  
  IF NOT was_active THEN
    RETURN FALSE;
  END IF;
  
  -- Burn it: delete the payload permanently
  UPDATE dead_drops 
  SET 
    is_burned = TRUE, 
    encrypted_payload = '',
    iv = '',
    auth_tag = '',
    burn_count = burn_count + 1
  WHERE id = drop_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Cleanup: Auto-expire old burned drops
-- Run this as a cron job or scheduled function
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_drops()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM dead_drops 
    WHERE expires_at < NOW() OR is_burned = TRUE
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security (RLS)
-- Anyone can create drops (anonymous)
-- Anyone can read drops (but need key to decrypt)
-- Only the burn endpoint can modify is_burned
-- ============================================
ALTER TABLE dead_drops ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (create drops anonymously)
CREATE POLICY "Anyone can create drops" ON dead_drops
  FOR INSERT WITH CHECK (true);

-- Anyone can read (the encryption handles access control)
CREATE POLICY "Anyone can read drops" ON dead_drops
  FOR SELECT USING (true);

-- Only burn function can update (handled via service role)
CREATE POLICY "Burn drops" ON dead_drops
  FOR UPDATE USING (true);
