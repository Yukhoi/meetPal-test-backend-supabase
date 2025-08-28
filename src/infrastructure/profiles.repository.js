import { supabase } from '../supabaseClient'

export async function fetchUserAvatarURLbyIds(userIds) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .in('id', userIds);

  if (error) {
    console.error('fetch user avatar URLs failed:', error);
    throw error;
  }

  return data
}
