import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import { X, Trash2, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: any;
  userId: number;
}

export default function EditPetModal({ isOpen, onClose, pet, userId }: EditPetModalProps) {
  const [formData, setFormData] = useState({
    name: pet.name || '',
    breed: pet.breed || '',
    age: pet.age?.toString() || '',
    gender: pet.gender || '',
    bio: pet.bio || '',
    isPublic: pet.isPublic ?? true,
    profileImage: pet.profileImage || '',
    photos: pet.photos || [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [coOwnerQuery, setCoOwnerQuery] = useState('');
  const [coOwnerResults, setCoOwnerResults] = useState<any[]>([]);
  const [coOwnerId, setCoOwnerId] = useState(pet.coOwnerId || '');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search for co-owner
  useEffect(() => {
    if (!coOwnerQuery) {
      setCoOwnerResults([]);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(coOwnerQuery)}`);
        if (res.ok) {
          const users = await res.json();
          setCoOwnerResults(users);
        } else {
          setCoOwnerResults([]);
        }
      } catch {
        setCoOwnerResults([]);
      }
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [coOwnerQuery]);

  const updatePetMutation = useMutation({
    mutationFn: async (petData: any) => {
      const response = await apiRequest('PUT', `/api/pets/${pet.id}`, {
        ...petData,
        userId,
        age: parseInt(petData.age),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success!', description: 'Pet profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/pets/user', userId] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update pet profile',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.breed || !formData.age || !formData.gender) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    updatePetMutation.mutate({ ...formData, coOwnerId });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({ ...prev, profileImage: result }));
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

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Image Upload */}
          <div>
            <Label>Profile Image</Label>
            <div className="mt-2">
              {formData.profileImage ? (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.profileImage}
                    alt="Pet profile"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Add Image</span>
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
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
                min={0}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="gender">Gender *</Label>
              <Input
                id="gender"
                type="text"
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                placeholder="Enter gender"
              />
            </div>
          </div>
          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Write a short bio..."
              rows={3}
            />
          </div>
          {/* Co-owner linking */}
          <div>
            <Label htmlFor="co-owner">Co-owner (username or email)</Label>
            <Input
              id="co-owner"
              type="text"
              value={coOwnerQuery}
              onChange={e => setCoOwnerQuery(e.target.value)}
              placeholder="Search by username or email"
              autoComplete="off"
            />
            {isSearching && <div className="text-xs text-gray-500 mt-1">Searching...</div>}
            {coOwnerResults.length > 0 && (
              <div className="border rounded bg-white mt-1 max-h-32 overflow-y-auto z-10">
                {coOwnerResults.map((user) => (
                  <div
                    key={user.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-pink-100 ${coOwnerId === user.id ? 'bg-pink-50' : ''}`}
                    onClick={() => { setCoOwnerId(user.id); setCoOwnerQuery(user.username || user.email); setCoOwnerResults([]); }}
                  >
                    {user.name} <span className="text-xs text-gray-500">({user.username || user.email})</span>
                  </div>
                ))}
              </div>
            )}
            {coOwnerId && (
              <div className="text-xs text-green-600 mt-1">Co-owner selected</div>
            )}
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={updatePetMutation.isPending}
          >
            {updatePetMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 