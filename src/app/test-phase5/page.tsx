"use client";

import { useState } from 'react';

export default function TestPhase5() {
    const [url, setUrl] = useState('https://example.com');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDiscovery = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/admin/discovery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1>Phase 5: Discovery Engine Test</h1>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter Job URL to Scrape"
                    style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                />
            </div>

            <button
                onClick={handleDiscovery}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Discovering...' : 'Run Automated Discovery'}
            </button>

            {error && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee', color: 'red', borderRadius: '5px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px', overflow: 'auto' }}>
                    <h3>Discovery Result (Draft):</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
