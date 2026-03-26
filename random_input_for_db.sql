USE Healthcare_app;

-- 1. Insert Doctors into Login and DoctorInfo
-- We need doctors first so patients can be assigned to them.
INSERT INTO Login (user_id, username, password, type) VALUES 
(101, 'dr_smith', 'hash_pass_1', 'doctor'),
(102, 'dr_lee', 'hash_pass_2', 'doctor');

INSERT INTO DoctorInfo (clinic_address, doctor_id, name) VALUES 
('123 Medical Plaza, Copenhagen', 101, 'Dr. Sarah Smith'),
('456 Health Way, Aarhus', 102, 'Dr. Kevin Lee');

-- 2. Insert Patients into Login and PatientInfo
INSERT INTO Login (user_id, username, password, type) VALUES 
(201, 'jdoe88', 'hash_pass_3', 'patient'),
(202, 'msample', 'hash_pass_4', 'patient'),
(203, 'bwayne', 'hash_pass_5', 'patient');

INSERT INTO PatientInfo (user_id, cpr, date_of_birth, address, gender, blood_type, name, doctor_id) VALUES 
(201, '1205881234', '1988-05-12', 'Nørrebrogade 10, 2200 Kbh N', 'Male', 'A+', 'John Doe', 101),
(202, '2210955678', '1995-10-22', 'Vesterbrogade 5, 1620 Kbh V', 'Female', 'O-', 'Mary Sample', 101),
(203, '0101709999', '1970-01-01', 'Strandvejen 100, 2900 Hellerup', 'Male', 'B+', 'Bruce Wayne', 102);

-- 3. Insert Journal Entries
INSERT INTO Journal (user_id, journal_input, date, author) VALUES 
(201, 'Patient complains of mild back pain. Recommended stretching and rest.', '2026-03-01', 'Dr. Sarah Smith'),
(201, 'Follow-up: Pain has subsided. Patient is cleared for regular exercise.', '2026-03-15', 'Dr. Sarah Smith'),
(202, 'Annual checkup. Heart rate and blood pressure within normal ranges.', '2026-02-20', 'Dr. Sarah Smith');

-- 4. Insert Test Results
INSERT INTO TestInfo (user_id, test_result, date, test_type, author) VALUES 
(201, 'Vitamin D: 32 ng/mL (Normal range: 20-50)', '2026-03-02', 'Blood Work', 'BioLab Labs'),
(202, 'Clear lung sounds, no signs of infection.', '2026-02-20', 'X-Ray', 'City Radiology'),
(203, 'Glucose levels slightly elevated. Monitor diet.', '2026-03-10', 'Glucose Tolerance', 'Dr. Kevin Lee');