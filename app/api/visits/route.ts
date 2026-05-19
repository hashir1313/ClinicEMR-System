import { NextRequest, NextResponse } from 'next/server';
import { getDoctorFromSession } from '@/services/auth-server';
import { createVisit, updateVisit } from '@/services/database-server';
import { uploadPrescriptionImage, uploadPrescriptionJson } from '@/services/storage-server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Creating Visit API ===');
    
    const doctor = await getDoctorFromSession();
    console.log('Doctor:', doctor);
    
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, symptoms, diagnosis, notes, follow_up_date, prescriptionImageUrl, prescriptionJsonUrl } = body;

    console.log('Patient ID:', patientId);

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    console.log('Attempting to create visit...');
    const visit = await createVisit(patientId, {
      symptoms: symptoms || '',
      diagnosis: diagnosis || '',
      notes: notes || '',
      follow_up_date: follow_up_date || null,
    });
    console.log('Visit created successfully:', visit.id);

    console.log('Visit created:', visit.id);

    let prescription_image_url = null;
    let prescription_json_url = null;

    if (prescriptionImageUrl && prescriptionJsonUrl) {
      console.log('Uploading prescription...');
      try {
        prescription_image_url = await uploadPrescriptionImage(
          doctor.id,
          patientId,
          visit.id,
          prescriptionImageUrl
        );
        
        prescription_json_url = await uploadPrescriptionJson(
          doctor.id,
          patientId,
          visit.id,
          prescriptionJsonUrl
        );

        console.log('Updating visit with prescription URLs...');
        
        // Use the database service to update
        await updateVisit(visit.id, {
          prescription_image_url,
          prescription_json_url,
        });
        
        console.log('Prescription URLs updated');
      } catch (storageError) {
        console.error('Storage error:', storageError);
        // Continue even if prescription upload fails
      }
    }

    console.log('=== Visit Created Successfully ===');
    return NextResponse.json({ visit, prescription_image_url, prescription_json_url });
  } catch (error) {
    console.error('Error creating visit:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to create visit: ${errorMessage}` }, { status: 500 });
  }
}