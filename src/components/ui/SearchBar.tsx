'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <input
                type="text"
                placeholder="Search jobs, exams..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    paddingRight: '2.5rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                }}
            />
            <button
                type="submit"
                style={{
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                }}
                aria-label="Search"
            >
                🔍
            </button>
        </form>
    );
}
