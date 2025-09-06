import * as FollowsService from '../service/follows.service';
import * as NotificationsRepository from '../infrastructure/notifications.repository';

export async function sendFollowingCreatedActivityNotification(creatorUserId, activityId) {
  const followerIds = await FollowsService.fetchFollowers(creatorUserId);

  if (followerIds.length === 0) {
    console.info('No followers to notify.');
    return;
  }

  const content = "Your followed user has created a new activity.";

  const rows = followerIds.map((uid) => ({
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

  for (const chunk of chunks) {
    await NotificationsRepository.sendNotification(chunk);
  }

}