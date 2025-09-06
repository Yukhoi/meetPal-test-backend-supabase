import { supabase } from "../supabaseClient";
import { NotificationError } from "../exceptions/NotificationError";

export async function sendNotification(row) {
  const { error } = await supabase
    .from('notifications')
    .insert(row, { returning: 'minimal' });

  if (error) {
    console.error('Error sending notification:', error.message);
    throw new NotificationError(error.message);
  }
}