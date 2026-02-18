-- VocalFlow Karaoke - Tables Setup (Idempotent)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  current_song_status JSONB DEFAULT '{"playing": false, "currentTime": 0, "songName": null}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE rooms REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) DEFAULT 'Vocalist',
  is_active BOOLEAN DEFAULT TRUE,
  is_recording BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE participants REPLICA IDENTITY FULL;

-- 2. Enable Realtime
-- This block ensures publications are set up without errors
DO $$ 
BEGIN
  -- Re-add tables to publication (ignoring errors if already added)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Table rooms already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE participants;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Table participants already in publication';
  END;
END $$;

-- 3. Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Idempotent)
DROP POLICY IF EXISTS "Allow anonymous room creation" ON rooms;
DROP POLICY IF EXISTS "Allow anonymous room viewing" ON rooms;
DROP POLICY IF EXISTS "Allow anonymous room update" ON rooms;
DROP POLICY IF EXISTS "Allow anonymous participant insertion" ON participants;
DROP POLICY IF EXISTS "Allow anonymous participant viewing" ON participants;
DROP POLICY IF EXISTS "Allow anonymous participant update" ON participants;
DROP POLICY IF EXISTS "Allow anonymous participant delete" ON participants;

CREATE POLICY "Allow anonymous room creation" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous room viewing" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow anonymous room update" ON rooms FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous participant insertion" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous participant viewing" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow anonymous participant update" ON participants FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous participant delete" ON participants FOR DELETE USING (true);
