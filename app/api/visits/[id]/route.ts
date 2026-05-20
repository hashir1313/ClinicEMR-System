import { NextRequest, NextResponse } from 'next/server';
import { getDoctorFromSession } from '@/services/auth-server';
import { getVisit, updateVisit } from '@/services/database-server';
import { uploadPrescriptionImage, uploadPrescriptionJson } from '@/services/storage-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: visitId } = await params;
    
    const doctor = await getDoctorFromSession();
    console.log('Edit Visit - Doctor:', doctor?.id);
    
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching visit:', visitId);
    const visit = await getVisit(visitId);
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    console.log('Visit found:', visit.id);

    const body = await request.json();
    const { symptoms, diagnosis, notes, follow_up_date, prescriptionImageUrl, prescriptionJsonUrl } = body;

    let prescription_image_url = visit.prescription_image_url;
    let prescription_json_url = visit.prescription_json_url;

    // Check if new prescription data was provided (starts with data: or {)
    if (prescriptionImageUrl && prescriptionImageUrl.startsWith('data:')) {
      console.log('Uploading new prescription image...');
      try {
        prescription_image_url = await uploadPrescriptionImage(
          doctor.id,
          visit.patient_id,
          visitId,
          prescriptionImageUrl
        );
        console.log('Image uploaded:', prescription_image_url);
      } catch (err) {
        console.error('Image upload error:', err);
      }
    }
    
    if (prescriptionJsonUrl) {
      console.log('Uploading new prescription JSON...');
      try {
        prescription_json_url = await uploadPrescriptionJson(
          doctor.id,
          visit.patient_id,
          visitId,
          prescriptionJsonUrl
        );
        console.log('JSON uploaded:', prescription_json_url);
      } catch (err) {
        console.error('JSON upload error:', err);
      }
    }

    console.log('Updating visit in database...');
    const updatedVisit = await updateVisit(visitId, {
      symptoms: symptoms || '',
      diagnosis: diagnosis || '',
      notes: notes || '',
      follow_up_date: follow_up_date || null,
      prescription_image_url: prescription_image_url || undefined,
      prescription_json_url: prescription_json_url || undefined,
    });

    console.log('Visit updated:', updatedVisit?.id);
    return NextResponse.json(updatedVisit);
  } catch (error) {
    console.error('Error updating visit:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to update visit: ${errorMessage}` }, { status: 500 });
  }
}