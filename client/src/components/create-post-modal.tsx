import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import imageCompression from 'browser-image-compression';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export default function CreatePostModal({ isOpen, onClose, userId }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    petId: "",
    imageUrl: "",
    caption: "",
    location: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userPets = [] } = useQuery({
    queryKey: ['/api/pets/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/pets/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest("POST", "/api/posts", {
        ...postData,
        userId,
        petId: parseInt(postData.petId),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Post created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed', userId] });
      onClose();
      setFormData({
        petId: "",
        imageUrl: "",
        caption: "",
        location: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId || !formData.imageUrl) {
      toast({
        title: "Error",
        description: "Please select a pet and add a photo",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(formData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Compress the image before reading
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to compress image',
        variant: 'destructive',
      });
    }
  };

  if (userPets.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add a Pet First</h3>
            <p className="text-gray-600 mb-4">You need to add at least one pet before creating posts.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Selection */}
          <div>
            <Label htmlFor="petId">Select Pet *</Label>
            <Select value={formData.petId} onValueChange={(value) => setFormData({ ...formData, petId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a pet" />
              </SelectTrigger>
              <SelectContent>
                {userPets.map((pet: any) => (
                  <SelectItem key={pet.id} value={pet.id.toString()}>
                    {pet.name} - {pet.breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Photo *</Label>
            <div className="mt-2">
              {formData.imageUrl ? (
                <div className="relative">
                  <img 
                    src={formData.imageUrl} 
                    alt="Post preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <Camera className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Write a caption..."
              rows={3}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Add location"
                className="pl-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600" 
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Posting..." : "Share Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}