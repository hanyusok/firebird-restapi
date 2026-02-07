import PersonList from '@/components/PersonList';

export default function PersonsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 shadow rounded-lg mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Person Management
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Search and view person records from the Firebird database.
                </p>
            </div>
            <PersonList />
        </div>
    );
}
