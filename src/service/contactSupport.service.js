import * as ContactSupportRepository from '../infrastructure/contactSupport.repository';

export async function sendContactSupportMessage(params) {
  const { userId, message } = params;

  const count = await ContactSupportRepository.countDailyMessages(userId);
  if (count >= 3) {
    return null;
  }

  const data = await ContactSupportRepository.addMessage({ userId, message });
  return data[0];
}