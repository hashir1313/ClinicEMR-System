export interface Doctor {
  id: string;
  email: string;
  created_at: string;
}

export interface Patient {
  id: string;
  doctor_id: string;
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  blood_group: string;
  allergies: string;
  medical_history: string;
  created_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  follow_up_date: string | null;
  prescription_image_url: string | null;
  prescription_json_url: string | null;
  created_at: string;
}

export interface VisitWithPatient extends Visit {
  patient: Patient;
}

export interface PatientFormData {
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  blood_group: string;
  allergies: string;
  medical_history: string;
}

export interface VisitFormData {
  symptoms: string;
  diagnosis: string;
  notes: string;
  follow_up_date: string | null;
}

export interface DrawingState {
  paths: FabricPath[];
  activeTool: 'draw' | 'eraser';
  brushColor: string;
  brushSize: number;
}

export interface FabricPath {
  type: string;
  version: string;
  originX: string;
  originY: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeLineCap: string;
  strokeLineJoin: string;
  points: { x: number; y: number; command: string }[];
}