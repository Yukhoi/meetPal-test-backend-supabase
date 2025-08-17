import { supabase } from '../supabaseClient'

/**
 * 发表评论或回复
 * 依赖：全局已初始化好的 supabase 客户端
 *
 * @param {string} activityId - 活动 UUID
 * @param {string} content - 评论内容（必填）
 * @param {{ parentId?: string }} [opts]
 * @returns {Promise<{status: 'ok'|'invalid'|'unauthenticated'|'error', comment?: any, error?: any}>}
 */
export async function postComment(activityId, userId, content, opts = {}) {
  const { parentId = null } = opts;

  // 2) 校验内容
  const text = (content ?? '').trim();
  if (!text) return { status: 'invalid', error: new Error('Content cannot be empty') };

  // 3) 如为回复，校验父评论
  if (parentId) {
    const { data: parent, error: parentErr } = await supabase
      .from('activity_comments')
      .select('id, activity_id, deleted_at')
      .eq('id', parentId)
      .maybeSingle();

    if (parentErr) return { status: 'error', error: parentErr };
    if (!parent)  return { status: 'invalid', error: new Error('The parent comment does not exist') };
    if (parent.deleted_at) return { status: 'invalid', error: new Error('The parent comment has been deleted') };
    if (parent.activity_id !== activityId) {
      return { status: 'invalid', error: new Error('The parent comment does not belong to this activity') };
    }
  }

  // 4) 插入评论（RLS：需要 insert 策略允许 auth.uid() = user_id）
  const { data, error } = await supabase
    .from('activity_comments')
    .insert([{ activity_id: activityId, user_id: userId, parent_id: parentId, content: text }])
    .select()   // 返回插入记录
    .single();  // 只取一条

  if (error) return { status: 'error', error };
  return { status: 'ok', comment: data };
}

/**
 * 软删除评论（级联软删其子孙）
 * 依赖：已在数据库创建 after update of deleted_at 的级联软删触发器
 * RLS：请确保允许作者 update 自己的评论（auth.uid() = user_id），
 *      管理员可在服务端用 service role 客户端调用（绕过 RLS）
 *
 * @param {string} commentId - 评论主键 UUID（或你的类型）
 * @param {{ asAdmin?: boolean, supabaseClient?: any }} [opts]
 *   - asAdmin: 在服务端使用 service role 客户端时可设为 true（跳过前端的作者校验）
 *   - supabaseClient: 传入你初始化好的 supabase 客户端；默认使用全局 supabase
 * @returns {Promise<{status: 'deleted'|'already deleted'|'not found'|'forbidden'|'unauthenticated'|'error', comment?: any, error?: any}>}
 */
export async function deleteComment(commentId, userId, opts = {}) {
  const { asAdmin = false } = opts;

  // 2) 取评论做基本校验（存在性/归属/是否已删）
  const { data: comment, error: fetchErr } = await supabase
    .from('activity_comments')
    .select('id, user_id, deleted_at')
    .eq('id', commentId)
    .maybeSingle();

  if (fetchErr) return { status: 'error', error: fetchErr };
  if (!comment)  return { status: 'not found' };
  if (comment.deleted_at) return { status: 'already deleted' };
  if (!asAdmin && comment.user_id !== userId) {
    return { status: 'forbidden', error: new Error('无权删除该评论') };
  }

  // 3) 软删除（触发器会级联软删子孙，并同步 comments_count）
  const nowIso = new Date().toISOString();
  const { data, error: updErr } = await supabase
    .from('activity_comments')
    .update({ deleted_at: nowIso, deleted_by: userId }) // 若无 deleted_by 列，可去掉
    .eq('id', commentId)
    .select()
    .single();

  if (updErr) return { status: 'error', error: updErr };
  return { status: 'deleted', comment: data };
}

/**
 * 获取某活动的所有未删除评论（树结构 + 扁平原始数据）
 * 依赖：已初始化好的 supabase 客户端实例（全局变量 supabase）
 *
 * @param {string} activityId - 活动 UUID
 * @returns {Promise<{status: 'ok'|'error', tree?: any[], flat?: any[], error?: any}>}
 * 返回树形评论结构和扁平列表示例
 * {
  "status": "ok",
  "tree": [
    {
      "id": "ccb9522c-62d5-49f1-b76b-e2ccee7cca70",
      "parent_id": null,
      "activity_id": "05aa177a-277b-4c43-8979-d5695dc1565f",
      "user_id": "36231020-693c-4ccc-810c-8cc7f7c4135e",
      "content": "这是一个测试评论",
      "created_at": "2025-08-15T08:53:52.560214+00:00",
      "updated_at": "2025-08-15T08:53:52.560214+00:00",
      "edited": false,
      "children": [
        {
          "id": "99f23d9e-9b5e-4f06-bc91-d326554f7026",
          "parent_id": "ccb9522c-62d5-49f1-b76b-e2ccee7cca70",
          "activity_id": "05aa177a-277b-4c43-8979-d5695dc1565f",
          "user_id": "36231020-693c-4ccc-810c-8cc7f7c4135e",
          "content": "这是一个测试评论的回复",
          "created_at": "2025-08-15T08:55:34.853222+00:00",
          "updated_at": "2025-08-15T08:55:34.853222+00:00",
          "edited": false,
          "children": []
        },
        {
          "id": "b7183d70-7b75-40dd-bc43-342463fab036",
          "parent_id": "ccb9522c-62d5-49f1-b76b-e2ccee7cca70",
          "activity_id": "05aa177a-277b-4c43-8979-d5695dc1565f",
          "user_id": "36231020-693c-4ccc-810c-8cc7f7c4135e",
          "content": "这是一个测试评论的回复2",
          "created_at": "2025-08-15T08:57:15.333279+00:00",
          "updated_at": "2025-08-15T08:57:15.333279+00:00",
          "edited": false,
          "children": []
        }
      ]
    }
  ],
  "flat": [
    {
      "id": "ccb9522c-62d5-49f1-b76b-e2ccee7cca70",
      "parent_id": null,
      "activity_id": "05aa177a-277b-4c43-8979-d5695dc1565f",
      "user_id": "36231020-693c-4ccc-810c-8cc7f7c4135e",
      "content": "这是一个测试评论",
      "created_at": "2025-08-15T08:53:52.560214+00:00",
      "updated_at": "2025-08-15T08:53:52.560214+00:00",
      "edited": false
    },
    {
      "id": "99f23d9e-9b5e-4f06-bc91-d326554f7026",
      "parent_id": "ccb9522c-62d5-49f1-b76b-e2ccee7cca70",
      "activity_id": "05aa177a-277b-4c43-8979-d5695dc1565f",
      "user_id": "36231020-693c-4ccc-810c-8cc7f7c4135e",
      "content": "这是一个测试评论的回复",
      "created_at": "2025-08-15T08:55:34.853222+00:00",
      "updated_at": "2025-08-15T08:55:34.853222+00:00",
      "edited": false
    },
    {
      "id": "b7183d70-7b75-40dd-bc43-342463fab036",
      "parent_id": "ccb9522c-62d5-49f1-b76b-e2ccee7cca70",
      "activity_id": "05aa177a-277b-4c43-8979-d5695dc1565f",
      "user_id": "36231020-693c-4ccc-810c-8cc7f7c4135e",
      "content": "这是一个测试评论的回复2",
      "created_at": "2025-08-15T08:57:15.333279+00:00",
      "updated_at": "2025-08-15T08:57:15.333279+00:00",
      "edited": false
    }
  ]
}
 */
export async function getActivityCommentsTree(activityId) {
  // 1) 拉取扁平列表（未删除，按时间升序，便于后续稳定构树）
  const { data, error } = await supabase
    .from('activity_comments')
    .select('id, parent_id, activity_id, user_id, content, created_at, updated_at, edited')
    .eq('activity_id', activityId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) return { status: 'error', error };

  // 2) 组装为树
  const map = new Map();       // id -> node
  const roots = [];            // 顶层评论（parent_id 为 null）

  // 先建节点
  for (const row of data) {
    map.set(row.id, { ...row, children: [] });
  }

  // 再挂父子关系
  for (const node of map.values()) {
    if (node.parent_id) {
      const parent = map.get(node.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // 理论上不会发生（父评论被删/过滤），兜底当作顶层
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // 3) 递归排序（按 created_at 升序）
  const sortRecursively = (nodes) => {
    nodes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (const n of nodes) sortRecursively(n.children);
  };
  sortRecursively(roots);

  return { status: 'ok', tree: roots, flat: data };
}
