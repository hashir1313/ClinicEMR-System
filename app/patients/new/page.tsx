'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDoctorFromSession } from '@/services/auth';
import { createPatient } from '@/services/database';
import PatientForm from '@/components/PatientForm';
import Navbar from '@/components/Navbar';
import type { PatientFormData } from '@/types';

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: PatientFormData) => {
    setLoading(true);
    setError('');

    try {
      const doctor = await getDoctorFromSession();
      if (!doctor) {
        router.push('/login');
        return;
      }

      await createPatient(doctor.id, data);
      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/patients" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block', marginBottom: '0.5rem' }}>
            ← Back to Patients
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add New Patient</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Enter patient details to create a new record</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.25rem' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <PatientForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/patients')}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}