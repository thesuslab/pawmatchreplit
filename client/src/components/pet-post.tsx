import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';

interface PetPostProps {
  post: any;
  currentUser: any;
}

export default function PetPost({ post, currentUser }: PetPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/likes/${currentUser.id}/${post.id}`);
      } else {
        await apiRequest("POST", "/api/likes", {
          userId: currentUser.id,
          postId: post.id,
        });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed', currentUser.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/follows/${currentUser.id}/${post.pet.id}`);
    },
    onSuccess: () => {
      toast({ title: 'Unfollowed', description: `You have unfollowed ${post.pet.name}` });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed', currentUser.id] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to unfollow', variant: 'destructive' });
    },
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <article className="bg-white mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full overflow-hidden cursor-pointer" onClick={() => window.location.href = `/pet/${post.pet.id}`}>
            {post.pet?.profileImage ? (
              <img 
                src={post.pet.profileImage} 
                alt={post.pet?.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {post.pet?.name?.[0] || "P"}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{post.pet?.name || "Pet"}</h3>
            <p className="text-xs text-gray-500">{post.location || "Unknown location"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.pet?.isPublic && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              Public
            </span>
          )}
          <button className="text-gray-500 hover:text-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span><MoreHorizontal className="w-5 h-5" /></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => unfollowMutation.mutate()} disabled={unfollowMutation.isPending}>
                  Unfollow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </button>
        </div>
      </div>

      {/* Post Image */}
      <div className="w-full aspect-square bg-gray-100">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt="Pet post" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => likeMutation.mutate()}
              className="hover:scale-110 transition-transform"
              disabled={likeMutation.isPending}
            >
              <Heart 
                className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
              />
            </button>
            <button className="hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-gray-700" />
            </button>
            <button className="hover:scale-110 transition-transform">
              <Send className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <button className="hover:scale-110 transition-transform">
            <Bookmark className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-2">
          {post.likesCount || 0} likes
        </p>

        {/* Post Caption */}
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{post.pet?.name || "Pet"}</span>
            <span className="ml-1">{post.caption}</span>
          </p>
        )}

        {/* View Comments */}
        {post.commentsCount > 0 && (
          <button className="text-gray-500 text-sm mt-1">
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Time */}
        <p className="text-gray-500 text-xs mt-1">
          {formatTimeAgo(post.timestamp)}
        </p>
      </div>
    </article>
  );
}
