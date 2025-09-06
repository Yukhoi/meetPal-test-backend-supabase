import { supabase } from "../supabaseClient";
import { ContactSupportError } from "../exceptions/ContactSupportError";

export async function countDailyMessages(userId) {
  const { count, error } = await supabase
    .from('contact_support')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date().toISOString().slice(0, 10))
    
    if (error) {
      throw new ContactSupportError('Error counting daily messages', error.message);
    }

    return count ?? 0;
}

export async function addMessage(params){
  const { userId, message } = params;

  const { data, error } = await supabase
    .from('contact_support')
    .insert([{ user_id: userId, message }])
    .select()

  if (error) {
    throw new ContactSupportError('Error adding contact support message', error.message);
  }

  return data;
}