# Supabase Setup Instructions

## Database Schema

Run the following SQL in your Supabase project's SQL Editor:

```sql
-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  blood_group TEXT,
  allergies TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  symptoms TEXT,
  diagnosis TEXT,
  notes TEXT,
  follow_up_date DATE,
  prescription_image_url TEXT,
  prescription_json_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for doctors
CREATE POLICY "Doctors can view their own profile" ON doctors
  FOR SELECT USING (auth.uid() = id);

-- Create RLS policies for patients
CREATE POLICY "Doctors can view their own patients" ON patients
  FOR SELECT USING (doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  ));

CREATE POLICY "Doctors can insert their own patients" ON patients
  FOR INSERT WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  ));

CREATE POLICY "Doctors can update their own patients" ON patients
  FOR UPDATE USING (doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  ));

CREATE POLICY "Doctors can delete their own patients" ON patients
  FOR DELETE USING (doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  ));

-- Create RLS policies for visits
CREATE POLICY "Doctors can view visits of their patients" ON visits
  FOR SELECT USING (patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
    )
  ));

CREATE POLICY "Doctors can insert visits for their patients" ON visits
  FOR INSERT WITH CHECK (patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
    )
  ));

CREATE POLICY "Doctors can update visits of their patients" ON visits
  FOR UPDATE USING (patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
    )
  ));

CREATE POLICY "Doctors can delete visits of their patients" ON visits
  FOR DELETE USING (patient_id IN (
    SELECT id FROM patients WHERE doctor_id IN (
      SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
    )
  ));
```

## Storage Setup

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `prescriptions`
3. Set it as public (for serving prescription images)
4. Add storage policies if needed

## Creating the Admin Account

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Enter email and password for your doctor/admin account
4. Click "Create user"
5. Then go to Authentication > SQL Editor and run:

```sql
-- Insert the doctor record (use the same email as the user you created)
INSERT INTO doctors (email) VALUES ('your-doctor-email@example.com');
```

## Environment Variables

Update your `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: Supabase Dashboard > Settings > API

## Running the Application

```bash
npm run dev
```

Then open http://localhost:3000 and login with your doctor account.