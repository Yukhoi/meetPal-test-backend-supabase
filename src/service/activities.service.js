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

export async function fetchActivitiesByCategoryName(categoryName, pageSize = 20, page = 0, in24h = false) {
  const size = Math.max(1, Number(pageSize) || 20);
  const currentPage = Math.max(0, Number(page) || 0);
  const from = currentPage * size;
  const to   = from + size - 1;

  const now = new Date().toISOString();
  const timeIn24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const total = in24h
      ? await ActivitiesRepository.countActivitiesByCategoryNameIn24h({ categoryName, now, timeIn24h })
      : await ActivitiesRepository.countActivitiesByCategoryName({ categoryName });

  const pageCount = total === 0 ? 0 : Math.ceil(total / size);

  if (total === 0 || from >= total) {
    return {
      data: [],
      total,
      pageCount,
      hasMore: false,
      currentPage,
      size,
    };
  }

  const toClamped = Math.min(to, total - 1);

  const result = in24h
    ? await ActivitiesRepository.fetchActivitiesByCategoryNameIn24h({
        categoryName,
        from,
        to: toClamped,
        now,
        timeIn24h,
      })
    : await ActivitiesRepository.fetchActivitiesByCategoryName({
        categoryName,
        from,
        to: toClamped,
      });



  const { data } = result;

  const hasMore = (data?.length || 0) === size && currentPage < pageCount - 1;

  return { data, total, pageCount, hasMore, currentPage, size };
}