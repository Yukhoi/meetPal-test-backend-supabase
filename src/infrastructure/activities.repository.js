import { supabase } from "../supabaseClient";
import { ActivitiesError } from "../exceptions/ActivitiesError";

export async function fetchActivitiesDetailsByQuery(query, from, to) {

  const { data, error } = await supabase
    .from('activities')
    .select('id, title, start_time, location', { count: 'exact' })
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .range(from, to);

  if (error) {
    console.error('Error searching activities:', error.message);
    throw new ActivitiesError('Error searching activities:', error.message);
  }

  return data;
}

export async function fetchActivitiesByCategoryNameIn24h(params) {
  const { categoryName, from, to, now, timeIn24h } = params;

  const { data, error, count } = await supabase
    .from('activities')
    .select(
      `
      *,
      creator:profiles(*),                 
      category:activity_categories!inner(id,name),
      photos:activity_photos(*)            
      `,
      { count: 'exact' }
    )
    .eq('category.name', categoryName)    
    .eq('status', 'planned')              
    .gte('start_date', now)              
    .lte('start_date', timeIn24h)           
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Fetching activities by category in 24h failed', error.message);
    throw new ActivitiesError('Fetching activities by category in 24h failed:', error.message);
  }

  return { data, count };
}

export async function fetchActivitiesByCategoryName(params){
  const { categoryName, from, to } = params;

  const { data, error, count } = await supabase
    .from('activities')
    .select(
      `
      *,
      creator:profiles(*),                 
      category:activity_categories!inner(id,name),
      photos:activity_photos(*)            
      `,
      { count: 'exact' }
    )
    .eq('category.name', categoryName)    
    .eq('status', 'planned')              
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Fetching activities by category failed', error.message);
    throw new ActivitiesError('Fetching activities by category failed:', error.message);
  }

  return { data, count };
}

export async function countActivitiesByCategoryName({ categoryName }) {
  const { count, error } = await supabase
    .from('activities')
    .select(
      `
      id,
      category:activity_categories!inner(id,name)
      `,
      { count: 'exact', head: true } 
    )
    .eq('category.name', categoryName)
    .eq('status', 'planned');

  if (error) {
    console.error('Counting activities by category failed', error.message);
    throw new ActivitiesError('Counting activities by category failed:', error.message);
  }
  return count ?? 0;
}

export async function countActivitiesByCategoryNameIn24h(params) {
  const { categoryName, now, timeIn24h } = params;

  const { count, error } = await supabase
    .from('activities')
    .select(
      `
      id,
      category:activity_categories!inner(id,name)
      `,
      { count: 'exact', head: true }
    )
    .eq('category.name', categoryName)
    .eq('status', 'planned')
    .gte('start_date', now)
    .lte('start_date', timeIn24h);

  if (error) {
    console.error('Counting activities by category in 24h failed', error.message);
    throw new ActivitiesError('Counting activities by category in 24h failed:', error.message);
  }
  return count ?? 0;
}
