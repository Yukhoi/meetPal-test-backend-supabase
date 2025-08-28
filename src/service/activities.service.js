import * as ActivitiesRepository from "../infrastructure/activities.repository";
import * as ActivitiesParticipantsService from "./activitiesParticipants.service";

export async function fetchActivitiesDetailsByQuery(query, page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const esc = (s) => (s ?? '').replace(/([,()])/g, '\\$1');

  const updatedQuery = esc(query);

  const data = await ActivitiesRepository.fetchActivitiesDetailsByQuery(updatedQuery, from, to);

  return data;
}

export async function fetchParticipantsNumbers(activityDetails) {
  const activitiesIds = activityDetails.map(activity => activity.id);

  const participants = await Promise.all(
    activitiesIds.map(async (id) => {
      const users = await ActivitiesParticipantsService.fetchParticipantsByActivityId(id);
      return { id, nbParticipants: users.length };
    })
  );

  return participants;
}

export function mergeActivitiesSearchDetails(params){

  const { fetchedActivitiesDetails, participantsNumbers } = params;

  const mergedDetails = fetchedActivitiesDetails.map(activity => {
    const participantInfo = participantsNumbers.find(p => p.id === activity.id);
    return {
      ...activity,
      nbParticipants: participantInfo ? participantInfo.nbParticipants : 0
    };
  });

  return mergedDetails;
}