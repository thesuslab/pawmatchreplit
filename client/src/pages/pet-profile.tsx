import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import EditPetModal from '@/components/edit-pet-modal';

export default function PetProfilePage() {
  const [match, params] = useRoute('/pet/:petId');
  const [, navigate] = useLocation();
  const petId = params?.petId;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);

  // Fetch pet info
  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: ['/api/pets', petId],
    queryFn: async () => {
      const res = await fetch(`/api/pets/${petId}`);
      if (!res.ok) throw new Error('Failed to fetch pet');
      return res.json();
    },
    enabled: !!petId,
  });

  // Fetch owner info (if pet is loaded)
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: pet && pet.ownerId ? ['/api/users', pet.ownerId] : [],
    queryFn: async () => {
      const res = await fetch(`/api/users/${pet.ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch owner');
      return res.json();
    },
    enabled: !!pet && !!pet.ownerId,
  });

  // Fetch pet posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts/pet', petId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/pet/${petId}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    enabled: !!petId,
  });

  // Fetch follow state (assume currentUser is in localStorage)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { data: follows = [] } = useQuery({
    queryKey: ['/api/follows/user', currentUser.id],
    queryFn: async () => {
      const res = await fetch(`/api/follows/user/${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to fetch follows');
      return res.json();
    },
    enabled: !!currentUser.id,
  });

  // Set follow state
  const isPetFollowed = follows.some((f: any) => f.followedPetId === Number(petId));

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isPetFollowed) {
        await apiRequest('DELETE', `/api/follows/${currentUser.id}/${petId}`);
      } else {
        await apiRequest('POST', '/api/follows', {
          followerId: currentUser.id,
          followedPetId: Number(petId),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/follows/user', currentUser.id] });
      toast({
        title: isPetFollowed ? 'Unfollowed' : 'Followed',
        description: isPetFollowed ? 'You have unfollowed this pet.' : 'You are now following this pet.',
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update follow status', variant: 'destructive' });
    },
  });

  if (petLoading) return <div className="p-8 text-center">Loading pet...</div>;
  if (!pet) return <div className="p-8 text-center">Pet not found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <div className="p-4 flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          {pet.profileImage || pet.avatar ? (
            <img src={pet.profileImage || pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{pet.name?.[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{pet.name}</h2>
          <p className="text-gray-600">{pet.breed} • {pet.gender}</p>
          <p className="text-sm text-gray-500">{pet.age} years old</p>
          {pet.species && <p className="text-sm text-gray-500">{pet.species}</p>}
        </div>
        <Button
          variant={isPetFollowed ? 'outline' : 'default'}
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
        >
          {followMutation.isPending ? '...' : isPetFollowed ? 'Unfollow' : 'Follow'}
        </Button>
      </div>
      {/* Owner Info */}
      {owner && (
        <div className="flex items-center space-x-3 p-4 border-b">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-white bg-pink-400 w-full h-full flex items-center justify-center">{owner.name?.[0]}</span>
            )}
          </div>
          <div>
            <div className="font-semibold">{owner.name}</div>
            <div className="text-xs text-gray-500">@{owner.username}</div>
          </div>
        </div>
      )}
      <div className="border-t border-gray-200 mt-4">
        <h3 className="text-lg font-semibold p-4">Posts</h3>
        {postsLoading ? (
          <div className="p-4 text-center">Loading posts...</div>
        ) : posts.length > 0 ? (
          <div className="space-y-4 p-4">
            {posts.map((post: any) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Pet post" className="w-full h-48 object-cover rounded-lg mb-2" />
                  )}
                  <div className="mb-2">
                    <span className="font-semibold">{pet.name}</span>
                    {post.caption && <span className="ml-2">{post.caption}</span>}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No posts yet.</div>
        )}
      </div>
      <Button className="absolute top-4 left-4" variant="ghost" onClick={() => window.history.back()}>
        Back
      </Button>
      {/* Edit Pet Modal */}
      {showEditPetModal && pet && (
        <EditPetModal
          isOpen={showEditPetModal}
          onClose={() => {
            setShowEditPetModal(false);
            queryClient.invalidateQueries({ queryKey: ['/api/pets', petId] });
            if (pet.ownerId) queryClient.invalidateQueries({ queryKey: ['/api/users', pet.ownerId] });
          }}
          pet={pet}
          userId={pet.ownerId}
        />
      )}
    </div>
  );
} 