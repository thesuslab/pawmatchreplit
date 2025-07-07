import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: number;
  userId: number;
}

export default function MedicalRecordModal({ isOpen, onClose, petId, userId }: MedicalRecordModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    cost: "",
    recordType: "checkup",
    type: "wellness",
    date: new Date(),
    nextDue: undefined as Date | undefined,
    prescriptions: [] as Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>,
    attachments: [] as string[],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMedicalRecordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/medical-records", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Medical Record Added",
        description: "The medical record has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records/pet", petId] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add medical record",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      cost: "",
      recordType: "checkup",
      type: "wellness",
      date: new Date(),
      nextDue: undefined,
      prescriptions: [],
      attachments: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const recordData = {
      ...formData,
      petId,
      date: new Date(formData.date), // Convert to Date object
      nextDue: formData.nextDue ? new Date(formData.nextDue) : null,
      prescriptions: formData.prescriptions.length > 0 ? JSON.stringify(formData.prescriptions) : null,
      cost: formData.cost || null,
      diagnosis: formData.diagnosis || null,
      treatment: formData.treatment || null,
      notes: formData.notes || null,
    };

    createMedicalRecordMutation.mutate(recordData);
  };

  const addPrescription = () => {
    setFormData({
      ...formData,
      prescriptions: [
        ...formData.prescriptions,
        {
          medicationName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });
  };

  const removePrescription = (index: number) => {
    setFormData({
      ...formData,
      prescriptions: formData.prescriptions.filter((_, i) => i !== index),
    });
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    const updatedPrescriptions = [...formData.prescriptions];
    updatedPrescriptions[index] = { ...updatedPrescriptions[index], [field]: value };
    setFormData({ ...formData, prescriptions: updatedPrescriptions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Annual Wellness Exam"
                required
              />
            </div>
            <div>
              <Label htmlFor="recordType">Record Type</Label>
              <Select value={formData.recordType} onValueChange={(value) => setFormData({ ...formData, recordType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="dental">Dental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Visit Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="e.g., $185.50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date of Visit</Label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      setFormData({ ...formData, date: date || new Date() });
                      setShowDatePicker(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Next Due Date (Optional)</Label>
              <Popover open={showNextDuePicker} onOpenChange={setShowNextDuePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.nextDue ? format(formData.nextDue, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.nextDue}
                    onSelect={(date) => {
                      setFormData({ ...formData, nextDue: date });
                      setShowNextDuePicker(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Enter diagnosis details..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="treatment">Treatment</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Enter treatment details..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="General description of the visit..."
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Prescriptions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPrescription}>
                <Plus className="h-4 w-4 mr-1" />
                Add Prescription
              </Button>
            </div>
            {formData.prescriptions.map((prescription, index) => (
              <div key={index} className="border rounded p-3 space-y-2 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removePrescription(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Medication name"
                    value={prescription.medicationName}
                    onChange={(e) => updatePrescription(index, "medicationName", e.target.value)}
                  />
                  <Input
                    placeholder="Dosage"
                    value={prescription.dosage}
                    onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Frequency"
                    value={prescription.frequency}
                    onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                  />
                  <Input
                    placeholder="Duration"
                    value={prescription.duration}
                    onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Instructions"
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMedicalRecordMutation.isPending}>
              {createMedicalRecordMutation.isPending ? "Adding..." : "Add Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}