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
        <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full">
            {/* Header - Compact */}
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm mr-2">
                        {waitList.length}
                    </span>
                    {t('waitingList')}
                </h3>
            </div>

            {/* List - Full Height Scrolling */}
            <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {waitList.map((item) => {
                    // Mask Name Logic
                    let maskedName = item.PNAME;
                    if (item.PNAME && item.PNAME.length > 1) {
                        if (item.PNAME.length === 2) {
                            maskedName = `${item.PNAME[0]}*`;
                        } else {
                            maskedName = `${item.PNAME[0]}*${item.PNAME[item.PNAME.length - 1]}`;
                        }
                    }

                    // Extract Year Logic
                    let birthYear = '';
                    if (item.PBIRTH) {
                        birthYear = item.PBIRTH.substring(0, 4);
                    }

                    return (
                        <li key={`${item.PCODE}-${item.VISIDATE}`} className="px-3 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col space-y-2">
                                {/* Avatar and Name */}
                                <div className="flex items-center space-x-2">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-700 font-bold text-xs">
                                            {maskedName.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {maskedName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {birthYear}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Badge - Full Width */}
                                <div className="w-full">
                                    <span className={`w-full px-2 py-1 inline-flex justify-center text-xs font-semibold rounded ${item.JINRYO === '1'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.JINRYO === '1' ? t('statusCompleted') : t('statusWaiting')}
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
