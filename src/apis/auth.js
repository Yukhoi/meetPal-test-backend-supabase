import { supabase } from '../supabaseClient'

/**
 * 发送邮箱 OTP 验证码
 *
 * 调用 Supabase 的 `signInWithOtp` 方法，向指定邮箱发送一次性验证码（OTP）。
 * 如果用户不存在并且 `shouldCreateUser: true`，会自动注册新用户。
 *
 * @async
 * @function loginWithOTP
 * @param {string} email - 用户的邮箱地址
 * @returns {Promise<object>} Supabase 返回的数据对象（通常包含会话或用户信息）
 * @throws {Error} 当 Supabase 返回错误时抛出异常
 */
export async function loginWithOTP(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
    shouldCreateUser: true
    }
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * 校验邮箱 OTP 验证码
 *
 * 使用用户输入的验证码调用 Supabase 的 `verifyOtp` 方法完成登录/注册。
 *
 * @async
 * @function verifyOTP
 * @param {string} email - 用户的邮箱地址（必须和请求验证码时一致）
 * @param {string} otp - 用户输入的 6 位一次性验证码
 * @returns {Promise<object>} Supabase 返回的数据对象（通常包含用户和会话信息）
 * @throws {Error} 当验证码无效或 Supabase 返回错误时抛出异常
 *
 * @example
 *   // {
 *   //   session: {
 *   //     access_token: 'xxx',
 *   //     refresh_token: 'xxx',
 *   //     user: {
 *   //       id: 'uuid',
 *   //       email: 'user@example.com',
 *   //       ...
 *   //     },
 *   //     ...
 *   //   },
 *   //   user: {
 *   //     id: 'uuid',
 *   //     email: 'user@example.com',
 *   //     ...
 *   //   }
 *   // }
 */
export async function verifyOTP(email, otp) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email'
  })

  if (error) {
    throw error
  }

  return data
}


/**
 * 用户注册
 * @param {string} email - 用户邮箱
 * @param {string} password - 用户密码
 * @returns {Promise<Object>} 返回注册后的用户信息，例如：
 *   {
 *     id: "1a2b3c-uuid",
 *     email: "user@example.com",
 *     created_at: "2025-08-24T12:34:56.789Z"
 *   }
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    console.error('sign up failed:', error)
    throw error
  }

  return data
}

/**
 * 获取用户First Name
 * @returns {Promise<Object>} 返回用户个人资料，例如：
 *   {
 *     id: "1a2b3c-uuid",
 *     email: "user@example.com",
 *     first_name: "John",
 *     last_name: "Doe",
 *     created_at: "2025-08-24T12:34:56.789Z"
 *   }
 * 
 * @example
 *   //刚注册完
 *   const userName = await fillUserName('John', 'Doe');
 *   console.log(userName); // "John"
 * 
 *   //登录
 *   const userName = await fillUserName();
 *   console.log(userName); // "John"
 */
export async function fillUserName(firstName = '', lastName = '') {

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { id } = user;

    const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name') 
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

