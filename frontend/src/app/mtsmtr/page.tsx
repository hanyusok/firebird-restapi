'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus } from 'lucide-react';

interface MtrItem {
    '#'?: number;
    PCODE: number;
    VISIDATE: string;
    VISITIME: string;
    PNAME: string;
    PBIRTH: string | null;
    AGE: string;
    PHONENUM: string;
    SEX: string;
    SERIAL: number;
    N: number;
    GUBUN: string;
    RESERVED: string;
    FIN: string;
}

export default function MtsmtrPage() {
    const [date, setDate] = useState('2026-02-07');
    const [mtrList, setMtrList] = useState<MtrItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<MtrItem>>({});

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

    const handleEdit = (item: MtrItem) => {
        setEditingId(item['#'] || 0);
        setEditForm({
            PNAME: item.PNAME,
            AGE: item.AGE,
            PHONENUM: item.PHONENUM,
            SEX: item.SEX,
            GUBUN: item.GUBUN
        });
    };

    const handleSaveEdit = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/mtsmtr/${id}/${date}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                throw new Error('Failed to update record');
            }

            alert('Record updated successfully!');
            setEditingId(null);
            fetchMtrList(date);
        } catch (err: any) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/mtsmtr/${id}/${date}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete record');
            }

            alert('Record deleted successfully!');
            fetchMtrList(date);
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ko-KR');
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const t = new Date(timeStr);
        return t.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Treatment Records (MTSMTR)</h1>
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
                        <div className="text-sm text-gray-600 mb-2">
                            Total: {mtrList.length} record(s)
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
                                                    Birth
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Age
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Sex
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Visit Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mtrList.map((item) => (
                                                <tr key={`${item.PCODE}-${item.VISIDATE}-${item['#']}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.PCODE}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {editingId === item['#'] ? (
                                                            <input
                                                                type="text"
                                                                value={editForm.PNAME || ''}
                                                                onChange={(e) => setEditForm({ ...editForm, PNAME: e.target.value })}
                                                                className="border rounded px-2 py-1 w-full"
                                                            />
                                                        ) : (
                                                            item.PNAME
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.PBIRTH || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editingId === item['#'] ? (
                                                            <input
                                                                type="text"
                                                                value={editForm.AGE || ''}
                                                                onChange={(e) => setEditForm({ ...editForm, AGE: e.target.value })}
                                                                className="border rounded px-2 py-1 w-20"
                                                            />
                                                        ) : (
                                                            item.AGE
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editingId === item['#'] ? (
                                                            <select
                                                                value={editForm.SEX || ''}
                                                                onChange={(e) => setEditForm({ ...editForm, SEX: e.target.value })}
                                                                className="border rounded px-2 py-1"
                                                            >
                                                                <option value="1">M</option>
                                                                <option value="2">F</option>
                                                            </select>
                                                        ) : (
                                                            item.SEX === '1' ? 'M' : 'F'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatTime(item.VISITIME)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editingId === item['#'] ? (
                                                            <input
                                                                type="text"
                                                                value={editForm.GUBUN || ''}
                                                                onChange={(e) => setEditForm({ ...editForm, GUBUN: e.target.value })}
                                                                className="border rounded px-2 py-1 w-20"
                                                            />
                                                        ) : (
                                                            item.GUBUN
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {editingId === item['#'] ? (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleSaveEdit(item['#'] || 0)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
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
                                                                    onClick={() => handleDelete(item['#'] || 0)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
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
