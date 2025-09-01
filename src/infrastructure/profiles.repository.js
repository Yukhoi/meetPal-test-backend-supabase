import { supabase } from '../supabaseClient'
import { ProfilesError } from '../exceptions/ProfilesError';

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

export async function fetchAllIds(from, to, currentUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .range(from, to)
    .not('id', 'eq', currentUserId);

  if (error) {
    throw new ProfilesError('fetch all user IDs failed:', { cause: error });
  }

  return data;
}
