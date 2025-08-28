import { supabase } from '../supabaseClient'

export async function fetchCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }

  return data;
}

export async function verifyPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Error verifying password:', error);
    return null;
  }

  return data;
}

export async function changePassword(email, newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    email,
    password: newPassword
  });

  if (error) {
    console.error('Error changing password:', error);
    return null;
  }

  return data;
}

export async function signOutGlobally() {
  const { error } = await supabase.auth.signOut({ scope: 'global' });

  if (error) {
    console.error('Error signing out globally:', error);
    return null;
  }

  return true;
}

export async function sendResetEmail(email) {

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    console.error('Error sending reset email:', error);
    return null;
  }
}
