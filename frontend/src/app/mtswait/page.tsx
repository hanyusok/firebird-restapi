'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Edit } from 'lucide-react';

interface WaitItem {
    PCODE: number;
    VISIDATE: string;
    RESID1: string;
    RESID2: string;
    DISPLAYNAME: string;
    GOODOC: string | null;
    ROOMCODE: string;
    ROOMNM: string;
    DEPTCODE: string;
    DEPTNM: string;
    DOCTRCODE: string;
    DOCTRNM: string;
    D_ALARM: string | null;
    PSN: string | null;
}

export default function MtsWaitPage() {
    const [date, setDate] = useState('2026-02-07');
    const [waitList, setWaitList] = useState<WaitItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<WaitItem>>({});

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

    const handleEdit = (item: WaitItem) => {
        const key = `${item.PCODE}-${item.VISIDATE}`;
        setEditingKey(key);
        setEditForm({
            RESID1: item.RESID1,
            RESID2: item.RESID2
        });
    };

    const handleSaveEdit = async (pcode: number, visidate: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/mtswait/${pcode}/${visidate}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                throw new Error('Failed to update record');
            }

            alert('Record updated successfully!');
            setEditingKey(null);
            fetchWaitList(date);
        } catch (err: any) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleDelete = async (pcode: number, visidate: string) => {
        if (!confirm('Are you sure you want to remove this patient from the waiting list?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/mtswait/${pcode}/${visidate}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete record');
            }

            alert('Record deleted successfully!');
            fetchWaitList(date);
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
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
                        <div className="text-sm text-gray-600 mb-2">
                            Total: {waitList.length} patient(s) waiting
                        </div>
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
                                                    Name
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
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {waitList.map((item) => {
                                                const key = `${item.PCODE}-${item.VISIDATE}`;
                                                const isEditing = editingKey === key;

                                                return (
                                                    <tr key={key} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.PCODE}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {item.DISPLAYNAME}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.RESID1 || ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, RESID1: e.target.value })}
                                                                    className="border rounded px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                item.RESID1
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.RESID2 || ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, RESID2: e.target.value })}
                                                                    className="border rounded px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                item.RESID2
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.VISIDATE}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            {isEditing ? (
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleSaveEdit(item.PCODE, item.VISIDATE)}
                                                                        className="text-green-600 hover:text-green-900"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingKey(null)}
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item.PCODE, item.VISIDATE)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
