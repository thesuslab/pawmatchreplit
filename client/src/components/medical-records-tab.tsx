import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Heart, Pill, Stethoscope, Plus, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import MedicalRecordModal from "./medical-record-modal";

interface MedicalRecordsTabProps {
  pet: any;
  userId: number;
}

export default function MedicalRecordsTab({ pet, userId }: MedicalRecordsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: medicalRecords = [], isLoading } = useQuery({
    queryKey: ["/api/medical-records/pet", pet.id],
    queryFn: async () => {
      const response = await fetch(`/api/medical-records/pet/${pet.id}`);
      if (!response.ok) throw new Error("Failed to fetch medical records");
      return response.json();
    },
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Heart className="h-4 w-4" />;
      case "surgery":
        return <Stethoscope className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "checkup":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "vaccination":
        return "bg-green-100 text-green-800";
      case "surgery":
        return "bg-red-100 text-red-800";
      case "medication":
        return "bg-blue-100 text-blue-800";
      case "checkup":
        return "bg-purple-100 text-purple-800";
      case "emergency":
        return "bg-orange-100 text-orange-800";
      case "dental":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingRecords = medicalRecords.filter((record: any) => 
    record.nextDue && new Date(record.nextDue) > new Date()
  );

  const pastRecords = medicalRecords.filter((record: any) => 
    !record.nextDue || new Date(record.nextDue) <= new Date()
  );

  const vaccinations = medicalRecords.filter((record: any) => record.recordType === "vaccination");
  const surgeries = medicalRecords.filter((record: any) => record.recordType === "surgery");
  const medications = medicalRecords.filter((record: any) => record.recordType === "medication");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Medical Records</h3>
        <Button onClick={() => setIsModalOpen(true)} className="bg-pink-500 hover:bg-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="surgeries">Surgeries</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {medicalRecords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">No medical records yet</p>
                <p className="text-sm text-gray-400 text-center mt-1">
                  Add your pet's first medical record to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {medicalRecords.map((record: any) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingRecords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingRecords.map((record: any) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          {vaccinations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">No vaccination records</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {vaccinations.map((record: any) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="surgeries" className="space-y-4">
          {surgeries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">No surgery records</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {surgeries.map((record: any) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          {medications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Pill className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">No medication records</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {medications.map((record: any) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MedicalRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={pet.id}
        userId={userId}
      />
    </div>
  );
}

function MedicalRecordCard({ record }: { record: any }) {
  const getRecordIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Heart className="h-4 w-4" />;
      case "surgery":
        return <Stethoscope className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "checkup":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "vaccination":
        return "bg-green-100 text-green-800";
      case "surgery":
        return "bg-red-100 text-red-800";
      case "medication":
        return "bg-blue-100 text-blue-800";
      case "checkup":
        return "bg-purple-100 text-purple-800";
      case "emergency":
        return "bg-orange-100 text-orange-800";
      case "dental":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const prescriptions = record.prescriptions ? JSON.parse(record.prescriptions) : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getRecordIcon(record.recordType)}
            <CardTitle className="text-lg">{record.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getRecordColor(record.recordType)}>
              {record.recordType}
            </Badge>
            {record.type && (
              <Badge variant="outline">
                {record.type}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(record.date), "PPP")}</span>
          </div>
          {record.cost && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>{record.cost}</span>
            </div>
          )}
        </div>

        {record.nextDue && (
          <div className="flex items-center space-x-2 text-sm text-orange-600 mb-3">
            <Clock className="h-4 w-4" />
            <span>Next due: {format(new Date(record.nextDue), "PPP")}</span>
          </div>
        )}

        {record.diagnosis && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-1">Diagnosis</h4>
            <p className="text-sm text-gray-600">{record.diagnosis}</p>
          </div>
        )}

        {record.treatment && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-1">Treatment</h4>
            <p className="text-sm text-gray-600">{record.treatment}</p>
          </div>
        )}

        {record.description && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-1">Description</h4>
            <p className="text-sm text-gray-600">{record.description}</p>
          </div>
        )}

        {record.notes && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-1">Notes</h4>
            <p className="text-sm text-gray-600">{record.notes}</p>
          </div>
        )}

        {prescriptions.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Prescriptions</h4>
            <div className="space-y-2">
              {prescriptions.map((prescription: any, index: number) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="font-medium">{prescription.medicationName}</div>
                  <div className="text-gray-600">
                    {prescription.dosage} - {prescription.frequency} for {prescription.duration}
                  </div>
                  {prescription.instructions && (
                    <div className="text-gray-500 text-xs mt-1">
                      {prescription.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}