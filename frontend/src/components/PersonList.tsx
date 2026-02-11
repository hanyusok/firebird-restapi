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
        <div className="space-y-6">
            {/* Search Section - Large Inputs */}
            <div className="bg-white p-6 shadow-lg rounded-xl flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.name')}</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')} // e.g., "Enter Name"
                            className="block w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-xl focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.birthdate')}</label>
                    <div className="relative">
                        <input
                            type="tel" // Triggers numeric keypad on mobile/tablet
                            placeholder="YYYYMMDD"
                            className="block w-full pl-4 pr-4 py-4 border-2 border-gray-300 rounded-xl text-xl focus:ring-blue-500 focus:border-blue-500 tracking-widest"
                            value={birthDate}
                            maxLength={8}
                            onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                    </div>
                </div>
            </div>

            {/* Results Section - Grid of Cards */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500 text-lg">{tMsg('loading')}</p>
                    </div>
                ) : persons.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {persons.map((person) => (
                            <div key={person.PCODE} className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between h-48">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{person.PNAME}</h3>
                                    <p className="text-lg text-gray-500 mt-1">{person.PBIRTH}</p>
                                </div>
                                <button
                                    onClick={() => handleRegister(person)}
                                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg transition-colors"
                                >
                                    <UserPlus className="w-6 h-6 mr-2" />
                                    {t('register')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (searchTerm || birthDate) && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">{t('noRecords')}</p>
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
