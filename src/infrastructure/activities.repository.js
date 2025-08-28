import { supabase } from "../supabaseClient";

export async function fetchActivitiesDetailsByQuery(query, from, to) {

  const { data, error } = await supabase
    .from('activities')
    .select('id, title, start_time, location', { count: 'exact' })
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .range(from, to);

  if (error) {
    console.error('Error searching activities:', error);
    throw error;
  }

  return data;
}
