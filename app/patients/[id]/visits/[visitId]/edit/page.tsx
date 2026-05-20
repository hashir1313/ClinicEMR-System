'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDoctorFromSession } from '@/services/auth';
import { getVisit } from '@/services/database';
import VisitForm from '@/components/VisitForm';
import Navbar from '@/components/Navbar';
import type { Visit, VisitFormData } from '@/types';

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getVisit(params.visitId as string)
      .then(setVisit)
      .catch(() => router.push(`/patients/${params.id}`))
      .finally(() => setLoading(false));
  }, [params.visitId, params.id, router]);

  const handleSubmit = async (data: VisitFormData & { prescriptionImageUrl?: string; prescriptionJsonUrl?: string }) => {
    setSaving(true);
    setError('');

    try {
      const doctor = await getDoctorFromSession();
      if (!doctor) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/visits/${params.visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          notes: data.notes,
          follow_up_date: data.follow_up_date,
          prescriptionImageUrl: data.prescriptionImageUrl,
          prescriptionJsonUrl: data.prescriptionJsonUrl,
        }),
      });

      const result = await response.json();

      console.log('Update response:', response.status, result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to update visit (${response.status})`);
      }

      router.push(`/patients/${params.id}`);
    } catch (err) {
      console.error('Update visit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update visit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem' }}>Loading...</div>
      </>
    );
  }

  if (!visit) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem' }}>Visit not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Edit Visit</h1>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.25rem' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <VisitForm
            visit={visit}
            patientId={params.id as string}
            doctorId=""
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/patients/${params.id}`)}
            isLoading={saving}
          />
        </div>
      </div>
    </>
  );
}