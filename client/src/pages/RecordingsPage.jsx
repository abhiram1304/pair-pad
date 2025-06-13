// client/src/pages/RecordingsPage.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/presign/list')
      .then(setRecordings)
      .catch(() => setErr('⚠️ Failed to load recordings'));
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">📼 Saved Recordings</h2>
      {err && <p className="text-red-400">{err}</p>}
      <ul className="space-y-3">
        {recordings.map((rec, i) => (
          <li
            key={i}
            className="bg-gray-800 p-3 rounded shadow-md flex flex-col gap-1"
          >
            <div className="text-sm text-gray-300 truncate">
              <strong>File:</strong> {rec.key}
            </div>
            <div className="text-sm text-gray-400">
              <strong>Size:</strong> {(rec.size / 1024).toFixed(2)} KB
            </div>
            <div className="text-sm text-gray-400">
              <strong>Date:</strong> {new Date(rec.date).toLocaleString()}
            </div>
            <a
              href={rec.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline text-sm mt-1"
            >
              ▶️ View Recording
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
