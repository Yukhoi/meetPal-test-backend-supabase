import { AuthError } from "../exceptions/AuthError";
import * as AuthService from '../service/auth.service';
import { supabase } from "../supabaseClient";

/**
 * 发送账号删除请求
 * 
 * 
 * 注意：此操作只是发起删除请求，不会立即删除账号。
 * 实际的删除操作需要经过审核流程。
 *
 * @async
 * @function sendDeleteAccountRequest
 * @returns {Promise<'success'>} 当请求成功提交时返回 'success'
 * @throws {AuthError} 在以下情况下抛出错误：
 * - 用户未登录或会话已过期
 * - 数据库操作失败（如重复请求、数据库连接问题等）
 * 
 */
export async function sendDeleteAccountRequest() {
  const user = await AuthService.fetchCurrentUser();
  if (!user) {
    throw new AuthError('User not authenticated');
  }

  const { error } = await supabase
    .from('delete_account_request')
    .insert({ user_id: user.id }, { returning: 'minimal' });
    
  if (error) {
    throw new AuthError('Failed to send delete account request: ' + error.message);
  }

  return 'success';
}