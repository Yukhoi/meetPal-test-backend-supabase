import { supabase } from "../supabaseClient";

const removeParticipant = async (participantId) => {

  // 移除用户
  const { data, error } = await supabase
    .from('activity_participants')
    .update({
      status: 'rejected',
    })
    .eq('id', participantId)
    .select();

  if (error) {
    console.error('请求错误:', error.message);
    return;
  }

  // 发送通知给用户
  await supabase
    .from('notifications')
    .insert([
      {
        user_id: data[0].user_id,
        type: 'activity_update',
        content: 'You have been removed from the activity.',
        related_activity_id: data[0].activity_id,
      },
    ]);
};

export { removeParticipant };