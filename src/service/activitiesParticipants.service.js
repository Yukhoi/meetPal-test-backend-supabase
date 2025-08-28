import * as activitiesParticipantsRepository from "../infrastructure/activitiesParticipants.repository";

export async function fetchParticipantsByActivityId(activityId) {
  
  const data = await activitiesParticipantsRepository.fetchParticipantsByActivityId(activityId);

  const participants = data.map(participant => (participant.user_id));

  return participants;
};
