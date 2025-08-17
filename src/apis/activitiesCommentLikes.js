import { supabase } from '../supabaseClient'

/**
 * 点赞评论（comment_likes 表）
 *
 * @param {string} commentId - 评论 UUID
 * @param {{ supabaseClient?: any }} [opts]
 * @returns {Promise<{status:'liked'|'already liked'|'unauthenticated'|'error', record?: any, error?: any}>}
 */
async function likeComment(commentId, opts = {}) {
  const { supabaseClient = supabase } = opts;

  // 1) 登录校验
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !authData?.user) {
    return { status: 'unauthenticated', error: authError || new Error('Please log in first') };
  }
  const userId = authData.user.id;

  // 2) 写入点赞（利用唯一约束做幂等）
  const { data, error } = await supabaseClient
    .from('comment_likes')
    .insert([{ comment_id: commentId, user_id: userId }])
    .select()
    .single();

  if (error) {
    // Postgres 唯一约束冲突（已点赞过）
    if (error.code === '23505') {
      return { status: 'already liked' };
    }
    return { status: 'error', error };
  }

  return { status: 'liked', record: data };
}

/**
 * 取消点赞评论
 *
 * @param {string} commentId - 评论 UUID
 * @param {{ supabaseClient?: any }} [opts]
 * @returns {Promise<{status:'unliked'|'not liked'|'unauthenticated'|'error', record?: any, error?: any}>}
 */
async function unlikeComment(commentId, opts = {}) {
  const { supabaseClient = supabase } = opts;
  
  // 1) 登录校验
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !authData?.user) {
    return { status: 'unauthenticated', error: authError || new Error('Please log in first') };
  }
  const userId = authData.user.id;

  // 2) 删除当前用户对该评论的点赞（幂等：不存在则返回 not liked）
  const { data, error } = await supabaseClient
    .from('comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .select(); // 返回被删除的行

  if (error) return { status: 'error', error };
  if (!data || data.length === 0) return { status: 'not liked' };

  // 唯一约束保证最多一条
  return { status: 'unliked', record: data[0] };
}

export {
  likeComment,
  unlikeComment
};