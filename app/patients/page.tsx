'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDoctorFromSession } from '@/services/auth';
import { getPatients, deletePatient } from '@/services/database';
import { getVisitsByPatient } from '@/services/database';
import { deletePrescriptionFiles } from '@/services/storage';
import Navbar from '@/components/Navbar';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const doctor = await getDoctorFromSession();
        if (!doctor) {
          router.push('/login');
          return;
        }
        
        const data = await getPatients(doctor.id);
        setPatients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.id.includes(searchTerm)
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPatients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPatients.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmMsg = `Are you sure you want to delete ${selectedIds.size} patient${selectedIds.size > 1 ? 's' : ''}? This will also delete all their visits and prescriptions.`;
    if (!confirm(confirmMsg)) return;
    
    setDeleting(true);
    try {
      // Delete each patient's visits and prescriptions first
      for (const patientId of selectedIds) {
        const visits = await getVisitsByPatient(patientId);
        for (const visit of visits) {
          if (visit.prescription_image_url && visit.prescription_json_url) {
            try {
              await deletePrescriptionFiles(visit.prescription_image_url, visit.prescription_json_url);
            } catch (e) {
              console.error('Error deleting prescription files:', e);
            }
          }
        }
        await deletePatient(patientId);
      }
      
      setPatients(patients.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error deleting patients:', err);
      alert('Failed to delete some patients');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p>Loading patients...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Patients</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{patients.length} total patients</p>
          </div>
          <Link
            href="/patients/new"
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
          >
            <span>➕</span> Add New Patient
          </Link>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="🔍 Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          
          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>🗑️</span> {deleting ? 'Deleting...' : `Delete ${selectedIds.size} Patient${selectedIds.size > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {filteredPatients.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm ? 'No patients match your search.' : 'No patients yet.'}
              {!searchTerm && (
                <div style={{ marginTop: '1rem' }}>
                  <Link href="/patients/new" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    Add your first patient →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredPatients.length && filteredPatients.length > 0}
                      onChange={toggleSelectAll}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Age</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Gender</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Blood</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: selectedIds.has(patient.id) ? '#eff6ff' : 'transparent' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(patient.id)}
                        onChange={() => toggleSelect(patient.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Link href={`/patients/${patient.id}`} style={{ color: '#111827', fontWeight: '500', textDecoration: 'none' }}>
                        {patient.full_name}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{patient.age}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
                      <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                        {patient.gender}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>📞 {patient.phone}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
                      {patient.blood_group !== 'Unknown' ? (
                        <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                          {patient.blood_group}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          href={`/patients/${patient.id}`}
                          style={{ padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.75rem' }}
                        >
                          👁️ View
                        </Link>
                        <Link
                          href={`/patients/${patient.id}/edit`}
                          style={{ padding: '0.25rem 0.75rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.75rem' }}
                        >
                          ✏️ Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer info */}
        {filteredPatients.length > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        )}
      </div>
    </>
  );
}