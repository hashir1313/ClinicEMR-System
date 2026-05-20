'use client';

import { useState } from 'react';
import { generateAndPrintVisit } from '@/services/pdf-generator';
import type { Patient, Visit, Doctor } from '@/types';

interface PrintButtonProps {
  patient: Patient;
  visit: Visit;
  doctor: Doctor;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function PrintButton({
  patient,
  visit,
  doctor,
  variant = 'primary',
  size = 'md',
}: PrintButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      await generateAndPrintVisit({ patient, visit, doctor });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.15s',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.25rem 0.75rem', fontSize: '0.75rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: loading ? '#9ca3af' : '#2563eb',
      color: 'white',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
  };

  return (
    <button
      onClick={handlePrint}
      disabled={loading}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      <span>🖨️</span>
      {loading ? 'Generating...' : 'Print'}
    </button>
  );
}