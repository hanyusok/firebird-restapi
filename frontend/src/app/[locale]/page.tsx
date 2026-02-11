'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PersonList from '@/components/PersonList';
import WaitingList from '@/components/WaitingList';

export default function Home() {
  const t = useTranslations('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRegistrationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
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

      {/* Main Content - Horizontal Layout (3:1 ratio) - Fill Screen */}
      <div className="px-4 mt-4 flex gap-4 h-[calc(100vh-120px)]">
        {/* Person Search Section - 75% width, full height */}
        <div className="flex-[3] flex flex-col">
          <PersonList onRegisterSuccess={handleRegistrationSuccess} />
        </div>

        {/* Waiting List - 25% width, full height */}
        <div className="flex-[1] flex flex-col">
          <WaitingList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
