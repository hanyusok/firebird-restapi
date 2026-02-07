'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MtrItem {
    PCODE: number;
    VISIDATE: string;
    VISITIME: string; // Time string
    PNAME: string;
    PBIRTH: string;
    GUBUN: string;
    DOC: string; // Doctor?
    SERIAL: number;
}

export default function MtsMtrPage() {
    const [date, setDate] = useState('2026-02-07');
    const [mtrList, setMtrList] = useState<MtrItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMtrList(date);
    }, [date]);

    const fetchMtrList = async (dateStr: string) => {
        setLoading(true);
        setError('');
        try {
            // API expects YYYYMMDD
            const formattedDate = dateStr.replace(/-/g, '');
            const response = await fetch(`http://localhost:3000/api/mtsmtr/date/${formattedDate}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setMtrList([]);
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            setMtrList(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setMtrList([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Treatment List (MTSMTR)</h1>
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

                {!loading && !error && mtrList.length === 0 && (
                    <div className="text-gray-500 italic">No records found for {date}</div>
                )}

                {!loading && !error && mtrList.length > 0 && (
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Birth
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Doctor
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mtrList.map((item, index) => (
                                                <tr key={`${item.PCODE}-${index}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.GUBUN}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {/* VISITIME is usually ISO date string, we want HH:mm */}
                                                        {item.VISITIME ? new Date(item.VISITIME).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.PNAME}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.PBIRTH}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.DOC}
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
