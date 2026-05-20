import { createServiceClient } from '@/lib/supabase/service';

const BUCKET_NAME = 'prescriptions';

export async function uploadPrescriptionImage(
  doctorId: string,
  patientId: string,
  visitId: string,
  imageDataUrl: string
): Promise<string> {
  const supabase = createServiceClient();
  
  console.log('Uploading prescription image with service role...');
  console.log('Bucket:', BUCKET_NAME);
  
  const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const fileName = `${doctorId}/${patientId}/${visitId}/image_${Date.now()}.png`;
  console.log('File name:', fileName);
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, bytes, {
      contentType: 'image/png',
      upsert: true,
    });
  
  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  
  console.log('Upload success:', data);
  
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  
  console.log('Public URL:', urlData.publicUrl);
  return urlData.publicUrl;
}

export async function uploadPrescriptionJson(
  doctorId: string,
  patientId: string,
  visitId: string,
  jsonData: string
): Promise<string> {
  const supabase = createServiceClient();
  
  console.log('Uploading prescription JSON with service role...');
  
  const fileName = `${doctorId}/${patientId}/${visitId}/json_${Date.now()}.json`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, jsonData, {
      contentType: 'application/json',
      upsert: true,
    });
  
  if (error) {
    console.error('JSON upload error:', error);
    throw new Error(`Failed to upload JSON: ${error.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

export async function deletePrescriptionFiles(imageUrl: string, jsonUrl: string) {
  const supabase = createServiceClient();
  
  const extractPath = (url: string) => {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts.slice(-3).join('/');
  };
  
  if (imageUrl) {
    const imagePath = extractPath(imageUrl);
    await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
  }
  
  if (jsonUrl) {
    const jsonPath = extractPath(jsonUrl);
    await supabase.storage.from(BUCKET_NAME).remove([jsonPath]);
  }
}

export async function downloadPrescriptionJson(jsonUrl: string): Promise<string> {
  const response = await fetch(jsonUrl);
  if (!response.ok) throw new Error('Failed to download prescription JSON');
  return await response.text();
}