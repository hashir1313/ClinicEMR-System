'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getVisit, deleteVisit } from '@/services/database';
import { deletePrescriptionFiles } from '@/services/storage';
import Navbar from '@/components/Navbar';
import type { Visit } from '@/types';

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getVisit(params.visitId as string)
      .then(setVisit)
      .catch(() => router.push(`/patients/${params.id}`))
      .finally(() => setLoading(false));
  }, [params.visitId, params.id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this visit and prescription?')) {
      return;
    }

    setDeleting(true);
    try {
      if (visit?.prescription_image_url && visit?.prescription_json_url) {
        await deletePrescriptionFiles(visit.prescription_image_url, visit.prescription_json_url);
      }
      
      await deleteVisit(params.visitId as string);
      router.push(`/patients/${params.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete visit');
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

  if (!visit) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>Visit not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href={`/patients/${params.id}`}
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block', marginBottom: '0.5rem' }}
          >
            ← Back to Patient
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Visit Details</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                📅 {new Date(visit.created_at).toLocaleDateString()} at {new Date(visit.created_at).toLocaleTimeString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                href={`/patients/${params.id}/visits/${params.visitId}/edit`}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                ✏️ Edit Visit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.5 : 1 }}
              >
                🗑️ {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          {/* Visit Info */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>📋 Visit Information</h2>
            
            {visit.symptoms && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>🩺 Symptoms</h3>
                <p style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.25rem' }}>{visit.symptoms}</p>
              </div>
            )}
            
            {visit.diagnosis && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>🔬 Diagnosis</h3>
                <p style={{ padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '0.25rem' }}>{visit.diagnosis}</p>
              </div>
            )}
            
            {visit.notes && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>📝 Notes</h3>
                <p style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem' }}>{visit.notes}</p>
              </div>
            )}
            
            {visit.follow_up_date && (
              <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📅</span>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Follow-up: </span>
                  <span style={{ color: '#059669', fontWeight: '500' }}>{new Date(visit.follow_up_date).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Prescription */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>💊 Prescription</h2>
              {visit.prescription_image_url && (
                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                  ✓ Saved
                </span>
              )}
            </div>

            {visit.prescription_image_url ? (
              <div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                  <img 
                    src={visit.prescription_image_url} 
                    alt="Prescription" 
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={visit.prescription_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    🔍 View Full Size
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
                <p>No prescription was created for this visit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}