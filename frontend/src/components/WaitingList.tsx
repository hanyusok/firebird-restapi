'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useTranslations } from 'next-intl';

interface WaitItem {
    PCODE: string;
    VISIDATE: string;
    PNAME: string;
    PBIRTH: string;
    TTIME: string;
    JINRYO: string;
}

interface WaitingListProps {
    refreshTrigger?: number;
}

export default function WaitingList({ refreshTrigger = 0 }: WaitingListProps) {
    const t = useTranslations('home');
    const [waitList, setWaitList] = useState<WaitItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWaitList = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const visidateFormatted = `${yyyy}${mm}${dd}`;

            const response = await api.get<WaitItem[]>(`/mtswait/date/${visidateFormatted}`);
            setWaitList(response.data);
        } catch (error) {
            console.error('Failed to fetch wait list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitList();
        // Refresh every 30 seconds
        const interval = setInterval(fetchWaitList, 30000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    if (waitList.length === 0 && !loading) return null;

    return (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {t('waitingList')} ({waitList.length})
                </h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {waitList.map((item) => {
                    // Mask Name Logic
                    let maskedName = item.PNAME;
                    if (item.PNAME && item.PNAME.length > 1) {
                        if (item.PNAME.length === 2) {
                            maskedName = `${item.PNAME[0]}*`;
                        } else {
                            // For 3 or more characters, keep first and last, mask the middle
                            // Example: "홍길동" -> "홍*동"
                            // Example: "남궁길동" -> "남**동" (Simple approach: Start + * + End is usually enough for privacy)
                            // User asked specifically for "한*석" style.
                            maskedName = `${item.PNAME[0]}*${item.PNAME[item.PNAME.length - 1]}`;
                        }
                    }

                    // Extract Year Logic
                    let birthYear = '';
                    if (item.PBIRTH) {
                        // Assuming YYYYMMDD or YYYY-MM-DD
                        birthYear = item.PBIRTH.substring(0, 4);
                    }

                    return (
                        <li key={`${item.PCODE}-${item.VISIDATE}`} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <p className="text-lg font-bold text-gray-900">
                                        {maskedName}
                                    </p>
                                    <div className="text-md text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {birthYear}
                                    </div>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.JINRYO === '1'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.JINRYO === '1' ? 'Completed' : 'Waiting'}
                                    </span>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
