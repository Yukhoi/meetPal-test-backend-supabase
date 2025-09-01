import * as ProfileRepository from "../infrastructure/profiles.repository";

export async function fetchUserAvatarURLbyIds(userIds) {
  const data = await ProfileRepository.fetchUserAvatarURLbyIds(userIds);

  return data.map(row => ({
    id: row.id,
    avatarUrl: row.avatar_url
  }));
}

export async function fetchAllIds(page = 1, pageSize = 10, currentUserId) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const data = await ProfileRepository.fetchAllIds(from, to, currentUserId);

  const profileIds = [...new Set(data?.map(row => row.id))];

  return profileIds;
}
