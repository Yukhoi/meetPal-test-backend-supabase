import { supabase } from "../supabaseClient";
import { SimpleMessageError } from "../exceptions/SimpleMessageError";

export async function sendTextMessage(params){
  const {contactId, content} = params;

  const { data, error } = await supabase
  .from('simple_messages')
  .insert({
    receiver_id: contactId,
    content: content,
    message_type: 'text',
    image_url: null
  })
  .select(`
    id, sender_id, receiver_id, content, message_type, image_url, is_read, created_at,
    profiles!simple_messages_sender_id_fkey ( first_name, avatar_url )
  `)
  .single();

  if (error){
    const friendlyReminder =
      error.code === '42501' || error.code === 'PGRST301' || error.status === 401 || error.status === 403
        ? 'You are not friends with this user yet. You can only send 2 messages before they follow you back.'
        : `Failed to send message: ${error.message}`;
    throw new SimpleMessageError(friendlyReminder);
  }

  return data;
}

export async function uploadImage(params){
  const { fileName, formData } = params;

  const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, formData, {
          contentType: 'image/jpeg',
          upsert: false
        });

  if (uploadError) {
    console.error('Image upload failed:', uploadError);
    if (uploadError.message?.includes('Bucket not found')) {
      throw new SimpleMessageError('Image storage temporarily unavailable, please contact administrator');
    } else if (uploadError.message?.includes('policy')) {
      throw new SimpleMessageError('No image upload permission, please contact administrator');
    } else {
      throw new SimpleMessageError(`Image upload failed: ${uploadError.message}`);
    }
  }

  return uploadData;
}

export async function getImagePublicURL(uploadData){
  const imageUrl = supabase.storage
    .from('chat-images')
    .getPublicUrl(uploadData.path).data.publicUrl;
  return imageUrl;
}

export async function sendImageMessage(params) {
  const { contactId, imageUrl, caption } = params;
  
  const { data, error } = await supabase
    .from('simple_messages')
    .insert([{
      receiver_id: contactId,
      content: caption,
      message_type: 'image',
      image_url: imageUrl
    }])
    .select(`
      id, sender_id, receiver_id, content, message_type, image_url, is_read, created_at,
      profiles!simple_messages_sender_id_fkey ( first_name, avatar_url )
    `)
    .single();

  if (error) {
    console.error('Failed to send image message:', error);

    if (error.code === '42501' || error.code === 'PGRST301' || error.status === 401 || error.status === 403) {
      throw new SimpleMessageError('You are not friends with this user yet. You can only send 2 messages before they follow you back.');
    } else if (error.message?.includes('p_image_url')) {
      throw new SimpleMessageError('Message system does not support image function yet, please contact administrator');
    } else {
      throw new SimpleMessageError(`Failed to send image message: ${error.message}`);
    }
  }

  return data;
} 