import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <span className="text-xl font-bold text-blue-600">Mart Clinic Staff</span>
                            </Link>
                        </div>
                        <div className="ml-6 flex space-x-8">
                            <Link href="/mtswait" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500">
                                Waiting List (MTSWAIT)
                            </Link>
                            <Link href="/mtsmtr" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500">
                                Medical Records (MTSMTR)
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
