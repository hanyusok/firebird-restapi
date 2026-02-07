'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WaitItem {
    PCODE: number;
    VISIDATE: string;
    RESID1: string;
    RESID2: string;
    DISPLAYNAME: string;
}

export default function MtsWaitPage() {
    const [date, setDate] = useState('2026-02-07');
    const [waitList, setWaitList] = useState<WaitItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWaitList(date);
    }, [date]);

    const fetchWaitList = async (dateStr: string) => {
        setLoading(true);
        setError('');
        try {
            // API expects YYYYMMDD
            const formattedDate = dateStr.replace(/-/g, '');
            const response = await fetch(`http://localhost:3000/api/mtswait/date/${formattedDate}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setWaitList([]);
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            setWaitList(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setWaitList([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Waiting List (MTSWAIT)</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                {loading && <div className="text-center py-4">Loading...</div>}

                {error && <div className="text-red-500 mb-4">{error}</div>}

                {!loading && !error && waitList.length === 0 && (
                    <div className="text-gray-500 italic">No records found for {date}</div>
                )}

                {!loading && !error && waitList.length > 0 && (
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    PCODE
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name (Display)
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Res ID 1
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Res ID 2
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Visit Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {waitList.map((item) => (
                                                <tr key={`${item.PCODE}-${item.VISIDATE}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.PCODE}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.DISPLAYNAME}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.RESID1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.RESID2}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.VISIDATE}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
