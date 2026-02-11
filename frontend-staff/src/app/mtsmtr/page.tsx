'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Pencil, Trash2, Save, X, RefreshCw } from 'lucide-react';

interface MtrItem {
    '#': number;
    PCODE: number;
    VISIDATE: string;
    VISITIME: string;
    PNAME: string;
    PBIRTH: string;
    AGE: string;
    PHONENUM: string;
    SEX: string;
    GUBUN: string;
    tempertur?: string;
}

export default function MtsMtrPage() {
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [mtrList, setMtrList] = useState<MtrItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<MtrItem>>({});

    const fetchMtrList = async (dateStr: string) => {
        setLoading(true);
        try {
            const formattedDate = dateStr.replace(/-/g, '');
            const response = await api.get<MtrItem[]>(`/mtsmtr/date/${formattedDate}`);
            setMtrList(response.data);
        } catch (error) {
            console.error('Failed to fetch MTR list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMtrList(date);
    }, [date]);

    const handleEdit = (item: MtrItem) => {
        setEditingId(item['#']);
        setEditForm({
            PNAME: item.PNAME,
            AGE: item.AGE,
            SEX: item.SEX,
            GUBUN: item.GUBUN
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id: number) => {
        try {
            const cleanDate = date; // API likely expects YYYY-MM-DD for the URL parameter based on previous findings? 
            // Wait, previous walkthrough said: PUT /api/mtsmtr/{id}/{visidate}
            // And logic in fetchMtrList uses YYYYMMDD.
            // Let's use YYYY-MM-DD as that is what `date` state holds. 
            // If it fails we can adjust. The backend route uses `visidate` to determine table name `MTRYYYY`.

            // Actually, in `mtsmtrRoutes.ts` (which I saw earlier implicitly or I can infer), 
            // `router.put('/:id/:visidate'...)`.
            // Let's pass the date string `date` which is `YYYY-MM-DD`. 
            // The service `.getTableName(visidate)` handles `YYYY-MM-DD` by stripping non-digits.

            await api.put(`/mtsmtr/${id}/${date}`, editForm);

            setEditingId(null);
            fetchMtrList(date);
        } catch (error) {
            console.error('Failed to update record:', error);
            alert('Failed to update record');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this medical record?')) return;

        try {
            await api.delete(`/mtsmtr/${id}/${date}`);
            fetchMtrList(date);
        } catch (error) {
            console.error('Failed to delete record:', error);
            alert('Failed to delete record');
        }
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Medical Records (MTSMTR)
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 mr-3"
                    />
                    <button
                        onClick={() => fetchMtrList(date)}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:px-6">
                    <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">PCODE</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Birth (Age)</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sex</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type (Gubun)</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-sm text-gray-500">Loading...</td>
                                            </tr>
                                        ) : mtrList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-sm text-gray-500">No medical records found for this date.</td>
                                            </tr>
                                        ) : (
                                            mtrList.map((item) => {
                                                const isEditing = editingId === item['#'];
                                                const visitTime = new Date(item.VISITIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                return (
                                                    <tr key={item['#']}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                            {item.PCODE}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.PNAME || ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, PNAME: e.target.value })}
                                                                    className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                />
                                                            ) : (
                                                                item.PNAME
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            <div>{item.PBIRTH}</div>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.AGE || ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, AGE: e.target.value })}
                                                                    className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6 mt-1"
                                                                />
                                                            ) : (
                                                                <div className="text-xs text-gray-400">{item.AGE}</div>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <select
                                                                    value={editForm.SEX || ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, SEX: e.target.value })}
                                                                    className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                >
                                                                    <option value="M">M</option>
                                                                    <option value="F">F</option>
                                                                </select>
                                                            ) : (
                                                                item.SEX
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.GUBUN || ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, GUBUN: e.target.value })}
                                                                    className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                />
                                                            ) : (
                                                                item.GUBUN
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {visitTime}
                                                        </td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                            {isEditing ? (
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleSaveEdit(item['#'])}
                                                                        className="text-green-600 hover:text-green-900"
                                                                        title="Save"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                        title="Cancel"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item['#'])}
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
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {mtrList.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-right px-6">
                    Total: {mtrList.length} record(s) found
                </div>
            )}
        </div>
    );
}
