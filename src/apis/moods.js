import { supabase } from "../supabaseClient";

/**
 * 更新用户心情
 * @param {string} userId - 用户ID (uuid)
 * @param {string} mood - 心情描述
 * @returns {Promise<Object>} 返回更新后的记录，例如：
 *   {
 *     user_id: "1a2b3c-uuid",
 *     mood: "Bored",
 *     updated_at: "2025-08-24T12:34:56.789Z"
 *   }
 */
export async function updateMood(userId, mood) {
  const { data, error } = await supabase
    .from('moods')
    .upsert(
      {
        user_id: userId,
        mood: mood,
        updated_at: new Date().toISOString()
      },
      { onConflict: ['user_id'] } // 冲突时用 user_id 更新
    )
    .select()

  if (error) {
    console.error('fail to update mood:', error)
    throw error
  }

  return data[0]
}

/**
 * 获取指定用户的心情
 * @param {string} userId - 用户ID (uuid)
 * @returns {Promise<null | { user_id: string, mood: string, updated_at: string }>}
 * 返回示例：
 * { user_id: "1a2b3c-uuid", mood: "Bored", updated_at: "2025-08-24T12:34:56.789Z" }
 * 若该用户尚未有记录则返回 null
 */
export async function getMoodByUserId(userId) {
  const { data, error } = await supabase
    .from('moods')
    .select('user_id, mood, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('fail to get mood:', error)
    throw error
  }

  return data
}
