import { supabase } from "../supabaseClient";
import { FollowsError } from "../exceptions/FollowsError";

export async function fetchFollowers(userId) {
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);

  if (error) {
    console.error("Error fetching followers:", error.message);
    throw new FollowsError("Error fetching followers", error.message);
  }

  return data;
}
