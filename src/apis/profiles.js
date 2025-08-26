import { supabase } from "../supabaseClient";

/**
 * 获取用户个人资料
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 返回用户个人资料，例如：
 *   {
 *     id: "1a2b3c-uuid",
 *     email: "user@example.com",
 *     first_name: "John",
 *     last_name: "Doe",
 *     created_at: "2025-08-24T12:34:56.789Z"
 *   }
 */
export async function fillUserName(firstName, lastName) {

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { id } = user;

    const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name') // 想要的字段自行增减
    .eq('id', id)
    .maybeSingle();

    if (error) {
      console.error('get user name failed:', error);
      throw error;
    }

    if (data) {
      return data.first_name;
    } else {
      const { data, error: profileError } = await supabase
      .from('profiles')
      .upsert({ id, first_name: firstName }, { onConflict: 'id' })
      .single();

      if (profileError) {
        console.error('insert user first name failed:', profileError);
        throw profileError;
      }

      const { error: detailsError } = await supabase
      .from('profile_details')
      .upsert([
        { profile_id: id, type: 'first_name', value: firstName },
        { profile_id: id, type: 'last_name',  value: lastName  },
        ]);

      if (detailsError) {
        console.error('insert user full name failed:', detailsError);
        throw detailsError;
      }

      return data.first_name;
    }

  } else {
    throw new Error('User not found');
  }
}

