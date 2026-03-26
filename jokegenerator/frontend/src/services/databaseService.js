const API_URL = import.meta.env.VITE_API_URL;

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
