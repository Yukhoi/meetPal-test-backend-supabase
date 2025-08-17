import { supabase } from '../supabaseClient'

/**
 * 检查用户是否已点赞某活动
 * @async
 * @function hasLiked
 * @param {string} activityId - 活动 UUID
 * @param {string} userId - 用户 UUID
 * @returns {Promise<boolean>} - true 表示已点赞，false 表示未点赞
 * @throws {Error} - 如果查询失败，会抛出错误
 */
async function hasLiked(activityId, userId) {
  const { data, error } = await supabase
    .from('activity_likes')
    .select('id')
    .eq('activity_id', activityId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

/**
 * 插入点赞记录
 * @async
 * @function insertLike
 * @param {string} activityId - 活动 UUID
 * @param {string} userId - 用户 UUID
 * @returns {Promise<{success: boolean, data?: any, error?: any}>} - 
 * - success: true 表示插入成功，false 表示插入失败
 * - data: 插入的记录（成功时返回）
 * - error: 错误信息（失败时返回）
 */
async function insertLike(activityId, userId) {
  const { data, error } = await supabase
    .from('activity_likes')
    .insert([{ activity_id: activityId, user_id: userId }])
    .select(); // 返回插入的记录

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * 删除点赞记录
 * @async
 * @function deleteLike
 * @param {string} activityId - 活动 UUID
 * @param {string} userId - 用户 UUID
 * @returns {Promise<{success: boolean, data?: any, error?: any}>} - 
 * - success: true 表示删除成功，false 表示删除失败
 * - data: 被删除的记录（成功时返回）
 * - error: 错误信息（失败时返回）
 */
async function deleteLike(activityId, userId) {
  const { data, error } = await supabase
    .from('activity_likes')
    .delete()
    .eq('activity_id', activityId)
    .eq('user_id', userId)
    .select(); // 返回被删除的记录（若存在）

  if (error) return { success: false, error };
  // data 可能是 []（未找到）或 [record]（删除成功）
  return { success: data && data.length > 0, data };
}

/**
 * 点赞活动
 * @async
 * @function likeActivity
 * @param {string} activityId - 活动 UUID
 * @param {string} userId - 用户 UUID
 * @returns {Promise<{status: string, record?: any, error?: any}>} - 
 * - status: 'liked' 表示点赞成功，'already liked' 表示已点赞，'error' 表示操作失败
 * - record: 插入的记录（点赞成功时返回）
 * - error: 错误信息（操作失败时返回）
 */
async function likeActivity(activityId, userId) {
  try {
    if (await hasLiked(activityId, userId)) {
      return { status: 'already liked' };
    }

    const result = await insertLike(activityId, userId);
    if (!result.success) {
      return { status: 'error', error: result.error };
    }

    return { status: 'liked', record: result.data[0] }; // 返回插入的记录
  } catch (err) {
    return { status: 'error', error: err };
  }
}

/**
 * 取消点赞活动
 * @async
 * @function unlikeActivity
 * @param {string} activityId - 活动 UUID
 * @param {string} userId - 用户 UUID
 * @returns {Promise<{status: 'unliked'|'not liked'|'error', record?: any, error?: any}>} - 
 * - status: 'unliked' 表示取消点赞成功，'not liked' 表示未点赞，'error' 表示操作失败
 * - record: 被删除的记录（取消点赞成功时返回）
 * - error: 错误信息（操作失败时返回）
 */
async function unlikeActivity(activityId, userId) {
  try {
    if (!(await hasLiked(activityId, userId))) {
      return { status: 'not liked' };
    }

    const result = await deleteLike(activityId, userId);
    if (!result.success) {
      return { status: 'error', error: result.error };
    }

    return { status: 'unliked', record: result.data?.[0] };
  } catch (err) {
    return { status: 'error', error: err };
  }
}

/**
 * 从数据库中获取特定活动的点赞数量。
 *
 * @async
 * @function
 * @param {string} activityId - 要获取点赞数量的活动 ID。
 * @returns {Promise<number>} 返回一个 Promise，解析为活动的点赞数量。
 *                            如果未找到点赞数量，则返回 0。
 * @throws {Error} 如果数据库查询失败，则抛出错误。
 */
async function getLikeCount(activityId) {
  const { data, error } = await supabase
    .from('activities')
    .select('like_counts')
    .eq('id', activityId)
    .maybeSingle();

  if (error) throw error;
  return data?.like_counts ?? 0;
}

/**
 * 批量读取多个活动的点赞数量。
 * @param {string[]} activityIds
 * @returns {Promise<Record<string, number>>} 形如 { [id]: count }
 */
async function getLikeCounts(activityIds) {
  if (!activityIds?.length) return {};

  const { data, error } = await supabase
    .from('activities')
    .select('id, like_counts')
    .in('id', activityIds);

  if (error) throw error;

  const map = Object.fromEntries(activityIds.map(id => [id, 0]));
  for (const row of data || []) {
    map[row.id] = row.like_counts ?? 0;
  }
  return map;
}

export { likeActivity, unlikeActivity, getLikeCount, getLikeCounts };
