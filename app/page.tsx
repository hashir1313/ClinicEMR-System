import { redirect } from 'next/navigation';
import { getDoctorFromSession } from '@/services/auth-server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const doctor = await getDoctorFromSession();
  
  if (doctor) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}