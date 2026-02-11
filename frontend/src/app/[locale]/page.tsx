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
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 text-center">
          <h1 className="text-3xl leading-8 font-extrabold text-blue-900">
            {t('title')}
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            {t('description')}
          </p>
        </div>
      </div>

      <PersonList onRegisterSuccess={handleRegistrationSuccess} />
      <WaitingList refreshTrigger={refreshTrigger} />
    </div>
  );
}
