import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import type { Doctor } from '@/types';

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getDoctorFromSession(): Promise<Doctor | null> {
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  // Try to get doctor, but if RLS blocks it, still return user info
  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();
  
  if (doctor) {
    return doctor as Doctor;
  }
  
  // Return user as doctor if no doctor record found (fallback for client)
  return { id: user.id, email: user.email || '', created_at: '' };
}

export async function requireAuth() {
  const doctor = await getDoctorFromSession();
  
  if (!doctor) {
    redirect('/login');
  }
  
  return doctor;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Force refresh to ensure session is set in cookies
  await supabase.auth.refreshSession();
  
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function checkAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}