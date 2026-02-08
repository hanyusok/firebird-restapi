'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Trash2, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('wait');
    const tActions = useTranslations('actions');

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(getTodayDate());
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

            alert(t('updateSuccess'));
            setEditingKey(null);
            fetchWaitList(date);
        } catch (err: any) {
            alert(t('updateFailed', { error: err.message }));
        }
    };

    const handleDelete = async (pcode: number, visidate: string) => {
        if (!confirm(t('deleteConfirm'))) return;

        try {
            const response = await fetch(`http://localhost:3000/api/mtswait/${pcode}/${visidate}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete record');
            }

            alert(t('deleteSuccess'));
            fetchWaitList(date);
        } catch (err: any) {
            alert(t('deleteFailed', { error: err.message }));
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        &larr; {t('backToDashboard')}
                    </Link>
                </div>

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('selectDate')}
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
                    <div className="text-gray-500 italic">{t('noRecordsDate', { date })}</div>
                )}

                {!loading && !error && waitList.length > 0 && (
                    <div className="flex flex-col">
                        <div className="text-sm text-gray-600 mb-2">
                            {t('total', { count: waitList.length })}
                        </div>
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {t('table.pcode')}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {t('table.name')}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {t('table.resid1')}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {t('table.resid2')}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {t('table.visidate')}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {t('table.actions')}
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
                                                                        {tActions('save')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingKey(null)}
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                    >
                                                                        {tActions('cancel')}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title={tActions('edit')}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item.PCODE, item.VISIDATE)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title={tActions('delete')}
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
