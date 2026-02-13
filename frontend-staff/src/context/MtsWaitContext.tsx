'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import api from '@/lib/api';
import { formatDateToYYYYMMDD } from '@/lib/dateUtils';

// Reusing interfaces or defining new ones consistent with usage
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
    [key: string]: any; // Allow flexibility for now
}

interface Notification {
    id: number;
    message: string;
    subtext: string;
}

interface MtsWaitContextType {
    waitList: WaitItem[];
    loading: boolean;
    error: string | null;
    notifications: Notification[];
    removeNotification: (id: number) => void;
    refresh: () => Promise<void>;
    lastUpdated: Date | null;
}

const MtsWaitContext = createContext<MtsWaitContextType | undefined>(undefined);

export const MtsWaitProvider = ({ children }: { children: ReactNode }) => {
    const [waitList, setWaitList] = useState<WaitItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Polling refs
    const knownKeysRef = useRef(new Set<string>());
    const isFirstLoadRef = useRef(true);

    const fetchWaitList = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const today = new Date();
            const dateStr = formatDateToYYYYMMDD(today);

            const response = await api.get<WaitItem[]>(`/mtswait/date/${dateStr}`);
            const currentList = response.data;

            setWaitList(currentList);
            setLastUpdated(new Date());

            // Notification Logic
            if (currentList.length > 0) {
                // Create unique keys for each registration event: PCODE + RESID1 (timestamp usually)
                // NOTE: PCODE might be reused? RESID1 is time? 
                // In Sidebar it was PCODE + RESID1.
                const currentKeys = new Set(currentList.map((item) => `${item.PCODE}-${item.RESID1}`));

                if (isFirstLoadRef.current) {
                    knownKeysRef.current = currentKeys;
                    isFirstLoadRef.current = false;
                } else {
                    // Find items whose key is not in knownKeysRef
                    const newItems = currentList.filter((item) => {
                        const key = `${item.PCODE}-${item.RESID1}`;
                        return !knownKeysRef.current.has(key);
                    });

                    if (newItems.length > 0) {
                        // Play sound
                        try {
                            const audio = new Audio('/notification.mp3');
                            audio.play().catch(e => console.error('Audio play failed:', e));
                        } catch (e) {
                            console.error('Audio creation failed:', e);
                        }

                        const newNotifications: Notification[] = newItems.map((item) => ({
                            id: Date.now() + Math.random(),
                            message: `신규 접수: ${item.PNAME}`,
                            subtext: `생년월일: ${item.PBIRTH}`
                        }));

                        setNotifications(prev => [...prev, ...newNotifications]);

                        // Add new keys
                        newItems.forEach((item) => {
                            knownKeysRef.current.add(`${item.PCODE}-${item.RESID1}`);
                        });
                    }
                }
            } else {
                // If list is empty, maybe reset known keys or keep them? 
                // Careful: if list is empty, knownKeys might need clearing if we want to notify on re-add.
                // For now, let's keep it simple.
            }

        } catch (err: any) {
            console.error('Failed to fetch wait list:', err);
            setError(err.message || 'Failed to fetch');
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchWaitList();

        // Polling interval
        const intervalId = setInterval(() => {
            fetchWaitList(true);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const refresh = async () => {
        await fetchWaitList(false);
    };

    return (
        <MtsWaitContext.Provider value={{
            waitList,
            loading,
            error,
            notifications,
            removeNotification,
            refresh,
            lastUpdated
        }}>
            {children}
        </MtsWaitContext.Provider>
    );
};

export const useMtsWait = () => {
    const context = useContext(MtsWaitContext);
    if (context === undefined) {
        throw new Error('useMtsWait must be used within a MtsWaitProvider');
    }
    return context;
};
