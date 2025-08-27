import { supabase } from '../supabaseClient'


/**
 * 从 Supabase 获取附近用户坐标
 * 依赖：已在数据库中创建 RPC: public.nearby_users(
 *   center_lng double precision, center_lat double precision,
 *   radius_m double precision default 50000, max_count integer default 100
 * ) RETURNS (user_id uuid, lat double precision, lng double precision, distance_m double precision, updated_at timestamptz)
 *
 * @param {{ lng:number, lat:number, radiusM?:number, maxCount?:number }} params
 * @returns {Promise<Array<{ userId:string, lat:number, lng:number, distanceM:number, updatedAt:string }>>}
 */
export async function getNearbyUsers({ lng, lat, radiusM = 50000, maxCount = 100 }) {
  const { data, error } = await supabase.rpc('nearby_users', {
    center_lng: lng,
    center_lat: lat,
    radius_m: radiusM,
    max_count: maxCount,
  });

  if (error) throw new Error(`nearby_users RPC failed: ${error.message}`);

  return (data ?? []).map(row => ({
    userId: row.user_id,
    lat: row.lat,
    lng: row.lng,
    distanceM: row.distance_m,
    updatedAt: row.updated_at,
  }));
}

/**
 * 更新当前用户的最近位置（upsert）
 *
 * @param {{ lat:number, lng:number, accuracyM?:number, sharing?:boolean }} p
 * @returns {Promise<{ userId:string, updatedAt:string }>}
 */
export async function updateUserLocation(p) {

  // 1) 当前登录用户
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(`Auth error: ${userErr.message}`);
  const user = userRes?.user;
  if (!user) throw new Error('Not signed in');

  // 2) 参数校验
  const { lat, lng, accuracyM=50, sharing=true } = p ?? {};
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('lat and lng must be numbers');
  }

  // 3) 组装地理点（经度在前）
  const ewkt = `SRID=4326;POINT(${lng} ${lat})`;

  // 4) upsert（以 user_id 为唯一键）
  const payload = {
    user_id: user.id,
    coordinates: ewkt,
  };
  if (typeof accuracyM === 'number') payload.accuracy_m = accuracyM;
  if (typeof sharing === 'boolean') payload.sharing = sharing;

  const { data, error } = await supabase
    .from('user_locations')
    .upsert(payload, { onConflict: 'user_id' })
    .select('user_id, updated_at')
    .single();

  if (error) throw new Error(`Upsert failed: ${error.message}`);

  return { userId: data.user_id, updatedAt: data.updated_at };
}

/**
 * 关闭位置共享（将 sharing=false）
 *
 * @returns {Promise<{ userId: string, sharing: boolean }>}
 */
export async function disableLocationSharing() {
  const { data: ures, error: uerr } = await supabase.auth.getUser();
  if (uerr) throw new Error(`Auth error: ${uerr.message}`);
  const user = ures?.user;
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('user_locations')
    .update({ sharing: false })
    .eq('user_id', user.id)
    .select('user_id, sharing')
    .single();

  if (error && error.code === 'PGRST116') {
    return { userId: user.id, sharing: false };
  }
  
  if (error) throw new Error(`Update failed: ${error.message}`);

  return { userId: data.user_id, sharing: data.sharing === false };
}

export async function fetchUsersDistance(selfUserId, targetUsersId){
  const { data, error } = await supabase
    .rpc('get_user_distances', {
      self_id: selfUserId,
      target_ids: targetUsersId
    });

  if (error) {
    console.error('获取距离失败:', error.message);
    throw error;
  }

  return data;
}
