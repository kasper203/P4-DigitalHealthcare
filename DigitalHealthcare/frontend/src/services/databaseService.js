const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const fetchJournalEntries = async (userId) => {
  const res = await fetch(`${API_URL}/journals/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch journal entries');
  return res.json();
};

export const fetchTestresultsForUser = async (userId) => {
  const res = await fetch(`${API_URL}/testresults/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch test results');
  return res.json();
};

export const fetchPatientInfoForUser = async (userId) => {
  const res = await fetch(`${API_URL}/patientinfo/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch patient information');
  return res.json();
};

export const fetchDoctorPatients = async (doctorId) => {
  const res = await fetch(`${API_URL}/patientinfo/doctor/${doctorId}`);
  if (!res.ok) throw new Error('Failed to fetch doctor patients');
  return res.json();
};

export const registerPatient = async (patientData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || errorData.error || 'Failed to register patient');
    } catch (err) {
      throw new Error(`Failed to register patient (Status ${res.status})`);
    }
  }
  return res.json();
};

export const assignPatientToDoctor = async (patientCpr, doctorId) => {
  const res = await fetch(`${API_URL}/patientinfo/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCpr, doctorId }),
  });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || 'Failed to assign patient');
    } catch (err) {
      throw new Error(`Failed to assign patient (Status ${res.status})`);
    }
  }
  return res.json();
};

export const unassignPatientFromDoctor = async (patientUserId, doctorId) => {
  const res = await fetch(`${API_URL}/patientinfo/unassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientUserId, doctorId }),
  });

  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || 'Failed to remove patient');
    } catch (err) {
      throw new Error(`Failed to remove patient (Status ${res.status})`);
    }
  }

  return res.json();
};
