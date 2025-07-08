import { useState, useRef } from 'react';
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

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest('PUT', `/api/users/${user.id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success!', description: 'Profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.id] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    updateUserMutation.mutate(formData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 600,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar: result }));
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
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image Upload */}
          <div>
            <Label>Profile Image</Label>
            <div className="mt-2">
              {formData.avatar ? (
                <div className="relative w-24 h-24">
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
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
                  className="w-24 h-24 bg-gray-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
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
          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          {/* Username */}
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username"
            />
          </div>
          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
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
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 