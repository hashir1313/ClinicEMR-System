import { createClient as createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Doctor } from '@/types';

async function getClient() {
  return await createServerClient();
}

export async function getSession() {
  const supabase = await getClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getDoctorFromSession(): Promise<Doctor | null> {
  const supabase = await getClient();
  
  console.log('=== SERVER AUTH CHECK ===');
  
  // First, let's see ALL doctors in the database
  const { data: allDoctors } = await supabase.from('doctors').select('*');
  console.log('All doctors in DB:', allDoctors);
  
  // Check session
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session exists:', !!session);
  
  if (!session) {
    console.log('No session - returning null');
    return null;
  }
  
  const userEmail = session.user.email;
  console.log('User email from session:', userEmail);
  
  // Try to find doctor by exact email match
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', userEmail)
    .maybeSingle();
  
  console.log('Doctor query result:', { doctor, error: doctorError });
  
  if (doctorError) {
    console.log('Doctor query error:', doctorError.message);
  }
  
  if (!doctor) {
    console.log('No matching doctor found for email:', userEmail);
    console.log('=== END AUTH CHECK ===');
    return null;
  }
  
  console.log('Found doctor:', doctor.id);
  console.log('=== END AUTH CHECK ===');
  
  return doctor as Doctor;
}

export async function requireAuth() {
  const doctor = await getDoctorFromSession();
  
  if (!doctor) {
    redirect('/login');
  }
  
  return doctor;
}

export async function signIn(email: string, password: string) {
  const supabase = await getClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function signOut() {
  const supabase = await getClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function checkAuth() {
  const supabase = await getClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}