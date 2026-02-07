import Link from 'next/link';
import { Home, Users, Calendar, Activity } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600">Firebird API</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                href="/persons"
                                className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Persons
                            </Link>
                            <Link
                                href="/mtswait"
                                className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Wait List
                            </Link>
                            <Link
                                href="/mtsmtr"
                                className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium"
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                Treatment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
