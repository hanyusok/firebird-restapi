'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Person, PaginatedResponse } from '@/types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PersonList() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [birthDate, setBirthDate] = useState('');

    const fetchPersons = async () => {
        setLoading(true);
        try {
            if (searchTerm || birthDate) {
                // Use search endpoint
                const params: any = {};
                if (searchTerm) params.pname = searchTerm;
                if (birthDate) params.pbirth = birthDate;

                const response = await api.get<Person[]>(`/persons/search`, {
                    params
                });
                setPersons(response.data);
                setTotalPages(1); // Search endpoint doesn't return pagination yet
                setTotalItems(response.data.length);
            } else {
                // Use list endpoint
                const response = await api.get<PaginatedResponse<Person>>('/persons', {
                    params: { page, limit: 10 }
                });
                setPersons(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch persons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchPersons();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm, birthDate]);

    const handleRegister = async (person: Person) => {
        if (!confirm(`Register ${person.PNAME} (PCODE: ${person.PCODE}) for today?`)) return;

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const visidate = `${yyyy}-${mm}-${dd}`;
        const visidateFormatted = `${yyyy}${mm}${dd}`; // YYYYMMDD format for API

        try {
            // Check if already registered for today
            try {
                const checkResponse = await api.get(`/mtswait/date/${visidateFormatted}`);
                const existingRegistrations = checkResponse.data;

                if (Array.isArray(existingRegistrations)) {
                    const alreadyRegistered = existingRegistrations.some(
                        (reg: any) => reg.PCODE === person.PCODE
                    );

                    if (alreadyRegistered) {
                        alert(`${person.PNAME} is already registered for today (${visidate})`);
                        return;
                    }
                }
            } catch (checkError: any) {
                // If 404, no records exist for today - proceed with registration
                if (checkError.response?.status !== 404) {
                    throw checkError;
                }
            }

            // Proceed with registration
            await api.post('/mtswait', {
                PCODE: person.PCODE,
                VISIDATE: visidate
            });
            alert('Registered successfully!');
        } catch (error: any) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.message || error.message;

            // Provide user-friendly error message for constraint violations
            if (errorMessage.includes('PRIMARY') || errorMessage.includes('UNIQUE')) {
                alert(`${person.PNAME} is already registered for ${visidate}`);
            } else {
                alert('Registration failed: ' + errorMessage);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Person List <span className="text-sm text-gray-500 ml-2">({totalItems} total)</span>
                </h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            placeholder="Birthdate"
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={birthDate}
                            onChange={(e) => {
                                setBirthDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PCODE
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Birthdate
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GUBUN
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Check
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : persons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No persons found
                                    </td>
                                </tr>
                            ) : (
                                persons.map((person) => (
                                    <tr key={person.PCODE} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {person.PCODE}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {person.PNAME}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.PBIRTH}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.RELATION2 || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.LASTCHECK}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleRegister(person)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                                            >
                                                접수
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!searchTerm && !birthDate && (
                <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 shadow rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
