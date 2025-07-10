import React, { useState } from "react";
import {
  Calendar, Activity, Shield, Camera, User, ChevronDown, ChevronUp, QrCode, Stethoscope, Utensils, Lightbulb, Clock, ChevronRight
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
}

export default function PetProfileCard({ pet, currentUser, isInitiallyFollowing = false, onFollowChange, expandable = true }: PetProfileCardProps) {
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

  // Elegant follow/connect logic
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

  // Only Connect button in expanded view
  const ActionRow = () => (
    <div className="flex items-center justify-center mb-6">
      <button
        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        title="Send Connection Request"
        disabled={isFollowing || loadingFollow}
        onClick={() => followMutation.mutate()}
      >
        <User className="w-5 h-5" />
        <span>{isFollowing ? "Connected" : loadingFollow ? "Connecting..." : "Connect"}</span>
      </button>
    </div>
  );

  // Owner avatar logic
  const ownerPhoto = pet.ownerAvatar || pet.ownerPhoto;

  // Cover image logic
  const coverImage = pet.profileImage || (pet.photos && pet.photos[0]);

  // Gradient ring for avatar
  const avatarRing = "bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 p-1 rounded-full";

  return (
    <div className="max-w-md mx-auto">
      {/* Compact Business Card View */}
      <motion.div
        className={`bg-white/80 dark:bg-zinc-900/70 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 transition-all duration-500 ${
          expandable && isExpanded ? 'mb-4' : 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl'
        }`}
        whileHover={!expandable || !isExpanded ? { y: -4, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Cover image as main visual */}
        <div
          className="relative h-40 w-full bg-gray-200"
          style={{ background: coverImage ? `url('${coverImage}') center/cover no-repeat` : undefined }}
          onClick={() => expandable && !isExpanded && setIsExpanded(true)}
        >
          {/* Owner avatar inside the circle, overlayed on cover */}
          <div className="absolute left-6 -bottom-10">
            <div className={"w-20 h-20 " + avatarRing + " shadow-xl flex items-center justify-center overflow-hidden"}>
              <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                {ownerPhoto ? (
                  <img src={ownerPhoto} alt="Owner" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Profile info */}
        <div className="px-6 pt-14 pb-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{pet.name}</h2>
            <p className="text-gray-500 dark:text-gray-300 font-medium">{pet.breed} • {pet.gender}</p>
            <p className="text-gray-400 dark:text-gray-400 text-sm">{pet.age} years old • {pet.weight}</p>
          </div>
          {/* Quick stats with glassmorphism */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {quickStats.map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60 shadow-sm">
                {stat.icon}
                <div className="text-sm font-bold text-gray-900 dark:text-white">{stat.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300">{stat.desc}</div>
              </div>
            ))}
          </div>
          {/* Expand button */}
          {expandable && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <span>View Full Profile</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Expanded Full Profile with Framer Motion */}
      <AnimatePresence>
        {expandable && isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="bg-white/90 dark:bg-zinc-900/90 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-500"
          >
            {/* Collapse button */}
            <div className="flex justify-center py-4 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm font-medium">Collapse</span>
              </button>
            </div>

            <div className="p-6">
              {/* Only Connect button */}
              <ActionRow />

              {/* Microchip ID */}
              {pet.microchipId && (
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 mb-6 backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Microchip ID</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-200 font-mono">{pet.microchipId}</span>
                  </div>
                </div>
              )}

              {/* Health timeline */}
              {(pet.nextVaccination || pet.lastCheckup) && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {pet.nextVaccination && (
                    <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-4 backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Next Vaccination</span>
                      </div>
                      <p className="text-blue-700 dark:text-blue-200 font-semibold">{formatDate(pet.nextVaccination)}</p>
                    </div>
                  )}
                  {pet.lastCheckup && (
                    <div className="bg-green-50 dark:bg-green-900/40 rounded-xl p-4 backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="w-4 h-4 text-green-600 dark:text-green-300" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-200">Last Checkup</span>
                      </div>
                      <p className="text-green-700 dark:text-green-200 font-semibold">{formatDate(pet.lastCheckup)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bio section */}
              {pet.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-200 mb-3">ABOUT {pet.name.toUpperCase()}</h3>
                  <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{pet.bio}</p>
                </div>
              )}

              {/* Photo gallery */}
              {pet.photos && pet.photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-200 mb-3">PHOTOS ({pet.photos.length})</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {pet.photos.map((photo: string, index: number) => (
                      <button
                        key={index}
                        className="aspect-square bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden focus:outline-none"
                        onClick={() => { setPhotoIndex(index); setPhotoModalOpen(true); }}
                      >
                        <img src={photo} alt={`Pet photo ${index + 1}`} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                  {/* Modal for full photo view with carousel */}
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
              )}

              {/* Expandable sections */}
              <div className="space-y-3 mb-6">
                {/* Health Tips */}
                {pet.healthTips && pet.healthTips.length > 0 && (
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60">
                    <button
                      onClick={() => toggleSection('health')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Health Tips</span>
                        <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 px-2 py-1 rounded-full text-xs font-medium">
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
                              <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                              <p className="text-sm text-gray-700 dark:text-gray-200">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Diet Recommendations */}
                {pet.dietRecommendations && (
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60">
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
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{pet.dietRecommendations}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Owner info */}
              {pet.ownerId && (
                <div className="bg-indigo-50 dark:bg-indigo-900/40 rounded-xl p-4 mb-6 backdrop-blur-sm bg-white/60 dark:bg-zinc-800/60">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Owner ID: {pet.ownerId}</p>
                      {pet.lastVisit && <p className="text-xs text-indigo-700 dark:text-indigo-200">Last visit: {formatDate(pet.lastVisit)}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
