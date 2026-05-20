'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getDoctorFromSession } from '@/services/auth';
import VisitForm from '@/components/VisitForm';
import Navbar from '@/components/Navbar';
import type { VisitFormData } from '@/types';

export default function NewVisitPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: VisitFormData & { prescriptionImageUrl?: string; prescriptionJsonUrl?: string }) => {
    setLoading(true);
    setError('');

    try {
      const doctor = await getDoctorFromSession();
      if (!doctor) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: params.id,
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          notes: data.notes,
          follow_up_date: data.follow_up_date,
          prescriptionImageUrl: data.prescriptionImageUrl,
          prescriptionJsonUrl: data.prescriptionJsonUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to create visit (${response.status})`);
      }

      router.push(`/patients/${params.id}`);
    } catch (err) {
      console.error('Visit creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href={`/patients/${params.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block', marginBottom: '0.5rem' }}>
            ← Back to Patient
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>New Visit</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Create a new visit record with prescription</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.25rem' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <VisitForm
            patientId={params.id as string}
            doctorId=""
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/patients/${params.id}`)}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}