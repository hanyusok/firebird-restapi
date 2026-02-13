'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Person } from '@/types';
import { Search, UserPlus, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Modal from './Modal';
import { formatDateToYYYYMMDD } from '@/lib/dateUtils';

interface PersonListProps {
    onRegisterSuccess?: () => void;
}

export default function PersonList({ onRegisterSuccess }: PersonListProps) {
    const t = useTranslations('persons');
    const tActions = useTranslations('actions');
    const tMsg = useTranslations('messages');

    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    const handleSearch = async () => {
        // Privacy: Require BOTH Name and Birthdate (8 digits) to search
        if (!searchTerm || !birthDate || birthDate.length !== 8) {
            setInfoMessage(t('incompleteInput'));
            setIsInfoModalOpen(true);
            return;
        }

        setLoading(true);
        try {
            const params: any = {};
            if (searchTerm) params.pname = searchTerm;
            if (birthDate && birthDate.length === 8) {
                params.pbirth = `${birthDate.substring(0, 4)}-${birthDate.substring(4, 6)}-${birthDate.substring(6, 8)}`;
            }

            const response = await api.get<Person[]>(`/persons/search`, { params });
            setPersons(response.data);

            if (response.data.length > 0) {
                setIsResultsModalOpen(true);
            } else {
                setInfoMessage(t('noRecords'));
                setIsInfoModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch persons:', error);
            alert(tMsg('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setBirthDate('');
        setPersons([]);
        setIsResultsModalOpen(false);
        setIsInfoModalOpen(false);
    };

    const handleRegister = (person: Person) => {
        setSelectedPerson(person);
        setIsRegisterModalOpen(true);
        // We keep results modal open so user can see context or cancel confirmation
    };

    const confirmRegistration = async () => {
        if (!selectedPerson) return;
        const person = selectedPerson;

        const today = new Date();
        const visidate = today.toISOString().split('T')[0]; // Keep YYYY-MM-DD for display/check if needed? Actually checkResponse below uses formatted.
        // Wait, confirmRegistration Logic:
        // const yyyy = today.getFullYear(); ...
        // const visidate = `${yyyy}-${mm}-${dd}`;
        // const visidateFormatted = `${yyyy}${mm}${dd}`;

        const visidateFormatted = formatDateToYYYYMMDD(today);
        // visidate for display (YYYY-MM-DD) can be derived or just use the utility if needed, but currently 'visidate' variable is used for 'alreadyRegistered' message.
        // Let's keep 'visidate' as ISO string YYYY-MM-DD for readability in alert, or format it nicely.
        // The original code used manual construction.

        // Replicating original logic using utility where possible
        const visidateDisplay = today.toISOString().split('T')[0];


        try {
            // Check existence
            try {
                const checkResponse = await api.get(`/mtswait/date/${visidateFormatted}`);
                const existingRegistrations = checkResponse.data;
                if (Array.isArray(existingRegistrations)) {
                    const alreadyRegistered = existingRegistrations.some(
                        (reg: any) => reg.PCODE === person.PCODE
                    );
                    if (alreadyRegistered) {
                        alert(t('alreadyRegistered', { name: person.PNAME || '', date: visidateDisplay }));
                        setIsRegisterModalOpen(false);
                        return;
                    }
                }
            } catch (checkError: any) {
                if (checkError.response?.status !== 404) throw checkError;
            }

            await api.post('/mtswait', {
                PCODE: person.PCODE,
                VISIDATE: visidateDisplay
            });
            alert(t('registerSuccess'));
            setIsRegisterModalOpen(false);
            setIsResultsModalOpen(false); // Close list modal on success
            setSearchTerm(''); // Clear search after success
            setBirthDate('');
            setPersons([]);

            // Trigger refresh in parent
            if (onRegisterSuccess) {
                onRegisterSuccess();
            }

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            alert(t('registerFailed', { error: errorMessage }));
            setIsRegisterModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden">
            {/* Expanded Search Section - Fills More Space */}
            <div className="p-8 flex-shrink-0 flex flex-col justify-center">


                <div className="flex flex-row space-x-8 mb-8">
                    {/* Name Input - Larger */}
                    <div className="flex-1">
                        <label className="block text-2xl font-bold text-gray-700 mb-4">{t('table.name')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                className="block w-full pl-20 pr-6 py-8 border-4 border-gray-300 rounded-2xl text-5xl focus:ring-4 focus:ring-blue-500 focus:border-transparent font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-6 top-9 h-12 w-12 text-gray-400" />
                        </div>
                    </div>

                    {/* Birthdate Input - Larger */}
                    <div className="flex-1">
                        <label className="block text-2xl font-bold text-gray-700 mb-4">{t('table.birthdate')}</label>
                        <input
                            type="tel"
                            placeholder="YYYYMMDD"
                            className="block w-full px-6 py-8 border-4 border-gray-300 rounded-2xl text-5xl text-center tracking-widest focus:ring-4 focus:ring-blue-500 focus:border-transparent font-bold"
                            value={birthDate}
                            maxLength={8}
                            onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                    </div>
                </div>

                <div className="flex justify-center mb-8 space-x-4">
                    <button
                        onClick={handleClear}
                        className="w-1/3 max-w-sm py-6 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-2xl text-4xl shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-4"
                    >
                        <span>{tActions('clear')}</span>
                    </button>
                    <button
                        onClick={handleSearch}
                        className="w-full max-w-xl py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-4xl shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-4"
                    >
                        <Search className="w-10 h-10" />
                        <span>{tActions('search')}</span>
                    </button>
                </div>
            </div>

            {/* Empty Bottom Area - Now White */}
            <div className="flex-1">
                {/* Content removed, just white space */}
            </div>
            <Modal
                isOpen={isResultsModalOpen}
                onClose={() => setIsResultsModalOpen(false)}
                title={t('list')}
                footer={
                    <button
                        onClick={() => setIsResultsModalOpen(false)}
                        className="w-full py-4 bg-gray-200 text-gray-800 rounded-xl text-xl font-medium hover:bg-gray-300"
                    >
                        {tActions('close')}
                    </button>
                }
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {persons.map((person) => (
                        <div key={person.PCODE} className="bg-white border-l-8 border-blue-500 rounded-xl shadow-md p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">{person.PNAME}</h3>
                                <p className="text-xl text-gray-500">{person.PBIRTH}</p>
                            </div>
                            <button
                                onClick={() => handleRegister(person)}
                                className="ml-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center text-2xl shadow-lg transform hover:scale-105 transition-all"
                            >
                                <UserPlus className="w-8 h-8 mr-3" />
                                {t('register')}
                            </button>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Info API/Validation Modal */}
            <Modal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title={t('searchTitle')} // Keep generic title or use generic 'Notification'
                footer={
                    <button
                        onClick={() => setIsInfoModalOpen(false)}
                        className="w-full py-4 bg-gray-200 text-gray-800 rounded-xl text-xl font-medium hover:bg-gray-300"
                    >
                        {tActions('close')}
                    </button>
                }
            >
                <div className="text-center py-12">
                    <p className="text-4xl text-gray-600 mb-4">{infoMessage}</p>
                </div>
            </Modal>

            {/* Registration Confirmation Modal */}
            <Modal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                title={t('register')}
                footer={
                    <div className="flex space-x-4 w-full">
                        <button
                            onClick={() => setIsRegisterModalOpen(false)}
                            className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl text-xl font-medium hover:bg-gray-300"
                        >
                            {tActions('cancel') || 'Cancel'}
                        </button>
                        <button
                            onClick={confirmRegistration}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700 shadow-md"
                        >
                            {tActions('confirm') || 'Confirm'}
                        </button>
                    </div>
                }
            >
                <div className="text-center py-4">
                    <p className="text-7xl text-gray-800 mb-8 font-bold">
                        {selectedPerson?.PNAME} <span className="text-gray-500 font-normal text-5xl">({selectedPerson?.PBIRTH})</span>
                    </p>
                    <p className="text-6xl text-gray-600 leading-tight">
                        {t('registerConfirm', { name: '' })}
                    </p>
                </div>
            </Modal>
        </div>
    );
}
