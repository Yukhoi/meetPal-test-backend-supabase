import * as ProfileRepository from "../infrastructure/profiles.repository";

export async function fetchUserAvatarURLbyIds(userIds) {
  const data = await ProfileRepository.fetchUserAvatarURLbyIds(userIds);

  return data.map(row => ({
    id: row.id,
    avatarUrl: row.avatar_url
  }));
}
