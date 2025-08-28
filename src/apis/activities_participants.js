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

/**
 * 根据活动 ID 获取参与者的用户 ID 列表。
 *
 * 本函数从 Supabase 的 `activity_participants` 表中查询 `activity_id` 等于传入值的记录，
 * 并将每条记录的 `user_id` 提取成数组返回。
 *
 * - 若查询发生错误，会在控制台输出错误信息并返回空数组 `[]`。
 * - 会在控制台打印原始 `data` 结果，便于调试。
 *
 * @async
 * @function fetchParticipantsByActivityId
 * @param {string | number} activityId - 活动的唯一标识 ID。
 * @returns {Promise<Array<string | number>>} 参与者的 `user_id` 列表；无记录或出错时返回 `[]`。
 *
 * @example
 * 'a1bc7c76-3f9b-49e8-b780-28aa87003b35' => ['d4e5f6g7-8h9i-0j1k-2l3m-4n5o6p7q8r9s', 'e4f5g6h7-8i9j-0k1l-2m3n-4o5p6q7r8s9t']
 */

const fetchParticipantsByActivityId = async (activityId) => {
  const { data, error } = await supabase
    .from('activity_participants')
    .select('*')
    .eq('activity_id', activityId);

  if (error) {
    console.error('请求错误:', error.message);
    return [];
  }

  const participants = data.map(participant => (participant.user_id));

  return participants;
};

export { removeParticipant, fetchParticipantsByActivityId };