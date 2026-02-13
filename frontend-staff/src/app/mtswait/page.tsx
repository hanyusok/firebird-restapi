'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Pencil, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { useMtsWait } from '@/context/MtsWaitContext';
import { formatDateString } from '@/lib/dateUtils';

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
    const { waitList, loading, refresh, lastUpdated } = useMtsWait();

    // Date selection might still be needed if we want to view past dates??
    // But context currently hardcodes 'today'.
    // If the requirement is to view ANY date, the Context needs to support date selection.
    // The previous implementation allowed selecting date.
    // However, the Sidebar polling was hardcoded to Today.
    // The current task was to fix the conflict where sidebar polls today, and page fetches separately.
    // If I switch page to use context, I am forcing "Today" view.
    // If the user selects another date, we should probably fetch locally or update context?
    // Given the "Kiosk Reception" nature, "Today" is the priority.
    // To support other dates, I should probably keep the date state here.
    // If date === today, use context.data. Else fetch manually.
    // OR, make context support date selection?
    // Let's stick to "Today" for the main live view, as that's what the Sidebar tracks.
    // If the user changes date, we can fall back to local fetch OR update context date.
    // Updating context date would mean Sidebar also switches (which might be weird if alarms go off for past dates?).
    // Actually, Sidebar only alarms for *new* additions.

    // Decision: For now, I will modify the page to use context for TODAY's data.
    // If date is NOT today, it will fetch manually.
    // But wait, the Context fetches EVERY 5 seconds.

    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    // We need to type cast waitList from context to local WaitItem if strictly needed, or just use it.
    // The context defines WaitItem loosely.

    const [localWaitList, setLocalWaitList] = useState<WaitItem[]>([]);
    const [isViewingToday, setIsViewingToday] = useState(true);

    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<WaitItem>>({});

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setIsViewingToday(date === today);
    }, [date]);

    useEffect(() => {
        if (isViewingToday) {
            // Use context data
            // We need to cast or map if types mismatch slightly
            setLocalWaitList(waitList as unknown as WaitItem[]);
        } else {
            fetchWaitList(date);
        }
    }, [isViewingToday, waitList, date]);

    const fetchWaitList = async (dateStr: string) => {
        // Only for non-today
        if (dateStr === new Date().toISOString().split('T')[0]) return;

        // setLoading(true); // We don't have local loading state anymore easily?
        // Let's add one or just rely on async
        try {
            const formattedDate = formatDateString(dateStr);
            const response = await api.get<WaitItem[]>(`/mtswait/date/${formattedDate}`);
            setLocalWaitList(response.data);
        } catch (error) {
            console.error('Failed to fetch wait list:', error);
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

    const handleCancelEdit = () => {
        setEditingKey(null);
        setEditForm({});
    };

    const handleSaveEdit = async (pcode: number, visidate: string) => {
        try {
            const cleanDate = formatDateString(date);
            await api.put(`/mtswait/${pcode}/${cleanDate}`, editForm);
            setEditingKey(null);

            if (isViewingToday) {
                await refresh();
            } else {
                fetchWaitList(date);
            }
        } catch (error) {
            console.error('Failed to update record:', error);
            alert('Failed to update record');
        }
    };

    const handleDelete = async (pcode: number) => {
        if (!confirm('정말로 대기자 명단에서 이 환자를 삭제하시겠습니까?')) return;

        try {
            const cleanDate = formatDateString(date);
            await api.delete(`/mtswait/${pcode}/${cleanDate}`);

            if (isViewingToday) {
                await refresh();
            } else {
                fetchWaitList(date);
            }
        } catch (error) {
            console.error('Failed to delete record:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    // Use loading from context if viewing today
    const isLoading = isViewingToday ? loading : false; // We ignore local loading for now or add duplicated state

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        대기자 명단 (MTSWAIT)
                    </h2>
                    {isViewingToday && lastUpdated && (
                        <p className="text-sm text-gray-500 mt-1">
                            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 mr-3"
                    />
                    <button
                        onClick={() => isViewingToday ? refresh() : fetchWaitList(date)}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        새로고침
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
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">환자코드</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">성명</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">생년월일 (나이)</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">주민번호</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">진료과</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">담당의</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                <span className="sr-only">기능</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {isLoading && localWaitList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-sm text-gray-500">로딩중...</td>
                                            </tr>
                                        ) : localWaitList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-sm text-gray-500">해당 날짜에 대기자가 없습니다.</td>
                                            </tr>
                                        ) : (
                                            localWaitList.map((item) => {
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
                                                            <div>{item.PBIRTH}</div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {isEditing ? (
                                                                <div className="space-y-1">
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.RESID1 || ''}
                                                                        onChange={(e) => setEditForm({ ...editForm, RESID1: e.target.value })}
                                                                        className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                        placeholder="주민앞자리"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.RESID2 || ''}
                                                                        onChange={(e) => setEditForm({ ...editForm, RESID2: e.target.value })}
                                                                        className="block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs sm:leading-6"
                                                                        placeholder="주민뒷자리"
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
                                                                        title="저장"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                        title="취소"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="수정"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item.PCODE)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="삭제"
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
            {localWaitList.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-right px-6">
                    총 {localWaitList.length} 명의 대기자가 있습니다.
                </div>
            )}
        </div>
    );
}
