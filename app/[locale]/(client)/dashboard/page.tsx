'use client';

import { useEffect, useState } from 'react';
import { fetchReservations } from '@/app/actions/reservations';

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const bookings = await fetchReservations({ all: true });
                setData(bookings);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard - Test Axios</h1>

            <div className="mb-4">
                <p>Status: {loading ? 'Loading...' : error ? 'Error' : 'Success'}</p>
                {error && <p className="text-red-500">{error}</p>}
            </div>

            {data && (
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
