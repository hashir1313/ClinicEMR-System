'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getPatient, getVisitsByPatient, deletePatient } from '@/services/database';
import { deletePrescriptionFiles } from '@/services/storage';
import Navbar from '@/components/Navbar';
import type { Patient, Visit } from '@/types';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const patientData = await getPatient(params.id as string);
        setPatient(patientData);
        
        const visitsData = await getVisitsByPatient(params.id as string);
        setVisits(visitsData);
      } catch (err) {
        console.error(err);
        router.push('/patients');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient? This will also delete all visits and prescriptions.')) {
      return;
    }

    setDeleting(true);
    try {
      for (const visit of visits) {
        if (visit.prescription_image_url && visit.prescription_json_url) {
          await deletePrescriptionFiles(visit.prescription_image_url, visit.prescription_json_url);
        }
      }
      
      await deletePatient(params.id as string);
      router.push('/patients');
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>Patient not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/patients" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block', marginBottom: '0.5rem' }}>
            ← Back to Patients
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{patient.full_name}</h1>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                <span>👤 {patient.gender}</span>
                <span>🎂 {patient.age} years</span>
                <span>📞 {patient.phone}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                href={`/patients/${params.id}/edit`}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                ✏️ Edit Patient
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                🗑️ {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Patient Info Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📋 Patient Information
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Full Name</span>
                <span style={{ fontWeight: '500' }}>{patient.full_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Age</span>
                <span>{patient.age} years</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Gender</span>
                <span>{patient.gender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Phone</span>
                <span>📞 {patient.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Blood Group</span>
                <span style={{ padding: '0.125rem 0.5rem', backgroundColor: patient.blood_group !== 'Unknown' ? '#fee2e2' : '#f3f4f6', color: patient.blood_group !== 'Unknown' ? '#b91c1c' : '#6b7280', borderRadius: '0.25rem', fontWeight: '500' }}>
                  {patient.blood_group}
                </span>
              </div>
              {patient.address && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>Address</span>
                  <span>{patient.address}</span>
                </div>
              )}
              {patient.allergies && (
                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Allergies</span>
                  <span style={{ color: '#dc2626' }}>⚠️ {patient.allergies}</span>
                </div>
              )}
              {patient.medical_history && (
                <div style={{ padding: '0.5rem 0' }}>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Medical History</span>
                  <span>{patient.medical_history}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Visit Statistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{visits.length}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Visits</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                  {visits.filter(v => v.prescription_image_url).length}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Prescriptions</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {visits.filter(v => v.follow_up_date).length}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Follow-ups</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f3e8ff', borderRadius: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea' }}>
                  {visits.length > 0 ? new Date(visits[0].created_at).toLocaleDateString() : '-'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Last Visit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visit History */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>📋 Visit History</h2>
            <Link
              href={`/patients/${params.id}/visits/new`}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              ➕ New Visit
            </Link>
          </div>

          {visits.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No visits yet. Create the first visit for this patient.
            </div>
          ) : (
            <div>
              {visits.map((visit) => (
                <div key={visit.id} style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '500' }}>📅 {new Date(visit.created_at).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(visit.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {visit.diagnosis || visit.symptoms || 'No details'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {visit.prescription_image_url && (
                      <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.25rem', fontSize: '0.75rem' }}>💊 Rx</span>
                    )}
                    {visit.follow_up_date && (
                      <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '0.25rem', fontSize: '0.75rem' }}>📅 Follow-up</span>
                    )}
                    <Link
                      href={`/patients/${params.id}/visits/${visit.id}`}
                      style={{ padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.75rem' }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}