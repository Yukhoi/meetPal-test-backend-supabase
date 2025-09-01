import * as simpleMessageRepository from "../infrastructure/simpleMessage.repository"

export async function sendTextMessage(params){
  const { contactId, content } = params;
  const result = await simpleMessageRepository.sendTextMessage({ contactId, content });
  return result;
}

export async function sendImageMessage(params){
  const { contactId, imageUrl, caption, currentUserId } = params;

  const fileName = `${currentUserId}/${Date.now()}-chat-image.jpg`;

  const formData = new FormData();
  formData.append('file', {
    uri: imageUrl,
    type: 'image/jpeg',
    name: 'chat-image.jpg',
  });

  const uploadResult = await simpleMessageRepository.uploadImage({ fileName, formData });

  const imagePublicUrl = await simpleMessageRepository.getImagePublicURL(uploadResult);

  const result = await simpleMessageRepository.sendImageMessage({contactId, imagePublicUrl, caption});

  return result;
}