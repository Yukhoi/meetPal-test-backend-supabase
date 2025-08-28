import * as UserLocationRepository from "../infrastructure/userLocations.repository";

export async function fetchUsersDistance(selfUserId, targetUsersId){
  const distances = await UserLocationRepository.fetchUsersDistance(selfUserId, targetUsersId);
  return distances;
}
