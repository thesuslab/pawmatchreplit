import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export default function AddPetModal({ isOpen, onClose, userId }: AddPetModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "",
    bio: "",
    isPublic: true,
    profileImage: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPetMutation = useMutation({
    mutationFn: async (petData: any) => {
      const response = await apiRequest("POST", "/api/pets", {
        ...petData,
        userId,
        age: parseInt(petData.age),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Pet profile created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pets/user', userId] });
      onClose();
      setFormData({
        name: "",
        breed: "",
        age: "",
        gender: "",
        bio: "",
        isPublic: true,
        profileImage: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pet profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.breed || !formData.age || !formData.gender) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createPetMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Pet
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Photo Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <button type="button" className="text-blue-600 text-sm font-medium">
              Add Photo
            </button>
          </div>

          {/* Pet Name */}
          <div>
            <Label htmlFor="name">Pet Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter pet name"
            />
          </div>

          {/* Pet Breed */}
          <div>
            <Label htmlFor="breed">Breed *</Label>
            <Input
              id="breed"
              type="text"
              required
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="Enter breed"
            />
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age">Age (years) *</Label>
              <Input
                id="age"
                type="number"
                required
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Age"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about your pet..."
              rows={3}
            />
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Public Profile</p>
              <p className="text-xs text-gray-600">Allow others to discover your pet</p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600" 
            disabled={createPetMutation.isPending}
          >
            {createPetMutation.isPending ? "Creating..." : "Create Pet Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
