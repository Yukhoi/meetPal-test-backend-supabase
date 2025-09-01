import * as ProfileDetailsRepository from "../infrastructure/profileDetails.repository";
import { calculateAge } from "../helpers/helpers";

export async function fetchIdsByQuery(query) {

  const data = await ProfileDetailsRepository.fetchIdsByQuery(query);

  const profileIds = [...new Set(data?.map(row => row.profile_id))];

  return profileIds;
}

export async function fetchProfileDetailsByIdsForSearch(profileId, page = 1, pageSize = 10) {

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (profileId.length !== 0) {
    const { data, count } = await ProfileDetailsRepository.fetchProfileDetailsByIdsForSearch(profileId, from, to);

    data.forEach(profile => {
      profile.props.age = calculateAge(profile.props.birth_date);
      delete profile.props.birth_date;
    });

    return { data, total: count ?? 0, page, pageSize };
  } else {
    return { data: [], total: 0, page, pageSize };
  }
};

export function mergeSearchResults(params) {

  const { profileDetails, avatarUrls, distances } = params;

  return profileDetails.data.map(profile => {

    const avatar = avatarUrls.find(url => url.id === profile.profile_id);
    const distance = distances.find(dist => dist.userId === profile.id);

    return {
      ...profile,
      avatarUrl: avatar?.avatarUrl,
      distance: distance ? Math.floor(distance.distance_m / 1000) : null
    };
  });
}

export function mergeFirstPageResults(params) {

  const { profileDetails, avatarUrls } = params;

  return profileDetails.data.map(profile => {
    const avatar = avatarUrls.find(url => url.id === profile.profile_id);
    return {
      ...profile,
      avatarUrl: avatar?.avatarUrl,
    };
  });
}
