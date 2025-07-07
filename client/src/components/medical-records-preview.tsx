import { useQuery } from "@tanstack/react-query";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface MedicalRecordsPreviewProps {
  pets: any[];
}

export default function MedicalRecordsPreview({ pets }: MedicalRecordsPreviewProps) {
  if (pets.length === 0) {
    return (
      <div className="mx-4 mb-6">
        <h2 className="text-lg font-bold mb-3">My Pets' Health</h2>
        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">No pets added yet</h3>
          <p className="text-sm text-gray-600">Add your pets to start tracking their health records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-6">
      <h2 className="text-lg font-bold mb-3">My Pets' Health</h2>
      <div className="space-y-3">
        {pets.map((pet) => (
          <PetHealthCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}

function PetHealthCard({ pet }: { pet: any }) {
  const { data: medicalRecords = [] } = useQuery({
    queryKey: ['/api/medical-records/pet', pet.id],
    queryFn: async () => {
      const response = await fetch(`/api/medical-records/pet/${pet.id}`);
      if (!response.ok) throw new Error('Failed to fetch medical records');
      return response.json();
    }
  });

  // Check vaccination status
  const vaccinations = medicalRecords.filter((record: any) => record.recordType === 'vaccination');
  const overdueVaccinations = vaccinations.filter((record: any) => {
    if (!record.nextDue) return false;
    return new Date(record.nextDue) < new Date() && !record.isCompleted;
  });

  const getHealthStatus = () => {
    if (overdueVaccinations.length > 0) {
      return {
        status: "warning",
        message: "Vaccination overdue",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: AlertCircle,
      };
    }
    
    const upcomingVaccinations = vaccinations.filter((record: any) => {
      if (!record.nextDue) return false;
      const dueDate = new Date(record.nextDue);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return dueDate <= thirtyDaysFromNow && dueDate > now && !record.isCompleted;
    });

    if (upcomingVaccinations.length > 0) {
      const nextDue = new Date(upcomingVaccinations[0].nextDue);
      return {
        status: "upcoming",
        message: `Next vaccination: ${nextDue.toLocaleDateString()}`,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: Calendar,
      };
    }

    return {
      status: "good",
      message: "Up to date",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
    };
  };

  const healthStatus = getHealthStatus();
  const StatusIcon = healthStatus.icon;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full overflow-hidden">
            {pet.profileImage ? (
              <img 
                src={pet.profileImage} 
                alt={pet.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">
                {pet.name[0]}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold">{pet.name}</h4>
            <p className="text-sm text-gray-600">{healthStatus.message}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${healthStatus.bgColor}`}>
            <StatusIcon className={`w-3 h-3 ${healthStatus.color}`} />
          </div>
          <span className={`text-sm font-medium ${healthStatus.color}`}>
            {healthStatus.status === "good" ? "Up to date" : 
             healthStatus.status === "warning" ? "Action needed" : "Due soon"}
          </span>
        </div>
      </div>
    </div>
  );
}
