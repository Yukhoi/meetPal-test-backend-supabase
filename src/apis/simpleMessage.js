import * as authService from "../service/auth.service"
import * as simpleMessageService from "../service/simpleMessage.service"
import { SimpleMessageError } from "../exceptions/SimpleMessageError";


/**
 * 发送文本消息
 * 
 * 向指定联系人发送一条文本消息。此函数会自动获取当前用户ID作为发送者，
 * 并返回格式化后的消息对象。
 *
 * @async
 * @function sendTextMessage
 * @param {string} contactId - 接收消息的联系人ID
 * @param {string} content - 要发送的文本内容
 * @returns {Promise<Object|null>} 返回格式化的消息对象，如果参数无效则返回null
 * @property {string} id - 消息唯一标识符
 * @property {string} content - 消息内容
 * @property {string} senderId - 发送者ID
 * @property {string} receiverId - 接收者ID
 * @property {string} messageType - 消息类型
 * @property {string|null} imageUrl - 图片URL（如果有）
 * @property {boolean} isRead - 消息是否已读
 * @property {string} createdAt - 消息创建时间
 * @property {boolean} isOwnMessage - 是否是当前用户发送的消息
 * @property {Object|null} senderProfile - 发送者的个人资料信息
 * 
 */
export async function sendTextMessage(contactId, content) {
  if (!content || !contactId) {
    throw new SimpleMessageError('Fail to send message: missing required parameters');
  }

  const currentUser = await authService.fetchCurrentUser();

  if (!currentUser.id) {
    throw new SimpleMessageError('Fail to send message: user not authenticated');
  }

  const msg = await simpleMessageService.sendTextMessage({
    contactId,
    content,
  });

  return {
    id: msg.id,
    content: msg.content,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    messageType: msg.message_type,
    imageUrl: msg.image_url,
    isRead: msg.is_read,
    createdAt: msg.created_at,
    isOwnMessage: msg.sender_id === currentUser.id,
    senderProfile: msg.profiles ?? null
  };
}

/**
 * 发送图片消息
 * 
 * 向指定联系人发送一条包含图片的消息。支持可选的图片说明文字。
 * 此函数会验证用户身份并上传图片，然后发送包含图片URL的消息。
 *
 * @async
 * @function sendImageMessage
 * @param {string} contactId - 接收消息的联系人ID
 * @param {string} imageUri - 图片的URI或路径。可以是本地文件路径或远程URL
 * @param {string} [caption=null] - 可选的图片说明文字
 * @throws {SimpleMessageError} 当缺少必要参数时抛出错误
 * @throws {SimpleMessageError} 当用户未认证时抛出错误
 * @returns {Promise<Object>} 返回格式化的消息对象
 * @property {string} id - 消息唯一标识符
 * @property {string} content - 消息内容（包含caption）
 * @property {string} senderId - 发送者ID
 * @property {string} receiverId - 接收者ID
 * @property {string} messageType - 消息类型（图片类型）
 * @property {string} imageUrl - 图片的访问URL
 * @property {boolean} isRead - 消息是否已读
 * @property {string} createdAt - 消息创建时间
 * @property {boolean} isOwnMessage - 是否是当前用户发送的消息
 * @property {Object|null} senderProfile - 发送者的个人资料信息
 * 
 */
export async function sendImageMessage(contactId, imageUri, caption=null) {
  if (!imageUri || !contactId) {
    throw new SimpleMessageError('Fail to send message: missing required parameters');
  }

  const currentUser = await authService.fetchCurrentUser();

  if (!currentUser.id) {
    throw new SimpleMessageError('Fail to send message: user not authenticated');
  }

  const msg = await simpleMessageService.sendImageMessage({
    contactId,
    imageUri,
    caption,
  });

  return {
    id: msg.id,
    content: msg.content,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    messageType: msg.message_type,
    imageUrl: msg.image_url,
    isRead: msg.is_read,
    createdAt: msg.created_at,
    isOwnMessage: msg.sender_id === currentUser.id,
    senderProfile: msg.profiles ?? null
  };
}
