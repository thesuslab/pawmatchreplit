import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import MedicalRecordsPreview from "@/components/medical-records-preview";
import { Activity, Calendar, Plus } from "lucide-react";

interface HealthProps {
  user: any;
}

export default function Health({ user }: HealthProps) {
  const { data: userPets = [] } = useQuery({
    queryKey: ['/api/pets/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/pets/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold text-gray-900">Health Tracker</h1>
        </div>
        <button className="text-gray-600 hover:text-gray-900 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Health Overview */}
        <div className="bg-white m-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Health Overview</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Up to date</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Vaccinations current</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700">Due soon</span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">Check-up needed</p>
            </div>
          </div>
        </div>

        {/* Medical Records for each pet */}
        <MedicalRecordsPreview pets={userPets} />

        {/* Quick Actions */}
        <div className="m-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">Schedule Appointment</h3>
                <p className="text-sm text-gray-600">Book a vet visit</p>
              </div>
            </button>
            
            <button className="w-full bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">Add Vaccination</h3>
                <p className="text-sm text-gray-600">Record new vaccination</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation currentPage="health" />
    </div>
  );
}
