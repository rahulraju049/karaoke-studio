-- VocalFlow Karaoke - Tables Setup

-- Rooms table to track session state
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  current_song_status JSONB DEFAULT '{"playing": false, "currentTime": 0, "songName": null}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants table to track who's in each room
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) DEFAULT 'Vocalist',
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust as needed for security)
CREATE POLICY "Allow anonymous room creation" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous room viewing" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow anonymous participant insertion" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous participant viewing" ON participants FOR SELECT USING (true);
