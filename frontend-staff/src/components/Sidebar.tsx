'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, FileText, X, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Notification {
    id: number;
    message: string;
    subtext: string;
}

const Sidebar = () => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [knownPcodes, setKnownPcodes] = useState<Set<number>>(new Set());

    const navigation = [
        { name: '대기자 명단 (MTSWAIT)', href: '/mtswait', icon: Users },
        { name: '진료기록 (MTSMTR)', href: '/mtsmtr', icon: FileText },
    ];

    // Responsive width handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Notification Polling (Refactored to be cleaner)
    useEffect(() => {
        let isFirstLoad = true;

        const checkForNewRegistrations = async () => {
            try {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}${mm}${dd}`;

                const response = await api.get<any[]>(`/mtswait/date/${dateStr}`);
                const currentList = response.data;

                if (isFirstLoad) {
                    const initialPcodes = new Set(currentList.map((item: any) => item.PCODE));
                    setKnownPcodes(initialPcodes);
                    isFirstLoad = false;
                } else {
                    const newItems = currentList.filter((item: any) => !knownPcodes.has(item.PCODE));

                    if (newItems.length > 0) {
                        const newNotifications: Notification[] = newItems.map((item: any) => ({
                            id: Date.now() + Math.random(),
                            message: `신규 접수: ${item.PNAME}`,
                            subtext: `생년월일: ${item.PBIRTH}`
                        }));

                        setNotifications(prev => [...prev, ...newNotifications]);

                        const updatedPcodes = new Set(knownPcodes);
                        newItems.forEach((item: any) => updatedPcodes.add(item.PCODE));
                        setKnownPcodes(updatedPcodes);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        const intervalId = setInterval(checkForNewRegistrations, 5000);
        checkForNewRegistrations();

        return () => clearInterval(intervalId);
    }, [knownPcodes]);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <>
            <div
                className={`flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                    } shrink-0`}
            >
                <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200">
                    {!isCollapsed && (
                        <Link href="/">
                            <span className="text-xl font-bold text-blue-600 whitespace-nowrap">키오스크 접수</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 ${isCollapsed ? 'mx-auto' : ''
                            }`}
                        title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 py-4">
                    <ul role="list" className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`
                                            group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                            }
                                            ${isCollapsed ? 'justify-center' : ''}
                                        `}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <item.icon
                                            className={`h-6 w-6 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="border-t border-gray-200 p-4">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-x-3'}`}>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-gray-500">S</span>
                        </div>
                        {!isCollapsed && (
                            <span className="text-sm font-semibold leading-6 text-gray-900 truncate">Staff</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Container - Mobile Responsive */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-[calc(100vw-2rem)] sm:w-auto items-end pointer-events-none">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="bg-white border-l-4 border-blue-500 shadow-lg rounded-md p-4 w-full sm:w-80 flex items-start justify-between animate-in slide-in-from-right fade-in duration-300 pointer-events-auto"
                    >
                        <div className="flex items-start">
                            <Bell className="h-5 w-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
                            <div>
                                <h4 className="font-bold text-gray-900">{notification.message}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.subtext}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Sidebar;
