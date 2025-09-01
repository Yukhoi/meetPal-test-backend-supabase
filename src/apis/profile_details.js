
import { supabase } from '../supabaseClient'
import * as ProfileDetailsService from "../service/profileDetails.service";
import * as AuthService from "../service/auth.service";
import * as ProfilesService from "../service/profiles.service";
import * as UserLocationService from "../service/userLocation.service";


// 定义多值类型字段
const MULTI_VALUE_TYPES = new Set([
  'university', 
  'language', 
  'favourite_sports', 
  'favourite_animals', 
  'pets_owned',
  'favorite_artist',
  'favorite_cuisine',
  'desired_travel_destination'
]);

/**
 * 获取用户的个人资料详情。
 * 
 * 此函数从 Supabase 数据库中检索两个用户的个人资料详情：
 * 1. 根据 `loggedUserId` 获取当前登录用户的个人资料详情。
 * 2. 根据 `fetchedUserId` 获取目标用户的个人资料详情，并筛选出与登录用户的类型匹配的记录。
 * 
 * @async
 * @function getProfileDetails
 * @param {string} loggedUserId - 当前登录用户的 ID。
 * @param {string} fetchedUserId - 目标用户的 ID。
 * @returns {Promise<Array<Object>>} 返回目标用户的个人资料详情数组。
 * @throws {Error} 如果在检索数据时发生错误，将抛出错误。
 */
const getProfileDetails = async (loggedUserId, fetchedUserId) => {
  const { data: loggedUserDetails, error: loggedUserError } = await supabase
    .from('profile_details')
    .select('*')
    .eq('profile_id', loggedUserId);

  if (loggedUserError) {
    throw new Error(loggedUserError.message)
  }

  const typeArray = loggedUserDetails.map(item => item.type);

  if (loggedUserId === fetchedUserId) {
    // 如果两个用户是同一个人，直接返回当前用户的详情
    return multiValueTypeHandling(loggedUserDetails, typeArray);
  }


  const { data: fetchedUserDetails, error: fetchedUserError } = await supabase
    .from('profile_details')
    .select('*')
    .eq('profile_id', fetchedUserId)

  if (fetchedUserError) {
    throw new Error(fetchedUserError.message);
  }

  return multiValueTypeHandling(fetchedUserDetails, typeArray);
}

const multiValueTypeHandling = (fetchedData, typeArray) => {
  const resultDetails = {}
  let firstName = ''
  let lastName = ''
  for (const item of fetchedData) {
    const { type, value, value2 } = item;
    if (MULTI_VALUE_TYPES.has(type)) {
        // 多值类型处理
        if (!resultDetails[type]) {
          resultDetails[type] = [];
        }
        // 对于有二级信息的字段（如语言-熟练度）
        if (type === 'language' || type === 'favourite_sports' || type === 'pets_owned') {
          resultDetails[type].push({ value: value, value2: value2, display: typeArray.includes(type) });
        } else {
          // 普通多值字段
          resultDetails[type].push({ value: value, display: typeArray.includes(type) });
        }
      } else {
        if (type === 'first_name') {
          firstName = value;
        } else if (type === 'last_name') {
          lastName = value;
        } else {
          // 其他单值字段
          resultDetails[type] = { value: value, display: typeArray.includes(type) };
        }
      }
  }
  // 添加 firstName 和 lastName 到结果中
  resultDetails.name = { value: `${firstName} ${lastName}`, display: true };
  return resultDetails;
};

export async function searchUser(query, page = 1, pageSize = 10) {

  const currentUser = await AuthService.fetchCurrentUser();

  const profileIds = await ProfileDetailsService.fetchIdsByQuery(query);

  const profileDetails = await ProfileDetailsService.fetchProfileDetailsByIdsForSearch(profileIds, page, pageSize);

  const avatarUrls = await ProfilesService.fetchUserAvatarURLbyIds(profileIds);

  const distances = await UserLocationService.fetchUsersDistance(currentUser.id, profileIds);

  const mergedDetails = ProfileDetailsService.mergeSearchResults({
    profileDetails,
    avatarUrls,
    distances
  });

  return mergedDetails;
}

export async function getUserList(page = 1, pagesize = 10) {

  const currentUser = await AuthService.fetchCurrentUser();

  const userIds = await ProfilesService.fetchAllIds(page, pagesize, currentUser.id);

  const profileDetails = await ProfileDetailsService.fetchProfileDetailsByIdsForSearch(userIds, page, pagesize);

  const avatarUrls = await ProfilesService.fetchUserAvatarURLbyIds(userIds);

  const mergedDetails = ProfileDetailsService.mergeFirstPageResults({
    profileDetails,
    avatarUrls
  });

  return mergedDetails;

}

export { getProfileDetails };
