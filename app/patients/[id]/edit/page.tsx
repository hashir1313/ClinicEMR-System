'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPatient, updatePatient } from '@/services/database';
import PatientForm from '@/components/PatientForm';
import Navbar from '@/components/Navbar';
import type { Patient, PatientFormData } from '@/types';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params.id as string;
    getPatient(id)
      .then(setPatient)
      .catch(() => router.push('/patients'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleSubmit = async (data: PatientFormData) => {
    setSaving(true);
    setError('');

    try {
      await updatePatient(params.id as string, data);
      router.push(`/patients/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem' }}>Loading...</div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem' }}>Patient not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Edit Patient</h1>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.25rem' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <PatientForm
            patient={patient}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/patients/${params.id}`)}
            isLoading={saving}
          />
        </div>
      </div>
    </>
  );
}