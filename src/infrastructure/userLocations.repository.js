import { supabase } from '../supabaseClient'

export async function fetchUsersDistance(selfUserId, targetUsersId){
  const { data, error } = await supabase
    .rpc('get_user_distances', {
      self_id: selfUserId,
      target_ids: targetUsersId
    });

  if (error) {
    console.error('fetch user distances failed:', error.message);
    throw error;
  }

  return data;
}