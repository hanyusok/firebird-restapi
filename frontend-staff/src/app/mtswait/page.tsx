'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Pencil, Trash2, Save, X, RefreshCw } from 'lucide-react';

interface WaitItem {
    PCODE: number;
    VISIDATE: string;
    RESID1: string;
    RESID2: string;
    PNAME: string;
    PBIRTH: string;
    ROOMNM: string;
    DEPTNM: string;
    DOCTRNM: string;
    JINRYO?: string;
}

export default function MtsWaitPage() {
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [waitList, setWaitList] = useState<WaitItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<WaitItem>>({});

    const fetchWaitList = async (dateStr: string) => {
        setLoading(true);
        try {
            const formattedDate = dateStr.replace(/-/g, '');
            const response = await api.get<WaitItem[]>(`/mtswait/date/${formattedDate}`);
            setWaitList(response.data);
        } catch (error) {
            console.error('Failed to fetch wait list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitList(date);
    }, [date]);

    const handleEdit = (item: WaitItem) => {
        const key = `${item.PCODE}-${item.VISIDATE}`;
        setEditingKey(key);
        setEditForm({
            RESID1: item.RESID1,
            RESID2: item.RESID2
        });
    };

    const handleCancelEdit = () => {
        setEditingKey(null);
        setEditForm({});
    };

    const handleSaveEdit = async (pcode: number, visidate: string) => {
        try {
            // Determine formatted date for API based on current item's visidate format
            // VISIDATE from API is typically "YYYY. MM. DD."
            // But the update endpoint expects just the YYYYMMDD string in the URL usually?
            // Actually looking at backend routes: router.put('/:pcode/:visidate', ...)
            // And service uses visidate to getTableName.
            // Let's assume we pass the raw visidate string from the item, or formatted.
            // The item.VISIDATE is "2026. 2. 11." based on previous output.
            // We need to pass clean YYYYMMDD to the API probably?
            // Let's stick to the date state variable which is "YYYY-MM-DD" and convert to "YYYYMMDD"

            const cleanDate = date.replace(/-/g, '');

            await api.put(`/mtswait/${pcode}/${cleanDate}`, editForm);

            setEditingKey(null);
            fetchWaitList(date);
        } catch (error) {
            console.error('Failed to update record:', error);
            alert('Failed to update record');
        }
    };

    const handleDelete = async (pcode: number) => {
        if (!confirm('Are you sure you want to remove this patient from the waiting list?')) return;

        try {
            const cleanDate = date.replace(/-/g, '');
            await api.delete(`/mtswait/${pcode}/${cleanDate}`);
            fetchWaitList(date);
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
                        Waiting List (MTSWAIT)
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
                        onClick={() => fetchWaitList(date)}
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
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Birth Date</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
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
                                        ) : waitList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-sm text-gray-500">No patients waiting for this date.</td>
                                            </tr>
                                        ) : (
                                            waitList.map((item) => {
                                                const isEditing = editingKey === `${item.PCODE}-${item.VISIDATE}`;
                                                return (
                                                    <tr key={`${item.PCODE}-${item.VISIDATE}`}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                            {item.PCODE}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {item.PNAME}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {item.PBIRTH}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <div className="space-y-1">
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.RESID1 || ''}
                                                                        onChange={(e) => setEditForm({ ...editForm, RESID1: e.target.value })}
                                                                        className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                        placeholder="RESID1"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.RESID2 || ''}
                                                                        onChange={(e) => setEditForm({ ...editForm, RESID2: e.target.value })}
                                                                        className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                        placeholder="RESID2"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs">
                                                                    <div>{item.RESID1}</div>
                                                                    {/* <div>{item.RESID2}</div> */}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {item.DEPTNM}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {item.DOCTRNM}
                                                        </td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                            {isEditing ? (
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleSaveEdit(item.PCODE, item.VISIDATE)}
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
                                                                        onClick={() => handleDelete(item.PCODE)}
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
            {waitList.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-right px-6">
                    Total: {waitList.length} patient(s) waiting
                </div>
            )}
        </div>
    );
}
