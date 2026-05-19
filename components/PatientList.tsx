'use client';

import Link from 'next/link';
import type { Patient } from '@/types';

interface PatientListProps {
  patients: Patient[];
  onDelete?: (id: string) => void;
}

export default function PatientList({ patients, onDelete }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        No patients found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              ID
            </th>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              Name
            </th>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              Age
            </th>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              Gender
            </th>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              Phone
            </th>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              Blood Group
            </th>
            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
          {patients.map((patient) => (
            <tr key={patient.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                {patient.id.slice(0, 8)}...
              </td>
              <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                <Link
                  href={`/patients/${patient.id}`}
                  style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}
                >
                  {patient.full_name}
                </Link>
              </td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {patient.age}
              </td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {patient.gender}
              </td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {patient.phone}
              </td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {patient.blood_group}
              </td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/patients/${patient.id}`}
                    style={{ color: '#2563eb', textDecoration: 'none' }}
                  >
                    View
                  </Link>
                  <Link
                    href={`/patients/${patient.id}/edit`}
                    style={{ color: '#16a34a', textDecoration: 'none' }}
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(patient.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}