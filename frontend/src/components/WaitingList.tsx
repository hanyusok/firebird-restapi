'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useTranslations } from 'next-intl';
import { formatDateToYYYYMMDD } from '@/lib/dateUtils';

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
    onCountChange?: (count: number) => void;
}

export default function WaitingList({ refreshTrigger = 0, onCountChange }: WaitingListProps) {
    const t = useTranslations('home');
    const [waitList, setWaitList] = useState<WaitItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Notify parent of count changes
    useEffect(() => {
        if (onCountChange) {
            onCountChange(waitList.length);
        }
    }, [waitList, onCountChange]);

    const fetchWaitList = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const visidateFormatted = formatDateToYYYYMMDD(today);

            const response = await api.get<any[]>(`/mtsmtr/date/${visidateFormatted}?fin=`);
            // Map mtsmtr fields to WaitItem
            const mappedItems: WaitItem[] = response.data.map(item => ({
                PCODE: item.PCODE,
                VISIDATE: item.VISIDATE,
                PNAME: item.PNAME,
                PBIRTH: item.PBIRTH,
                TTIME: item.VISITIME, // Map VISITIME to TTIME
                JINRYO: item.FIN ? '1' : '0' // Map FIN to JINRYO (Empty -> 0/Waiting, Non-empty -> 1/Completed)
            }));
            setWaitList(mappedItems);
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

    // if (waitList.length === 0 && !loading) return null; // Logic handled by parent layout now

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
                                    <div className="flex-1 min-w-0 flex items-baseline space-x-2">
                                        <p className="text-2xl font-bold text-gray-900 truncate">
                                            {maskedName}
                                        </p>
                                        <p className="text-sm text-gray-500 flex-shrink-0">
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
