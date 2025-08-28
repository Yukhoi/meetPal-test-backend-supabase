import { supabase } from "../supabaseClient";

export async function fetchParticipantsByActivityId(activityId) {
  const { data, error } = await supabase
    .from('activity_participants')
    .select('*')
    .eq('activity_id', activityId);

  if (error) {
    console.error('请求错误:', error.message);
    return [];
  }
  
  return data;
};
