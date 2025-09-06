import * as ActivitiesFeedbackRepository from '../infrastructure/activitiesFeedback.repository';

export async function addFeedback(params) {
  const { activityId, userId, feedback } = params;

  const data = await ActivitiesFeedbackRepository.addActivityFeedback({ activityId, userId, feedback });
  console.log('Added feedback:', data);
  return data[0];
}