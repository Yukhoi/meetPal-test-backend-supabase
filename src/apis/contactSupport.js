import * as AuthService from '../service/auth.service';
import * as ContactSupportService from '../service/contactSupport.service';
import { ContactSupportError } from '../exceptions/ContactSupportError';



/**
 * 发送反馈消息
 * 
 *
 * @async
 * @function sendContactSupportMessage
 * @param {string} message - 用户要发送给支持团队的消息内容
 * @returns {Promise<Object>} 返回支持服务的响应数据，通常包含消息ID和状态信息
 * @throws {ContactSupportError} 当用户未登录时抛出错误
 * @throws {Error} 当消息发送失败时可能抛出其他错误
 * 
 */
export async function sendContactSupportMessage(message){
  const user = await AuthService.fetchCurrentUser();
  if(!user){
    throw new ContactSupportError('Please log in first');
  }

  if(!message){
    throw new ContactSupportError('Please fill in the message content');
  }

  const data = await ContactSupportService.sendContactSupportMessage({ userId: user.id, message });

  return data;
}