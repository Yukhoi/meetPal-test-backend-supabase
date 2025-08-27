import { supabase } from "../supabaseClient";
/**
 * 按“分类名字”获取活动列表（支持分页与总数统计），并联表返回 creator / category / photos。
 *
 * @param {string} categoryName  分类名（需与 activity_categories.name 完全匹配）
 * @param {number} [pageSize=20] 每页条数（>=1）
 * @param {number} [page=0]      页码，从 0 开始：0=第 1 页，1=第 2 页...
 *
 * @returns {Promise<{
 *   activities: Array<{
 *     // —— 来自 activities 表的所有字段，例如：id, title, description, start_time, end_time, ...
 *     // 下方为联表字段（已在 select 中起了别名或限定列）：
 *     creator: object,              // profiles 表的整行
 *     category: { id: string, name: string }, // activity_categories 的部分列，这里只取 id 与 name
 *     photos: Array<object>         // activity_photos 表的整行数组
 *   }>,
 *   total: number,      // 满足筛选条件的“总记录数”（用于算总页数/显示总量）
 *   page: number,       // 当前页码（回显你传入的 page）
 *   pageSize: number,   // 当前每页条数（回显你传入的 pageSize）
 *   hasMore: boolean    // 是否还有下一页；true 代表还能继续加载
 * }>}
 *
 * 说明：
 * - activities：已按 created_at 倒序分页，且只包含 status='planned' 的记录（如需取消可去掉对应 .eq）。
 * - total：依赖 { count: 'exact' }，是所有页合计的数量，不仅仅是当前页。
 * - hasMore：基于当前页返回条数、page 与 total 计算得出。
 */
export async function fetchActivitiesByCategoryName(categoryName, pageSize = 20, page = 0) {
  // 基本的参数兜底与分页区间计算
  const size = Math.max(1, Number(pageSize) || 20);
  const currentPage = Math.max(0, Number(page) || 0);
  const from = currentPage * size;
  const to   = from + size - 1;

  const { data, error, count } = await supabase
    .from('activities')
    .select(
      `
      *,
      creator:profiles(*),                 
      category:activity_categories!inner(id,name),
      photos:activity_photos(*)            
      `,
      { count: 'exact' }                   // 同时返回总数 total
    )
    .eq('category.name', categoryName)     // 关键：用上面起的别名 category 按分类名过滤
    .eq('status', 'planned')               // 只取计划中的活动；想要全部可删除本行
    .order('created_at', { ascending: false })
    .range(from, to);                      // 分页（包含端点）

  if (error) {
    console.error('按分类获取活动失败:', error);
    throw error;
  }

  const total = count || 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / size);
  const hasMore = (data?.length || 0) === size && currentPage < pageCount - 1;

  return {
    activities: data || [],
    total,            // 符合条件的总记录数
    page: currentPage,
    pageSize: size,
    hasMore           // 是否还有下一页
  };
}


/**
 * 根据活动 ID 查询其创建者（creator_id）。
 *
 * 该函数从 Supabase 的 `activities` 表中筛选出指定 `id` 的记录，
 * 并返回其 `creator_id`。如果活动不存在或没有 `creator_id` 字段，则返回 `null`。
 * 查询失败时会在控制台输出错误并抛出异常。
 *
 * @async
 * @function fetchCreatorByActivityId
 * @param {string | number} activityId - 活动的唯一标识 ID。
 * @returns {Promise<string | number | null>} 查询到的创建者 ID；若无记录或无字段则为 `null`。
 * @throws {Error} 当 Supabase 查询发生错误时抛出（同时会在控制台打印错误信息）。
 *
 * @example
 * 'a1bc7c76-3f9b-49e8-b780-28aa87003b35' => 'd4e5f6g7-8h9i-0j1k-2l3m-4n5o6p7q8r9s'
*/

export async function fetchCreatorByActivityId(activityId) {
  const { data, error } = await supabase
    .from('activities')
    .select('creator_id')
    .eq('id', activityId)
    .single();

  if (error) {
    console.error('Error fetching activity creator:', error);
    throw error;
  }

  return data?.creator_id || null;
}
