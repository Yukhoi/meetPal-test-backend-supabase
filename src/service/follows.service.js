import * as FollowsRepository from '../infrastructure/follows.repository';

export async function fetchFollowers(userId) {
  const data = await FollowsRepository.fetchFollowers(userId);
  return data.map(follow => follow.follower_id);
}
