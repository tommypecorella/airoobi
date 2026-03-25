-- Admin can read all checkins (needed for /admin dashboard today's check-in count)
CREATE POLICY "Admin can read all checkins"
  ON checkins FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- Admin can read all video views (needed for /admin dashboard today's video count)
CREATE POLICY "Admin can read all video views"
  ON video_views FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));
