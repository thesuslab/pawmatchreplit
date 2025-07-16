import React, { useState } from "react";
import {
  Calendar, Activity, Shield, Camera, User, ChevronDown, ChevronUp, QrCode, Stethoscope, Utensils, Lightbulb, Clock, ChevronRight, Heart, MapPin, Phone, Mail, Star
} from 'lucide-react';
import { useMutation } from "@tanstack/react-query";
import { toast } from "../hooks/use-toast";
import { Dialog } from "./ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface PetProfileCardProps {
  pet: any;
  currentUser?: any;
  isInitiallyFollowing?: boolean;
  onFollowChange?: () => void;
  expandable?: boolean;
  hideConnectButton?: boolean; // NEW PROP
}

export default function PetProfileCard({ pet, currentUser, isInitiallyFollowing = false, onFollowChange, expandable = true, hideConnectButton = false }: PetProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const quickStats = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />,
      label: `${pet.age}yr`,
      desc: 'Age',
    },
    {
      icon: <Activity className="w-5 h-5 text-green-500 mx-auto mb-1" />,
      label: '98%',
      desc: 'Health',
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-500 mx-auto mb-1" />,
      label: pet.microchipId ? '✓' : '✗',
      desc: 'Chipped',
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const followMutation = useMutation({
    mutationFn: async () => {
      setLoadingFollow(true);
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUser.id, followedPetId: pet.id })
      });
      setLoadingFollow(false);
      if (!res.ok) throw new Error((await res.json()).message || "Failed to follow");
      return res.json();
    },
    onSuccess: () => {
      setIsFollowing(true);
      toast({ title: `You are now following ${pet.name}!` });
      onFollowChange && onFollowChange();
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to follow", variant: "destructive" });
    }
  });

  const ownerPhoto = pet.ownerAvatar || pet.ownerPhoto;
  const coverImage = pet.profileImage || (pet.photos && pet.photos[0]);

  return (
    <div className="max-w-sm mx-auto">
      {/* Business Card - Image First Design */}
      <motion.div
        className={`relative group cursor-pointer transition-all duration-300 ${
          expandable && isExpanded ? 'mb-4' : 'hover:scale-105 hover:shadow-2xl'
        }`}
        whileHover={!expandable || !isExpanded ? { y: -6 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={() => expandable && !isExpanded && setIsExpanded(true)}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
          
          {/* Large Pet Image */}
          <div className="relative h-80 w-full overflow-hidden">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={pet.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
                <User className="w-24 h-24 text-gray-400 dark:text-zinc-500" />
              </div>
            )}
            
            {/* Owner Profile - Positioned on the image */}
            <div className="absolute top-4 right-4">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 p-1 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {ownerPhoto ? (
                    <img src={ownerPhoto} alt="Owner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>

          {/* Minimal Info Section */}
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{pet.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{pet.breed}</p>
              {pet.bio && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                  {pet.bio}
                </p>
              )}
            </div>

            {/* Connect Button */}
            {!hideConnectButton && (
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isFollowing || loadingFollow}
                  onClick={(e) => {
                    e.stopPropagation();
                    followMutation.mutate();
                  }}
                >
                  <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
                  <span>{isFollowing ? "Connected" : loadingFollow ? "Connecting..." : "Connect"}</span>
                </button>
                {expandable && !isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Expanded Full Profile */}
      <AnimatePresence>
        {expandable && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-zinc-700"
          >
            {/* Header with collapse button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {coverImage ? (
                    <img src={coverImage} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{pet.name}'s Profile</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Complete information</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Connect Button in expanded view */}
              {!hideConnectButton && (
                <div className="flex justify-center mb-6">
                  <button
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isFollowing || loadingFollow}
                    onClick={() => followMutation.mutate()}
                  >
                    <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
                    <span>{isFollowing ? "Connected" : loadingFollow ? "Connecting..." : "Connect"}</span>
                  </button>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {quickStats.map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800">
                    {stat.icon}
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{stat.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{stat.desc}</div>
                  </div>
                ))}
              </div>

              {/* Pet Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{pet.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{pet.weight}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Age:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{pet.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Breed:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{pet.breed}</span>
                  </div>
                </div>
              </div>

              {/* Microchip ID */}
              {pet.microchipId && (
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="font-medium text-gray-900 dark:text-white">Microchip ID</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-mono text-sm">{pet.microchipId}</span>
                  </div>
                </div>
              )}

              {/* Health Information */}
              {(pet.nextVaccination || pet.lastCheckup) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {pet.nextVaccination && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Next Vaccination</span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 font-semibold">{formatDate(pet.nextVaccination)}</p>
                    </div>
                  )}
                  {pet.lastCheckup && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-900 dark:text-green-100">Last Checkup</span>
                      </div>
                      <p className="text-green-800 dark:text-green-200 font-semibold">{formatDate(pet.lastCheckup)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Full Bio */}
              {pet.bio && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">About {pet.name}</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{pet.bio}</p>
                </div>
              )}

              {/* Photo Gallery */}
              {pet.photos && pet.photos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Photos ({pet.photos.length})</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {pet.photos.map((photo: string, index: number) => (
                      <button
                        key={index}
                        className="aspect-square bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        onClick={() => { setPhotoIndex(index); setPhotoModalOpen(true); }}
                      >
                        <img src={photo} alt={`Pet photo ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Sections */}
              <div className="space-y-3 mb-6">
                {/* Health Tips */}
                {pet.healthTips && pet.healthTips.length > 0 && (
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('health')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Health Tips</span>
                        <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-xs font-medium">
                          {pet.healthTips.length}
                        </span>
                      </div>
                      {expandedSection === 'health' ?
                        <ChevronDown className="w-5 h-5 text-gray-400" /> :
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                    {expandedSection === 'health' && (
                      <div className="px-4 pb-4">
                        <div className="space-y-2">
                          {pet.healthTips.map((tip: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Diet Recommendations */}
                {pet.dietRecommendations && (
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('diet')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Utensils className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Diet Recommendations</span>
                      </div>
                      {expandedSection === 'diet' ?
                        <ChevronDown className="w-5 h-5 text-gray-400" /> :
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                    {expandedSection === 'diet' && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{pet.dietRecommendations}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Owner Information */}
              {pet.ownerId && (
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Owner ID: {pet.ownerId}</p>
                      {pet.lastVisit && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last visit: {formatDate(pet.lastVisit)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      {photoModalOpen && (
        <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="relative w-full max-w-md mx-auto">
              <button
                className="absolute top-2 right-2 text-white bg-black bg-opacity-40 rounded-full p-2 z-10"
                onClick={() => setPhotoModalOpen(false)}
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <div className="flex items-center justify-center h-96">
                <img
                  src={pet.photos[photoIndex]}
                  alt={`Pet photo ${photoIndex + 1}`}
                  className="object-contain max-h-full max-w-full rounded-2xl shadow-lg"
                />
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {pet.photos.map((photo: string, idx: number) => (
                  <button
                    key={idx}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${idx === photoIndex ? 'border-pink-500' : 'border-transparent'}`}
                    onClick={() => setPhotoIndex(idx)}
                  >
                    <img src={photo} alt="thumb" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}