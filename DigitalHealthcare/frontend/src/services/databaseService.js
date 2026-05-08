const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const parseErrorResponse = async (res, fallbackMessage) => {
  try {
    const errorData = await res.json();
    return errorData.error || errorData.message || fallbackMessage;
  } catch (_err) {
    return `${fallbackMessage} (Status ${res.status})`;
  }
};

export const fetchJournalEntries = async (userId) => {
  const res = await fetch(`${API_URL}/journals/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch journal entries');
  return res.json();
};

export const createJournalEntry = async (userId, journalInput, author) => {
  const res = await fetch(`${API_URL}/journals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      journal_input: journalInput,
      author,
    }),
  });

  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || 'Failed to create journal entry');
    } catch (err) {
      throw new Error(`Failed to create journal entry (Status ${res.status})`);
    }
  }

  return res.json();
};

export const fetchTestresultsForUser = async (userId) => {
  const res = await fetch(`${API_URL}/testresults/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch test results');
  return res.json();
};

export const createTestresultEntry = async (userId, testResult, testType, author) => {
  const res = await fetch(`${API_URL}/testresults`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      test_result: testResult,
      test_type: testType,
      author,
    }),
  });

  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || 'Failed to create test result');
    } catch (err) {
      throw new Error(`Failed to create test result (Status ${res.status})`);
    }
  }

  return res.json();
};

export const fetchPatientInfoForUser = async (userId) => {
  const res = await fetch(`${API_URL}/patientinfo/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch patient information');
  return res.json();
};

export const fetchAllDoctors = async () => {
  const res = await fetch(`${API_URL}/patientinfo/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
};

export const switchPatientDoctor = async (patientCpr, doctorId) => {
  const res = await fetch(`${API_URL}/patientinfo/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCpr, doctorId }),
  });

  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data.error || data.message || 'Failed to switch doctor');
    } catch (err) {
      throw new Error(`Failed to switch doctor (Status ${res.status})`);
    }
  }

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
    throw new Error(await parseErrorResponse(res, 'Failed to register patient'));
  }
  return res.json();
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || `Failed to register user (Status ${res.status})`);
  }

  return data;
};

export const loginUser = async ({ username, password, user_type }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, user_type }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || `Failed to login (Status ${res.status})`);
  }

  return data;
};

export const changePassword = async (accountId, currentPassword, newPassword, confirmPassword) => {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || errorData.error || 'Failed to change password');
    } catch (err) {
      throw new Error(`Failed to change password (Status ${res.status})`);
    }
  }
  return res.json();
};