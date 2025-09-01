import * as AuthRepository from "../infrastructure/auth.repository";

export async function fetchCurrentUser() {
  
  const data = await AuthRepository.fetchCurrentUser();

  return data.user;
}

export async function verifyOldPassword(params) {

  const { email, oldPassword } = params;

  await AuthRepository.verifyPassword(email, oldPassword);
}

export async function changePassword(newPassword) {
  try {
    await AuthRepository.changePassword(newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

export async function signOutGlobally() {
  await AuthRepository.signOutGlobally();
}

export async function sendResetEmail(email) {
  await AuthRepository.sendResetEmail(email);
}
