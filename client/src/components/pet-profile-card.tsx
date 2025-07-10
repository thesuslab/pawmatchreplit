import React, { useState } from "react";
import {
  Calendar, Activity, Shield, Camera, User, ChevronDown, ChevronUp, QrCode, 
  Stethoscope, Utensils, Lightbulb, Clock, ChevronRight, Heart, MapPin, 
  Star, Award, Sparkles, Crown, Diamond
} from 'lucide-react';

// Mock data for demonstration
const mockPet = {
  id: 1,
  name: "Luna",
  breed: "Golden Retriever",
  gender: "Female",
  age: 3,
  weight: "28 kg",
  bio: "Luna is a gentle and playful golden retriever who loves swimming and playing fetch. She's incredibly social and gets along well with children and other pets. Her favorite activities include long walks in the park and snuggling on the couch.",
  profileImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
  photos: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop"
  ],
  microchipId: "985141001234567",
  nextVaccination: "2024-12-15",
  lastCheckup: "2024-06-20",
  healthTips: [
    "Regular dental care prevents gum disease",
    "Daily exercise helps maintain healthy weight",
    "Grooming reduces shedding and matting"
  ],
  dietRecommendations: "High-quality protein diet with omega-3 supplements for coat health. Avoid grain-free diets unless medically necessary.",
  ownerId: "owner_123",
  ownerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  ownerName: "Sarah Johnson",
  lastVisit: "2024-07-08",
  location: "San Francisco, CA",
  rating: 4.9,
  achievements: ["Best Behaved", "Social Butterfly", "Health Champion"]
};

export default function ElegantPetProfileCard() {
  const [pet] = useState(mockPet);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

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
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      label: `${pet.age}yr`,
      desc: 'Age',
      color: 'from-emerald-500/20 to-emerald-600/20'
    },
    {
      icon: <Activity className="w-5 h-5 text-rose-500" />,
      label: '98%',
      desc: 'Health',
      color: 'from-rose-500/20 to-rose-600/20'
    },
    {
      icon: <Shield className="w-5 h-5 text-violet-500" />,
      label: pet.microchipId ? '✓' : '✗',
      desc: 'Chipped',
      color: 'from-violet-500/20 to-violet-600/20'
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleConnect = async () => {
    setLoadingFollow(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsFollowing(true);
    setLoadingFollow(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Gradient backgrounds for different sections
  const gradientBg = "bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-zinc-900 dark:via-purple-900/10 dark:to-pink-900/10";
  const cardBg = "bg-gradient-to-br from-white/95 via-white/90 to-white/85 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-900/85";

  return (
    <div className={`min-h-screen p-4 ${gradientBg} backdrop-blur-3xl`}>
      <div className="max-w-md mx-auto">
        {/* Compact Elegant Card View */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-800/50 transition-all duration-700 ${
            isExpanded ? 'mb-6 transform scale-[0.98]' : 'cursor-pointer hover:-translate-y-2 hover:shadow-3xl hover:shadow-purple-500/20'
          } backdrop-blur-xl`}
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          {/* Sophisticated Header with Floating Elements */}
          <div className="relative h-48 overflow-hidden">
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
              style={{
                backgroundImage: `url('${pet.profileImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Floating Elements */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                <Star className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                <span className="text-white text-xs font-semibold">{pet.rating}</span>
              </div>
            </div>

            {/* Owner Avatar - Floating */}
            <div className="absolute left-6 -bottom-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-orange-400 p-[3px] shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <img src={pet.ownerAvatar} alt="Owner" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {pet.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                  {pet.breed} • {pet.gender}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{pet.location}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Sophisticated Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {quickStats.map((stat, i) => (
                <div 
                  key={i} 
                  className={`text-center p-4 rounded-2xl backdrop-blur-sm bg-gradient-to-br ${stat.color} border border-white/20 dark:border-zinc-700/50 shadow-lg`}
                >
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* Achievements Bar */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {pet.achievements.map((achievement, i) => (
                <div key={i} className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-1 rounded-full whitespace-nowrap">
                  <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-200">{achievement}</span>
                </div>
              ))}
            </div>

            {/* Connect Button - Compact View */}
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnect();
                }}
                disabled={isFollowing || loadingFollow}
                className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                  isFollowing 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transform hover:scale-[1.02]'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isFollowing ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Connected</span>
                    </>
                  ) : loadingFollow ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </div>
              </button>
              
              {!isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full py-3 px-4 rounded-2xl font-semibold bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 shadow-lg backdrop-blur-sm border border-white/20 dark:border-zinc-700/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>View Full Profile</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Full Profile */}
        {isExpanded && (
          <div className={`${cardBg} rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-800/50 backdrop-blur-xl animate-in slide-in-from-bottom duration-700`}>
            {/* Elegant Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Full Profile</h3>
                  <p className="text-purple-100">Everything about {pet.name}</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Connect Section */}
              <div className="text-center">
                <button
                  onClick={handleConnect}
                  disabled={isFollowing || loadingFollow}
                  className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                    isFollowing 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transform hover:scale-[1.02]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-2">
                    {isFollowing ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Connected</span>
                      </>
                    ) : loadingFollow ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        <span>Send Connection Request</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Microchip Section */}
              {pet.microchipId && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Microchip ID</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 font-mono">{pet.microchipId}</p>
                      </div>
                    </div>
                    <Diamond className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              )}

              {/* Health Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.nextVaccination && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Next Vaccination</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200 font-semibold">{formatDate(pet.nextVaccination)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {pet.lastCheckup && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-rose-200/50 dark:border-rose-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-rose-500/20 rounded-xl">
                        <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-rose-900 dark:text-rose-100">Last Checkup</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-200 font-semibold">{formatDate(pet.lastCheckup)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              {pet.bio && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-violet-200/50 dark:border-violet-800/50">
                  <h3 className="text-lg font-bold text-violet-900 dark:text-violet-100 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    About {pet.name}
                  </h3>
                  <p className="text-violet-800 dark:text-violet-200 leading-relaxed">{pet.bio}</p>
                </div>
              )}

              {/* Photo Gallery */}
              {pet.photos && pet.photos.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-200/50 dark:border-amber-800/50">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Gallery ({pet.photos.length} photos)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pet.photos.map((photo: string, index: number) => (
                      <button
                        key={index}
                        className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        onClick={() => { setPhotoIndex(index); setPhotoModalOpen(true); }}
                      >
                        <img src={photo} alt={`${pet.name} photo ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Sections */}
              <div className="space-y-4">
                {/* Health Tips */}
                {pet.healthTips && pet.healthTips.length > 0 && (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl overflow-hidden border border-teal-200/50 dark:border-teal-800/50">
                    <button
                      onClick={() => toggleSection('health')}
                      className="w-full flex items-center justify-between p-5 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 rounded-xl">
                          <Lightbulb className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-teal-900 dark:text-teal-100">Health Tips</h4>
                          <p className="text-sm text-teal-700 dark:text-teal-200">{pet.healthTips.length} expert recommendations</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-teal-600 dark:text-teal-400 transition-transform duration-300 ${expandedSection === 'health' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'health' && (
                      <div className="px-5 pb-5 space-y-3">
                        {pet.healthTips.map((tip: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-zinc-800/50 rounded-xl">
                            <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-teal-800 dark:text-teal-200">{tip}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Diet Recommendations */}
                {pet.dietRecommendations && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl overflow-hidden border border-green-200/50 dark:border-green-800/50">
                    <button
                      onClick={() => toggleSection('diet')}
                      className="w-full flex items-center justify-between p-5 hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-xl">
                          <Utensils className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-green-900 dark:text-green-100">Diet Recommendations</h4>
                          <p className="text-sm text-green-700 dark:text-green-200">Nutritional guidance</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-green-600 dark:text-green-400 transition-transform duration-300 ${expandedSection === 'diet' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'diet' && (
                      <div className="px-5 pb-5">
                        <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl">
                          <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{pet.dietRecommendations}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Owner Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-5 border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-400 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                      <img src={pet.ownerAvatar} alt="Owner" className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-100">{pet.ownerName}</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-200">Pet Parent</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-300">Last visit: {formatDate(pet.lastVisit)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">{pet.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {photoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4">
              <button
                className="absolute top-4 right-4 text-white bg-black/40 backdrop-blur-md rounded-full p-2 z-10 hover:bg-black/60 transition-all duration-300"
                onClick={() => setPhotoModalOpen(false)}
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                  <img
                    src={pet.photos[photoIndex]}
                    alt={`${pet.name} photo ${photoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  {pet.photos.map((photo: string, idx: number) => (
                    <button
                      key={idx}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        idx === photoIndex ? 'border-purple-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setPhotoIndex(idx)}
                    >
                      <img src={photo} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}