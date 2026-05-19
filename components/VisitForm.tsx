'use client';

import { useState } from 'react';
import type { VisitFormData, Visit } from '@/types';
import PrescriptionCanvas from './PrescriptionCanvas';

interface VisitFormProps {
  visit?: Visit;
  patientId: string;
  doctorId: string;
  onSubmit: (data: VisitFormData & { prescriptionImageUrl?: string; prescriptionJsonUrl?: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function VisitForm({ 
  visit, 
  patientId, 
  doctorId,
  onSubmit, 
  onCancel, 
  isLoading 
}: VisitFormProps) {
  const [formData, setFormData] = useState<VisitFormData>({
    symptoms: visit?.symptoms || '',
    diagnosis: visit?.diagnosis || '',
    notes: visit?.notes || '',
    follow_up_date: visit?.follow_up_date || '',
  });

  const [prescriptionImageUrl, setPrescriptionImageUrl] = useState<string | undefined>(
    visit?.prescription_image_url || undefined
  );
  const [prescriptionJsonUrl, setPrescriptionJsonUrl] = useState<string | undefined>(
    visit?.prescription_json_url || undefined
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'follow_up_date' ? value || null : value,
    }));
  };

  const handlePrescriptionSave = (imageDataUrl: string, jsonData: string) => {
    setPrescriptionImageUrl(imageDataUrl);
    setPrescriptionJsonUrl(jsonData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      prescriptionImageUrl,
      prescriptionJsonUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Symptoms
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', color: '#111827' }}
            placeholder="Patient symptoms..."
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Diagnosis
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', color: '#111827' }}
            placeholder="Diagnosis..."
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', color: '#111827' }}
            placeholder="Additional notes..."
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Follow-up Date (Optional)
          </label>
          <input
            type="date"
            name="follow_up_date"
            value={formData.follow_up_date || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', color: '#111827' }}
          />
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>Prescription</h3>
        <PrescriptionCanvas
          onSave={handlePrescriptionSave}
          initialJsonUrl={visit?.prescription_json_url}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', color: '#374151', backgroundColor: 'white', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.25rem', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading ? 'Saving...' : visit ? 'Update Visit' : 'Create Visit'}
        </button>
      </div>
    </form>
  );
}