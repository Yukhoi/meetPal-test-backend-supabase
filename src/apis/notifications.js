import { supabase } from "../supabaseClient";
import { NotificationError } from "../exceptions/NotificationError";
import * as NotificationsService from '../service/notifications.service';
/**
 * 批量发送“活动已取消”通知到指定用户。
 *
 * - 会先对 `recipientUserIds` 去重；若最终为空，直接返回 `[]`（不写库）。
 * - 通知内容固定为 `"This activity has been canceled by the host."`。
 * - 以 500 条为一批写入 `notifications` 表，降低单次插入量带来的失败风险。
 * - 任一批次插入失败会抛出错误并中断后续写入。
 *
 * 写入到 `notifications` 表的字段：
 * - `user_id`: 接收者用户 ID
 * - `type`: `'activity_update'`（如有更细分的类型可改为 `'activity_cancel'` 等）
 * - `content`: 通知文案
 * - `related_activity_id`: 关联的活动 ID
 *
 * @async
 * @function sendCanceledActivityNotification
 * @param {Array<string | number>} recipientUserIds - 待通知的用户 ID 列表（可包含重复，函数会自动去重）。
 * @param {string | number} activityId - 被取消的活动 ID。
 * @returns {Promise<'success' | []>} 当成功写入所有通知时返回 `'success'`；若收件人为空则返回 `[]`。
 * @throws {Error} 当任一批次插入 `notifications` 表失败时抛出，错误信息来源于 Supabase。
 *
 * @example
 * // 成功写入
 * await sendCanceledActivityNotification([1, 2, 2, 3], 42);
 * // => 'success'
 */
export async function sendCanceledActivityNotification(recipientUserIds, activityId) {

  const recipients = Array.from(new Set(recipientUserIds || []));

  if (recipients.length === 0) {
    console.warn('No recipients to notify.');
    return [];
  }

  const content = "This activity has been canceled by the host.";


  const rows = recipients.map((uid) => ({
    user_id: uid,                      // 接收者
    type: 'activity_update',           // 或 'system' / 'activity_cancel'（如你有该类型）
    content,                           // 文案
    related_activity_id: activityId,   // 关联活动
  }));

  const chunkSize = 500;
  const chunks = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  } 

  const inserted = [];

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(chunk, { returning: 'minimal' }); 

    if (error) {
      console.error('Error sending activity canceled notifications:', error.message);
      throw new Error(error.message);
    }

    inserted.push(...(data || []));
  } 

  return 'success';
}

/**
 * 批量发送“活动已更新”通知到指定用户。
 *
 * - 对 `recipientUserIds` 去重；若为空则打印警告并返回 `[]`（不写库）。
 * - 通知内容固定为 `"This activity has been updated by the host."`。
 * - 以 500 条为一批写入 `notifications` 表，降低单次插入量导致的失败风险。
 * - 任一批次插入失败会抛出错误并中断后续写入。
 *
 * 写入到 `notifications` 表的字段：
 * - `user_id`: 接收者用户 ID
 * - `type`: `'activity_update'`
 * - `content`: 通知文案
 * - `related_activity_id`: 关联活动 ID
 *
 * @async
 * @function sendUpdatedActivityNotification
 * @param {Array<string | number>} recipientUserIds - 待通知的用户 ID 列表（可重复，函数会去重）。
 * @param {string | number} activityId - 被更新的活动 ID。
 * @returns {Promise<'success' | []>} 成功写入所有通知返回 `'success'`；收件人为空返回 `[]`。
 * @throws {Error} 当任一批次插入 `notifications` 表失败时抛出，错误信息来源于 Supabase。
 *
 * @example
 * // 成功写入
 * await sendUpdatedActivityNotification([1, 2, 2, 3], 42);
 * // => 'success'
 */
export async function sendUpdatedActivityNotification(recipientUserIds, activityId) {

  const recipients = Array.from(new Set(recipientUserIds || []));

  if (recipients.length === 0) {
    console.warn('No recipients to notify.');
    return [];
  }

  const content = "This activity has been updated by the host.";


  const rows = recipients.map((uid) => ({
    user_id: uid,                      // 接收者
    type: 'activity_update',           // 或 'system' / 'activity_cancel'（如你有该类型）
    content,                           // 文案
    related_activity_id: activityId,   // 关联活动
  }));

  const chunkSize = 500;
  const chunks = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  } 

  const inserted = [];

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(chunk, { returning: 'minimal' }); 

    if (error) {
      console.error('Error sending activity updated notifications:', error.message);
      throw new Error(error.message);
    }

    inserted.push(...(data || []));
  } 

  return 'success';
}

/**
 * 批量发送“活动即将开始”通知到指定用户。
 *
 * - 对 `recipientUserIds` 去重；若为空则打印警告并返回 `[]`（不写库）。
 * - 通知内容固定为 `"This activity is about to start."`。
 * - 以 500 条为一批写入 `notifications` 表，降低单次插入量导致的失败风险。
 * - 任一批次插入失败会抛出错误并中断后续写入。
 *
 * 写入到 `notifications` 表的字段：
 * - `user_id`: 接收者用户 ID
 * - `type`: `'activity_update'`
 * - `content`: 通知文案
 * - `related_activity_id`: 关联的活动 ID
 *
 * @async
 * @function sendStartingActivityNotification
 * @param {Array<string | number>} recipientUserIds - 待通知的用户 ID 列表（可重复，函数会自动去重）。
 * @param {string | number} activityId - 即将开始的活动 ID。
 * @returns {Promise<'success' | []>} 成功写入所有通知返回 `'success'`；收件人为空返回 `[]`。
 * @throws {Error} 当任一批次写入 `notifications` 表失败时抛出，错误信息来源于 Supabase。
 *
 * @example
 * // 成功写入
 * await sendStartingActivityNotification([1, 2, 2, 3], 42);
 * // => 'success'
 */
export async function sendStartingActivityNotification(recipientUserIds, activityId) {

  const recipients = Array.from(new Set(recipientUserIds || []));

  if (recipients.length === 0) {
    console.warn('No recipients to notify.');
    return [];
  }

  const content = "This activity is about to start.";

  const rows = recipients.map((uid) => ({
    user_id: uid,                      // 接收者
    type: 'activity_update',           // 或 'system' / 'activity_cancel'（如你有该类型）
    content,                           // 文案
    related_activity_id: activityId,   // 关联活动
  }));

  const chunkSize = 500;
  const chunks = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  } 

  const inserted = [];

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(chunk, { returning: 'minimal' }); 

    if (error) {
      console.error('Error sending activity starting notifications:', error.message);
      throw new Error(error.message);
    }

    inserted.push(...(data || []));
  } 

  return 'success';
}

/**
 * 向活动创建者发送“有参与者退出活动”的通知。
 *
 * - 若 `creatorUserId` 为空，则打印警告并返回 `[]`（不写库）。
 * - 通知内容固定为 `"A participant has quitted the activity."`。
 * - 向 `notifications` 表插入**单条**记录；插入失败会抛出错误。
 *
 * 写入到 `notifications` 表的字段：
 * - `user_id`: 接收者用户 ID（活动创建者）
 * - `type`: `'activity_update'`
 * - `content`: 通知文案
 * - `related_activity_id`: 关联的活动 ID
 * - `related_user_id`: 退出的参与者用户 ID
 *
 * @async
 * @function sendQuitActivityNotification
 * @param {string | number} creatorUserId - 活动创建者的用户 ID（通知接收者）。
 * @param {string | number} activityId - 活动 ID。
 * @param {string | number} participantUserId - 退出活动的参与者用户 ID。
 * @returns {Promise<'success' | []>} 成功插入返回 `'success'`；若 `creatorUserId` 为空则返回 `[]`。
 * @throws {Error} 当插入 `notifications` 表失败时抛出，错误信息来源于 Supabase。
 *
 * @example
 * // 成功发送单条通知
 * await sendQuitActivityNotification(1001, 42, 2002);
 * // => 'success'
 */
export async function sendQuitActivityNotification(creatorUserId, activityId, participantUserId) {

  if (!creatorUserId) {
    console.warn('No recipients to notify.');
    return [];
  }

  const content = "A participant has quitted the activity.";

  const row = {
    user_id: creatorUserId,                      // 接收者
    type: 'activity_update',           // 或 'system' / 'activity_cancel'（如你有该类型）
    content,                           // 文案
    related_activity_id: activityId,   // 关联活动
    related_user_id: participantUserId  // 关联用户
  };

  const { error } = await supabase
    .from('notifications')
    .insert(row, { returning: 'minimal' }); 

  if (error) {
    console.error('Error sending activity quitting notifications:', error.message);
    throw new Error(error.message);
  }

  return 'success';
}

/**
 * 向关注者发送"被关注用户创建了新活动"的通知
 * 
 * 此函数会：
 * 1. 验证必要参数
 * 2. 获取创建者的所有关注者
 * 3. 向这些关注者发送新活动通知
 *
 * @async
 * @function sendFollowingCreatedActivityNotification
 * @param {string | number} creatorUserId - 创建活动的用户ID（被关注者）
 * @param {string | number} activityId - 新创建的活动ID
 * @returns {Promise<'success'>} 当成功发送所有通知时返回 'success'
 * @throws {NotificationError} 当缺少必要参数时抛出错误
 * @throws {Error} 当通知发送失败时可能抛出其他错误
 * 
 */
export async function sendFollowingCreatedActivityNotification(creatorUserId, activityId) {
  if (!creatorUserId) {
    throw new NotificationError('Creator user ID is required to send notifications.');
  }

  if(!activityId) {
    throw new NotificationError('Activity ID is required to send notifications.');
  }

  await NotificationsService.sendFollowingCreatedActivityNotification(creatorUserId, activityId);
  return 'success';
}
