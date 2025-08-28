import { supabase } from '../supabaseClient'

export async function fetchIdsByQuery(query) {
  
  const { data, error } = await supabase
    .from('profile_details')
    .select('profile_id')
    .in('type', ['first_name', 'last_name'])
    .ilike('value', `%${query}%`);

  if (error) {
    console.error('Error fetching profile IDs:', error);
    throw error;
  }

  return data;
}

export async function fetchProfileDetailsByIdsForSearch(profileId, from, to) {

  const { data, error, count } = await supabase
    .from('profile_details_summary_for_search')
    .select('profile_id, props')
    .in('profile_id', profileId)
    .order('profile_id', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error("Fetch profile details by IDs failed: " + error.message);
  }

  return { data, count };
};

