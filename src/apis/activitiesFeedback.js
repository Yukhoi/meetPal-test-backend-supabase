import { ActivitiesFeedbackError } from "../exceptions/ActivitiesFeedbackError";
import * as ActivitiesFeedbackService from "../service/activitiesFeedback.service";
import * as ActivitiesParticipantsService from "../service/activitiesParticipants.service";

/**
 * 添加活动反馈
 * 
 * 允许活动参与者提交对活动的反馈评价。此函数会：
 * 1. 验证所有必需参数
 * 2. 确保包含总体评分
 * 3. 验证用户是否为活动参与者
 * 4. 提交反馈并返回结果
 *
 * @async
 * @function addActivityFeedback
 * @param {string|number} activityId - 要评价的活动ID
 * @param {string|number} userId - 提交反馈的用户ID
 * @param {Object} feedback - 反馈内容
 * @param {string} feedback.overall - 必需的总体评价 （'positive', 'negative'），注意大小写
 * @param {Array[string]} [feedback.went_well] - 可选的正面反馈细节 ('funny','friendly','comfortable_vibe','shared_interest')，注意大小写
 * @param {Array[string]} [feedback.went_wrong] - 可选的负面反馈细节 ('late','rude_aggressive','no_show','boring')，注意大小写
 * @param {string} [feedback.comments] - 文字评价
 *
 * @returns {Promise<Object>} 返回已保存的反馈信息（不包含审核者ID）
 * @property {string|number} id - 反馈记录ID
 * @property {number} overall - 总体评分
 * @property {string} [comment] - 文字评价
 * @property {Object} [ratings] - 细分评分
 * @property {string} createdAt - 创建时间
 * 
 * @throws {ActivitiesFeedbackError} 当：
 * - 缺少必需参数时
 * - 未提供总体评分时
 * - 用户不是活动参与者时
 * 
 */
export async function addActivityFeedback(activityId, userId, feedback) {

  if (!activityId || !userId || !feedback) {
    throw new ActivitiesFeedbackError('Missing required parameters: activityId, userId, and feedback are all required.');
  }

  if ( feedback.overall === undefined ) {
    throw new ActivitiesFeedbackError('You must provide an overall feedback rating.');
  }
  if (!await ActivitiesParticipantsService.isValidParticipant(activityId, userId)) {
    throw new ActivitiesFeedbackError('You can only submit feedback if you are a participant in the activity.');
  }

  const { reviewerId: _REVIEWER_ID, ...result } = await ActivitiesFeedbackService.addFeedback({ activityId, userId, feedback });
  return result;
}