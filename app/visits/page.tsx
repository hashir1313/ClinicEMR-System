'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDoctorFromSession } from '@/services/auth';
import { getPatients, getVisitsByPatient, deleteVisit } from '@/services/database';
import { deletePrescriptionFiles } from '@/services/storage';
import Navbar from '@/components/Navbar';
import type { Patient, Visit } from '@/types';

interface VisitWithPatient extends Visit {
  patient_name: string;
}

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrescription, setFilterPrescription] = useState<'all' | 'yes' | 'no'>('all');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const doctor = await getDoctorFromSession();
        if (!doctor) {
          router.push('/login');
          return;
        }
        
        const patients = await getPatients(doctor.id);
        const allVisits: VisitWithPatient[] = [];
        
        for (const patient of patients) {
          const patientVisits = await getVisitsByPatient(patient.id);
          for (const visit of patientVisits) {
            allVisits.push({
              ...visit,
              patient_name: patient.full_name,
            });
          }
        }
        
        allVisits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setVisits(allVisits);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const filteredVisits = visits.filter(v => {
    const matchesSearch = 
      v.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.symptoms || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.includes(searchTerm);
    
    if (filterPrescription === 'yes') return matchesSearch && v.prescription_image_url;
    if (filterPrescription === 'no') return matchesSearch && !v.prescription_image_url;
    return matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredVisits.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVisits.map(v => v.id)));
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
    
    const confirmMsg = `Are you sure you want to delete ${selectedIds.size} visit${selectedIds.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMsg)) return;
    
    setDeleting(true);
    try {
      for (const visitId of selectedIds) {
        const visit = visits.find(v => v.id === visitId);
        if (visit?.prescription_image_url && visit?.prescription_json_url) {
          try {
            await deletePrescriptionFiles(visit.prescription_image_url, visit.prescription_json_url);
          } catch (e) {
            console.error('Error deleting prescription files:', e);
          }
        }
        await deleteVisit(visitId);
      }
      
      setVisits(visits.filter(v => !selectedIds.has(v.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error deleting visits:', err);
      alert('Failed to delete some visits');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p>Loading visits...</p>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>All Visits</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{visits.length} total visits</p>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="🔍 Search by patient, symptoms, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterPrescription}
            onChange={(e) => setFilterPrescription(e.target.value as any)}
            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
          >
            <option value="all">All Visits</option>
            <option value="yes">With Prescription</option>
            <option value="no">Without Prescription</option>
          </select>
          
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
                <span>🗑️</span> {deleting ? 'Deleting...' : `Delete ${selectedIds.size} Visit${selectedIds.size > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {filteredVisits.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm || filterPrescription !== 'all' ? 'No visits match your filters.' : 'No visits yet.'}
              {!searchTerm && filterPrescription === 'all' && (
                <div style={{ marginTop: '1rem' }}>
                  <span>Create a visit from a </span>
                  <Link href="/patients" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    patient's profile →
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
                      checked={selectedIds.size === filteredVisits.length && filteredVisits.length > 0}
                      onChange={toggleSelectAll}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Patient</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Symptoms</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Diagnosis</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Rx</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Follow-up</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: selectedIds.has(visit.id) ? '#eff6ff' : 'transparent' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(visit.id)}
                        onChange={() => toggleSelect(visit.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      📅 {new Date(visit.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>
                      <Link href={`/patients/${visit.patient_id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        👤 {visit.patient_name}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.symptoms || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.diagnosis || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {visit.prescription_image_url ? (
                        <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                          💊 Yes
                        </span>
                      ) : (
                        <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                          No
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: visit.follow_up_date ? '#2563eb' : '#9ca3af' }}>
                      {visit.follow_up_date ? `📅 ${new Date(visit.follow_up_date).toLocaleDateString()}` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Link
                        href={`/patients/${visit.patient_id}/visits/${visit.id}`}
                        style={{ padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        👁️ View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer info */}
        {filteredVisits.length > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
            Showing {filteredVisits.length} of {visits.length} visits
          </div>
        )}
      </div>
    </>
  );
}