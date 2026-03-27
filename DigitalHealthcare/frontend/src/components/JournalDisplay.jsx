import { useState, useEffect } from 'react';
import { fetchJournalEntries } from '../services/databaseService'; 
// This is gonna hold the function which fetches the journal from the database
import { sanitizeUserInput } from '../utils/sanitize';
// We are gonna have some logic in utils/sanitize.js to sanitize user input before displaying it

export default function JournalDisplay() {
    const [entries, setEntries] = useState([]); 
    // entires hold the journal entries fetched from the database
    // setEntries is the function to update the entries state 
    // (so that i can effectivly re-render the component when new entries are fetched using virtual DOM)
    const [loading, setLoading] = useState(true);
    // if we are doing a call to the DB, we want to show a loading state
    const [error, setError] = useState(null);
    // if there is an error fetching the journal entries, we want to show an error message

    useEffect(() => {
        fetchJournalEntries(201)
        .then(data => setEntries(data))
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
        {entries.map(entry => (
            <div key={entry.id}>
            <p>{sanitizeUserInput(entry.user_id)}</p>
            <p>{sanitizeUserInput(entry.journal_input)}</p>
            <p>{sanitizeUserInput(entry.author)}</p>
            <p>{sanitizeUserInput(entry.date)}</p>
            </div>
        ))}
        </div>
    );
}