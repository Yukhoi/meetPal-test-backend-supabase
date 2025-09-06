import { ActivitiesFeedbackError } from "../exceptions/ActivitiesFeedbackError";
import { supabase } from "../supabaseClient";

export async function addActivityFeedback(params) {
  const { activityId, userId, feedback } = params;

  const { data, error } = await supabase
  .from('activity_feedback')
  .insert([
    {
      activity_id: activityId,
      reviewer_id: userId,
      overall: feedback.overall,
      went_well: feedback.wentWell,
      went_wrong: feedback.wentWrong,
      comments: feedback.comments
    }
  ])
  .select() 

  if (error) {
    if (error.code === '23505') {
      throw new ActivitiesFeedbackError('You can only submit feedback once for each activity.');
    }
  }

  console.log('Insert feedback response:', { data, error });

  return data;
}