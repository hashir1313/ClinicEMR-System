export interface ClinicInfo {
  name: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
}

export const clinicInfo: ClinicInfo = {
  name: 'Elinic EMR System',
  logoUrl: null,
  address: '123 Medical Center, City, State',
  phone: '+1 234 567 8900',
  email: 'contact@clinic.com',
};

export function updateClinicInfo(updates: Partial<ClinicInfo>): void {
  Object.assign(clinicInfo, updates);
}