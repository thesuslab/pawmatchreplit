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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: any;
  userId: number;
}

export default function EditPetModal({ isOpen, onClose, pet, userId }: EditPetModalProps) {
  const [formData, setFormData] = useState({
    name: pet.name || '',
    species: pet.species || '',
    breed: pet.breed || '',
    age: pet.age?.toString() || '',
    weight: pet.weight || '',
    color: pet.color || '',
    gender: pet.gender || '',
    bio: pet.bio || '',
    microchipId: pet.microchipId || '',
    nextVaccination: pet.nextVaccination || '',
    lastCheckup: pet.lastCheckup || '',
    lastVisit: pet.lastVisit || '',
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
    // If coOwnerId is set, include it in the update
    updatePetMutation.mutate({ ...formData, coOwnerId: coOwnerId || undefined });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload image');
      const data = await res.json();
      setFormData((prev) => ({ ...prev, profileImage: data.url }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }));
  };

  const handlePhotosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('image', files[i]);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        urls.push(data.url);
      }
    }
    setFormData((prev) => ({ ...prev, photos: [...(prev.photos || []), ...urls] }));
  };

  const speciesOptions = [
    { value: 'Dog', label: 'Dog' },
    { value: 'Cat', label: 'Cat' },
    { value: 'Bird', label: 'Bird' },
    { value: 'Reptile', label: 'Reptile' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[80vh]">
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
          {/* Additional Photos */}
          <div>
            <Label htmlFor="photos">Additional Photos</Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosUpload}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.photos && formData.photos.map((url: string, idx: number) => (
                <img key={idx} src={url} alt="Pet" className="w-16 h-16 object-cover rounded" />
              ))}
            </div>
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
          {/* Species */}
          <div>
            <Label htmlFor="species">Species</Label>
            <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                {speciesOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Weight */}
          <div>
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              type="text"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="Enter weight (e.g. 12kg)"
            />
          </div>
          {/* Color */}
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Enter color"
            />
          </div>
          {/* Microchip ID */}
          <div>
            <Label htmlFor="microchipId">Microchip ID</Label>
            <Input
              id="microchipId"
              type="text"
              value={formData.microchipId}
              onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
              placeholder="Enter microchip ID"
            />
          </div>
          {/* Next Vaccination */}
          <div>
            <Label htmlFor="nextVaccination">Next Vaccination</Label>
            <Input
              id="nextVaccination"
              type="date"
              value={formData.nextVaccination}
              onChange={(e) => setFormData({ ...formData, nextVaccination: e.target.value })}
            />
          </div>
          {/* Last Checkup */}
          <div>
            <Label htmlFor="lastCheckup">Last Checkup</Label>
            <Input
              id="lastCheckup"
              type="date"
              value={formData.lastCheckup}
              onChange={(e) => setFormData({ ...formData, lastCheckup: e.target.value })}
            />
          </div>
          {/* Last Visit */}
          <div>
            <Label htmlFor="lastVisit">Last Visit</Label>
            <Input
              id="lastVisit"
              type="date"
              value={formData.lastVisit}
              onChange={(e) => setFormData({ ...formData, lastVisit: e.target.value })}
            />
          </div>
          {/* Co-owner linking */}
          <div>
            <Label htmlFor="co-owner">Co-owner (username or email)</Label>
            <Input
              id="co-owner"
              type="text"
              value={coOwnerQuery}
              onChange={e => {
                setCoOwnerQuery(e.target.value);
                setCoOwnerId(''); // Reset co-owner selection if query changes
              }}
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
            {coOwnerQuery && !isSearching && coOwnerResults.length === 0 && (
              <div className="text-xs text-gray-500 mt-1">No users found.</div>
            )}
            {coOwnerId && coOwnerQuery && (
              <div className="text-xs text-green-600 mt-1">Co-owner selected: {coOwnerQuery}</div>
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