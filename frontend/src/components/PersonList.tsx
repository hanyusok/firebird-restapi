'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Person } from '@/types';
import { Search, UserPlus, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Modal from './Modal';

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
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    // Initial load cleared, only search on demand or input
    useEffect(() => {
        const fetchPersons = async () => {
            // Privacy: Require BOTH Name and Birthdate (8 digits) to search
            if (!searchTerm || !birthDate || birthDate.length !== 8) {
                setPersons([]);
                return;
            }

            setLoading(true);
            try {
                const params: any = {};
                if (searchTerm) params.pname = searchTerm;
                if (birthDate && birthDate.length === 8) {
                    params.pbirth = `${birthDate.substring(0, 4)}-${birthDate.substring(4, 6)}-${birthDate.substring(6, 8)}`;
                }

                if (searchTerm || (birthDate && birthDate.length === 8)) {
                    const response = await api.get<Person[]>(`/persons/search`, { params });
                    setPersons(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch persons:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchPersons();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, birthDate]);

    const handleRegister = (person: Person) => {
        setSelectedPerson(person);
        setIsRegisterModalOpen(true);
    };

    const confirmRegistration = async () => {
        if (!selectedPerson) return;
        const person = selectedPerson;

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const visidate = `${yyyy}-${mm}-${dd}`;
        const visidateFormatted = `${yyyy}${mm}${dd}`;

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
                        alert(t('alreadyRegistered', { name: person.PNAME || '', date: visidate }));
                        setIsRegisterModalOpen(false);
                        return;
                    }
                }
            } catch (checkError: any) {
                if (checkError.response?.status !== 404) throw checkError;
            }

            await api.post('/mtswait', {
                PCODE: person.PCODE,
                VISIDATE: visidate
            });
            alert(t('registerSuccess'));
            setIsRegisterModalOpen(false);
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
        <div className="flex flex-col h-full space-y-3">
            {/* Expanded Search Section - Fills More Space */}
            <div className="bg-white p-8 shadow-md rounded-lg flex-1 flex flex-col justify-center max-h-[400px]">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">환자 검색</h2>

                {/* Name Input - Larger */}
                <div className="mb-6">
                    <label className="block text-base font-medium text-gray-700 mb-3">{t('table.name')}</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="block w-full pl-14 pr-4 py-5 border-2 border-gray-300 rounded-xl text-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-5 h-7 w-7 text-gray-400" />
                    </div>
                </div>

                {/* Birthdate Input - Larger */}
                <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">{t('table.birthdate')}</label>
                    <input
                        type="tel"
                        placeholder="YYYYMMDD"
                        className="block w-full px-4 py-5 border-2 border-gray-300 rounded-xl text-2xl text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={birthDate}
                        maxLength={8}
                        onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                </div>
            </div>

            {/* Results Section - Single Column for Portrait, Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-8 bg-white rounded-lg">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 text-gray-500">{tMsg('loading')}</p>
                    </div>
                ) : persons.length > 0 ? (
                    <div className="space-y-2">
                        {persons.map((person) => (
                            <div key={person.PCODE} className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{person.PNAME}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{person.PBIRTH}</p>
                                </div>
                                <button
                                    onClick={() => handleRegister(person)}
                                    className="ml-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center text-base transition-colors shadow-sm"
                                >
                                    <UserPlus className="w-5 h-5 mr-1.5" />
                                    {t('register')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (searchTerm || birthDate) && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm px-4">{t('noRecords')}</p>
                    </div>
                )}
            </div>

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
                    <p className="text-xl text-gray-800 mb-2">
                        {selectedPerson?.PNAME} <span className="text-gray-500">({selectedPerson?.PBIRTH})</span>
                    </p>
                    <p className="text-gray-600">
                        {t('registerConfirm', { name: '' })}
                    </p>
                </div>
            </Modal>
        </div>
    );
}
