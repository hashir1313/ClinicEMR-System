import { redirect } from 'next/navigation';
import { getDoctorFromSession } from '@/services/auth-server';
import { getPatients, getVisitsByPatient } from '@/services/database-server';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

interface VisitWithPatient {
  id: string;
  patient_id: string;
  created_at: string;
  diagnosis: string;
  symptoms: string;
  patient_name: string;
}

export default async function DashboardPage() {
  const doctor = await getDoctorFromSession();
  
  if (!doctor) {
    redirect('/login');
  }

  const patients = await getPatients(doctor.id);
  
  // Get all visits with patient info
  const allVisits: VisitWithPatient[] = [];
  for (const patient of patients) {
    const visits = await getVisitsByPatient(patient.id);
    for (const visit of visits) {
      allVisits.push({
        ...visit,
        patient_name: patient.full_name,
      });
    }
  }
  
  // Sort by date descending
  allVisits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const recentVisits = allVisits.slice(0, 5);
  const recentPatients = patients.slice(0, 5);
  
  // Calculate stats
  const totalPatients = patients.length;
  const totalVisits = allVisits.length;
  const visitsWithPrescriptions = allVisits.filter(v => v.diagnosis).length;
  
  // This week's visits
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekVisits = allVisits.filter(v => new Date(v.created_at) >= oneWeekAgo).length;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Dashboard</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Welcome back, Dr. {doctor.email.split('@')[0]}</p>
        </div>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>👥</span>
              <div>
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{totalPatients}</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Patients</p>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
              <div>
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{totalVisits}</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Visits</p>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>📅</span>
              <div>
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{thisWeekVisits}</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Visits this Week</p>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>💊</span>
              <div>
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{visitsWithPrescriptions}</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Prescriptions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/patients/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>➕</span> New Patient
          </Link>
          <Link href="/patients" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👥</span> All Patients
          </Link>
          <Link href="/visits" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📋</span> All Visits
          </Link>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          {/* Recent Patients */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Patients</h2>
              <Link href="/patients" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                View All →
              </Link>
            </div>
            
            {recentPatients.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                No patients yet.
              </div>
            ) : (
              <div>
                {recentPatients.map((patient) => (
                  <div key={patient.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Link href={`/patients/${patient.id}`} style={{ color: '#111827', fontWeight: '500', textDecoration: 'none' }}>
                        {patient.full_name}
                      </Link>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Age: {patient.age} • {patient.gender}</p>
                    </div>
                    <Link href={`/patients/${patient.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Visits */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Visits</h2>
              <Link href="/visits" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                View All →
              </Link>
            </div>
            
            {recentVisits.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                No visits yet.
              </div>
            ) : (
              <div>
                {recentVisits.map((visit) => (
                  <div key={visit.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Link href={`/patients/${visit.patient_id}`} style={{ color: '#111827', fontWeight: '500', textDecoration: 'none' }}>
                        {visit.patient_name}
                      </Link>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {visit.diagnosis || visit.symptoms || 'No diagnosis'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {new Date(visit.created_at).toLocaleDateString()}
                      </p>
                      <Link href={`/patients/${visit.patient_id}/visits/${visit.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.75rem' }}>
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}