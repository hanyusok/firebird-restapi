'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PersonList from '@/components/PersonList';
import WaitingList from '@/components/WaitingList';

export default function Home() {
  const t = useTranslations('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasWaitItems, setHasWaitItems] = useState(false);

  const handleRegistrationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleWaitListCountChange = (count: number) => {
    setHasWaitItems(count > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
        <div className="px-6 py-4 text-center">
          <h1 className="text-2xl font-bold text-white">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Main Content - Horizontal Layout with Animation - No Margins */}
      <div className="flex gap-0 h-[calc(100vh-88px)] w-full">
        {/* Person Search Section - Expands when waiting list is empty */}
        <div
          className={`flex flex-col transition-all duration-700 ease-in-out ${hasWaitItems ? 'flex-[3] w-[75%]' : 'flex-1 w-full'
            }`}
        >
          <PersonList onRegisterSuccess={handleRegistrationSuccess} />
        </div>

        {/* Waiting List - Collapses when empty */}
        <div
          className={`flex flex-col transition-all duration-700 ease-in-out overflow-hidden ${hasWaitItems ? 'flex-[1] w-[25%] opacity-100' : 'flex-[0] w-0 opacity-0'
            }`}
        >
          <WaitingList
            refreshTrigger={refreshTrigger}
            onCountChange={handleWaitListCountChange}
          />
        </div>
      </div>
    </div>
  );
}
