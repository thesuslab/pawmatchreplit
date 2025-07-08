import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, X, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AIRecommendationsModal from "@/components/ai-recommendations-modal";

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
    photos: [] as string[],
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTOS = 3; // Maximum photos per pet as per .env configuration
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

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
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Pet profile created successfully! AI recommendations generated.",
      });
      
      // Check if AI recommendations were generated
      if (data.aiRecommendations) {
        setAiRecommendations(data.aiRecommendations);
        setShowRecommendations(true);
      }
      
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
        photos: [],
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
    // Map userId to ownerId for compatibility with seed data
    const petData = {
      ...formData,
      userId: userId,
      ownerId: userId,
      age: parseInt(formData.age) || 0
    };
    createPetMutation.mutate(petData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos = [...formData.photos];
    
    Array.from(files).forEach((file) => {
      if (newPhotos.length >= MAX_PHOTOS) {
        toast({
          title: "Photo limit reached",
          description: `You can only upload up to ${MAX_PHOTOS} photos per pet`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Pet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Photos Upload */}
          <div className="space-y-3">
            <Label>Pet Photos (Max {MAX_PHOTOS})</Label>
            
            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo} alt={`Pet photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Add Photo Button */}
              {formData.photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500">
              {formData.photos.length}/{MAX_PHOTOS} photos uploaded
            </p>
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

    {/* AI Recommendations Modal */}
    {showRecommendations && aiRecommendations && (
      <AIRecommendationsModal
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        petName={formData.name}
        recommendations={aiRecommendations}
      />
    )}
    </>
  );
}
