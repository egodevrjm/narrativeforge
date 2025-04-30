import supabase from './supabaseClient';

/**
 * Supabase Service
 * 
 * Handles all interactions with Supabase for scenarios and characters
 */
const SupabaseService = {
  /**
   * Health Check Functions
   */
  
  // Simple health check
  healthCheck: async () => {
    try {
      // First try the RPC function if it exists
      let { data: healthData, error: healthError } = await supabase.rpc('get_supabase_health');
      
      if (healthError) {
        console.log('RPC not available, trying basic table access');
        // Try a simple table check instead
        const { data, error } = await supabase.from('scenarios').select('id').limit(1);
        if (error) throw error;
        return { status: 'ok', method: 'table_check' };
      }
      
      return healthData || { status: 'ok', method: 'rpc' };
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
  
  /**
   * Auth Functions
   */
  
  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Get current user
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },
  
  // Check if user is admin
  isAdmin: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user || !user.user) return false;
      
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.user.email)
        .single();
        
      return !!admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  /**
   * Scenario Functions
   */
  
  // Get all default scenarios
  getDefaultScenarios: async () => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select(`
          *,
          characters:characters(*)
        `)
        .eq('is_default', true);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting default scenarios:', error);
      return [];
    }
  },
  
  // Get all scenarios (admin only)
  getAllScenarios: async () => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select(`
          *,
          characters:characters(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all scenarios:', error);
      return [];
    }
  },
  
  // Get a scenario by ID
  getScenarioById: async (id) => {
    const { data, error } = await supabase
      .from('scenarios')
      .select(`
        *,
        characters:characters(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Create a new scenario
  createScenario: async (scenarioData) => {
    const { data, error } = await supabase
      .from('scenarios')
      .insert([scenarioData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update a scenario
  updateScenario: async (id, scenarioData) => {
    const { data, error } = await supabase
      .from('scenarios')
      .update({
        ...scenarioData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a scenario
  deleteScenario: async (id) => {
    const { error } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },
  
  /**
   * Character Functions
   */
  
  // Get all characters for a scenario
  getCharactersForScenario: async (scenarioId) => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('scenario_id', scenarioId);
      
    if (error) throw error;
    return data;
  },
  
  // Create a new character
  createCharacter: async (characterData) => {
    const { data, error } = await supabase
      .from('characters')
      .insert([characterData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update a character
  updateCharacter: async (id, characterData) => {
    const { data, error } = await supabase
      .from('characters')
      .update({
        ...characterData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a character
  deleteCharacter: async (id) => {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },
  
  /**
   * Migration Functions (for moving from localStorage to Supabase)
   */
  
  // Migrate local scenarios to Supabase
  migrateLocalScenarios: async () => {
    try {
      const localScenarios = JSON.parse(localStorage.getItem('nf_scenarios') || '[]');
      
      for (const scenario of localScenarios) {
        // Create the scenario
        const { data: newScenario } = await supabase
          .from('scenarios')
          .insert([{
            title: scenario.title,
            description: scenario.description || '',
            content: JSON.stringify(scenario),
            is_default: false
          }])
          .select();
          
        if (newScenario && newScenario[0] && scenario.character) {
          // Create the associated character
          await supabase
            .from('characters')
            .insert([{
              name: scenario.character.name,
              background: scenario.character.background || '',
              personality: scenario.character.personality || '',
              appearance: scenario.character.appearance || '',
              scenario_id: newScenario[0].id,
              is_default: false
            }]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};

export default SupabaseService;