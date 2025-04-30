-- Create a simple health check function for Supabase
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_supabase_health()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'status', 'ok',
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_supabase_health() TO anon;
GRANT EXECUTE ON FUNCTION get_supabase_health() TO authenticated;

-- Function to check if tables exist
CREATE OR REPLACE FUNCTION check_tables_exist()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'scenarios_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenarios'),
    'characters_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'characters'),
    'admins_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION check_tables_exist() TO anon;
GRANT EXECUTE ON FUNCTION check_tables_exist() TO authenticated;
