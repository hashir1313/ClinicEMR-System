import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Patient, PatientFormData, Visit, VisitFormData } from '@/types';

async function getClient() {
  return await createServerClient();
}

export async function getDoctor(doctorId: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', doctorId)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createPatient(doctorId: string, data: PatientFormData) {
  const supabase = await getClient();
  const { data: patient, error } = await supabase
    .from('patients')
    .insert({ doctor_id: doctorId, ...data })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return patient;
}

export async function updatePatient(id: string, data: Partial<PatientFormData>) {
  const supabase = await getClient();
  const { data: patient, error } = await supabase
    .from('patients')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return patient;
}

export async function deletePatient(id: string) {
  const supabase = await getClient();
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
}

export async function getPatient(id: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(error.message);
  return data as Patient;
}

export async function getPatients(doctorId: string, search?: string) {
  const supabase = await getClient();
  
  let query = supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });
  
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,id.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return data as Patient[];
}

export async function createVisit(patientId: string, data: VisitFormData) {
  const supabase = await getClient();
  const { data: visit, error } = await supabase
    .from('visits')
    .insert({ patient_id: patientId, ...data })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return visit as Visit;
}

export async function updateVisit(id: string, data: Partial<VisitFormData & { prescription_image_url?: string; prescription_json_url?: string }>) {
  const supabase = await getClient();
  const { data: visit, error } = await supabase
    .from('visits')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return visit as Visit;
}

export async function deleteVisit(id: string) {
  const supabase = await getClient();
  const { error } = await supabase
    .from('visits')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
}

export async function getVisit(id: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(error.message);
  return data as Visit;
}

export async function getVisitsByPatient(patientId: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data as Visit[];
}