import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePetCareRecommendations } from "./gemini";
import { 
  insertUserSchema, insertPetSchema, insertPostSchema, insertMedicalRecordSchema,
  insertLikeSchema, insertFollowSchema, insertCommentSchema, insertMatchSchema
} from "@shared/schema";
import { z } from "zod";
import { sendMail } from "./index";
import { registrationEmailTemplate, forgotPasswordEmailTemplate } from "./email-templates";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response } from 'express';
import type { StorageEngine } from 'multer';
import express from 'express';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper to send a WebSocket notification to a user
function sendUserNotification(app: Express, userId: number, payload: any): void {
  const userConnections = app.get('userConnections');
  if (userConnections && userConnections.has(String(userId))) {
    const ws = userConnections.get(String(userId));
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(payload));
    }
  }
  // Explicitly return nothing
  return;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve static files from /uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  app.use(
    '/uploads',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(uploadsDir)
  );

  // Multer setup
  const uploadStorage: StorageEngine = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      cb(null, uploadsDir);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
  });
  const upload = multer({ storage: uploadStorage });

  // Image upload endpoint
  app.post('/api/upload', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      if (userData.username) {
        const existingUsername = await storage.getUserByUsername(userData.username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      const user = await storage.createUser(userData);
      // Send registration email
      try {
        await sendMail({
          to: user.email,
          subject: "Welcome to PawConnect!",
          html: registrationEmailTemplate({ username: user.username || user.email }),
        });
      } catch (mailError) {
        // Log but don't fail registration if email fails
        console.error("Registration email failed:", mailError);
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  // Password reset (scaffold)
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No user with that email" });
      }
      // Generate a dummy reset link (replace with real token logic)
      const resetLink = `http://localhost:5000/reset-password?email=${encodeURIComponent(email)}`;
      await sendMail({
        to: user.email,
        subject: "Password Reset Request",
        html: forgotPasswordEmailTemplate({ username: user.username || user.email, resetLink }),
      });
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send password reset email", error });
    }
  });

  // User profile route
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  // User search endpoint for co-owner selection
  app.get("/api/users/search", async (req, res) => {
    try {
      const q = (req.query.q as string)?.toLowerCase() || "";
      if (!q) return res.json([]);
      let allUsers = [];
      try {
        allUsers = await storage.getAllUsers();
        if (!Array.isArray(allUsers)) {
          console.error('getAllUsers did not return an array:', allUsers);
          return res.status(500).json({ message: "Database error: getAllUsers did not return array" });
        }
      } catch (err) {
        const stack = (typeof err === 'object' && err && 'stack' in err) ? (err as any).stack : undefined;
        console.error('Error in getAllUsers:', err, stack);
        return res.status(500).json({ message: "Failed to fetch users", error: String(err), stack });
      }
      const results = allUsers.filter((user: any) =>
        (user.username && user.username.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q))
      ).map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || user.firstName || user.username || user.email
      }));
      res.json(results);
    } catch (error) {
      const stack = (typeof error === 'object' && error && 'stack' in error) ? (error as any).stack : undefined;
      console.error('User search error:', error, stack);
      res.status(500).json({ message: "Failed to search users", error: String(error), stack });
    }
  });

  // Pet routes
  app.get("/api/pets/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pets = await storage.getPetsByUserId(userId);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets", error });
    }
  });

  app.get("/api/pets/public", async (req, res) => {
    try {
      const pets = await storage.getPublicPets();
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public pets", error });
    }
  });

  app.post("/api/pets", async (req, res) => {
    try {
      // Map userId to ownerId for schema compatibility
      const { userId, ...restData } = req.body;
      const petData = insertPetSchema.parse({
        ...restData,
        ownerId: userId, // Map userId to ownerId as per schema
        userId: userId, // Keep userId for backwards compatibility
      });
      const pet = await storage.createPet(petData);
      res.json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data", error });
    }
  });

  // Get AI care recommendations for existing pet
  app.get("/api/pets/:id/recommendations", async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const recommendations = await generatePetCareRecommendations(
        pet.name,
        pet.breed,
        pet.age,
        pet.gender,
        pet.species || "dog"
      );
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations", error });
    }
  });

  app.put("/api/pets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let updates = req.body;
      // Sanitize date fields: convert empty string to null
      ['lastCheckup', 'lastVisit', 'nextVaccination'].forEach(field => {
        if (updates[field] === '') updates[field] = null;
      });
      console.log('PUT /api/pets/:id', { id, updates });
      let pet = await storage.updatePet(id, updates);
      if (!pet) {
        console.error('Pet not found or update failed', { id, updates });
        return res.status(404).json({ message: "Pet not found or update failed" });
      }
      pet = await storage.getPet(id);
      res.json(pet);
    } catch (error) {
      const stack = (typeof error === 'object' && error && 'stack' in error) ? (error as any).stack : undefined;
      console.error('Failed to update pet:', error, stack, 'Request body:', req.body);
      res.status(400).json({ message: "Failed to update pet", error: String(error), stack });
    }
  });

  // Post routes
  app.get("/api/posts/feed/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getPostsForFeed(userId);
      
      // Enrich posts with pet and user data
      const enrichedPosts = await Promise.all(posts.map(async (post) => {
        const pet = await storage.getPet(post.petId);
        const user = await storage.getUser(post.userId);
        return {
          ...post,
          pet: pet ? { ...pet } : null,
          user: user ? { ...user, password: undefined } : null,
        };
      }));
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feed", error });
    }
  });

  app.get("/api/posts/pet/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const posts = await storage.getPostsByPetId(petId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet posts", error });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });

  // Like routes
  app.post("/api/likes", async (req, res) => {
    try {
      const likeData = insertLikeSchema.parse(req.body);
      const existingLike = await storage.getLike(likeData.userId, likeData.postId);
      
      if (existingLike) {
        return res.status(400).json({ message: "Already liked this post" });
      }
      
      const like = await storage.createLike(likeData);
      res.json(like);
    } catch (error) {
      res.status(400).json({ message: "Failed to like post", error });
    }
  });

  app.delete("/api/likes/:userId/:postId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const postId = parseInt(req.params.postId);
      
      const deleted = await storage.deleteLike(userId, postId);
      if (!deleted) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      res.json({ message: "Like removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove like", error });
    }
  });

  // Follow routes
  app.post("/api/follows", async (req, res) => {
    try {
      const followData = insertFollowSchema.parse(req.body);
      const existingFollow = await storage.getFollow(followData.followerId, followData.followedPetId);
      
      if (existingFollow) {
        return res.status(400).json({ message: "Already following this pet" });
      }
      
      const follow = await storage.createFollow(followData);
      res.json(follow);
    } catch (error) {
      res.status(400).json({ message: "Failed to follow pet", error });
    }
  });

  app.delete("/api/follows/:followerId/:followedPetId", async (req, res) => {
    try {
      const followerId = parseInt(req.params.followerId);
      const followedPetId = parseInt(req.params.followedPetId);
      
      const deleted = await storage.deleteFollow(followerId, followedPetId);
      if (!deleted) {
        return res.status(404).json({ message: "Follow relationship not found" });
      }
      
      res.json({ message: "Unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow", error });
    }
  });

  app.get("/api/follows/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const follows = await storage.getFollowsByUserId(userId);
      res.json(follows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follows", error });
    }
  });

  // Medical records routes
  app.get("/api/medical-records/pet/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const records = await storage.getMedicalRecordsByPetId(petId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical records", error });
    }
  });

  app.post("/api/medical-records", async (req, res) => {
    try {
      // Parse and convert date strings to Date objects
      const { date, nextDue, ...restData } = req.body;
      const recordData = insertMedicalRecordSchema.parse({
        ...restData,
        date: date ? new Date(date) : new Date(),
        nextDue: nextDue ? new Date(nextDue) : undefined
      });
      const record = await storage.createMedicalRecord(recordData);
      res.json(record);
    } catch (error) {
      console.error("Medical record creation error:", error);
      res.status(400).json({ message: "Invalid medical record data", error });
    }
  });

  app.put("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const record = await storage.updateMedicalRecord(id, updates);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Failed to update medical record", error });
    }
  });

  // Comment routes
  app.get("/api/comments/post/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      
      // Enrich comments with user data
      const enrichedComments = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user: user ? { ...user, password: undefined } : null,
        };
      }));
      
      res.json(enrichedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments", error });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data", error });
    }
  });

  // Match routes
  app.get("/api/matches/potential/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const potentialMatches = await storage.getPotentialMatches(userId);
      res.json(potentialMatches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch potential matches", error });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      
      // Check if it's a mutual match
      const reverseMatch = await storage.getMatch(
        matchData.userId, 
        matchData.petId2, 
        matchData.petId1
      );
      
      if (reverseMatch && reverseMatch.swipeDirection === "right" && matchData.swipeDirection === "right") {
        // It's a mutual match!
        await storage.createMatch({
          ...matchData,
          isMatch: true
        });
      }
      
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data", error });
    }
  });

  app.get("/api/matches/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const matches = await storage.getMatchesByUserId(userId);
      const mutualMatches = matches.filter(match => match.isMatch);
      
      // Enrich with pet data
      const enrichedMatches = await Promise.all(mutualMatches.map(async (match) => {
        const pet1 = await storage.getPet(match.petId1);
        const pet2 = await storage.getPet(match.petId2);
        return {
          ...match,
          pet1,
          pet2
        };
      }));
      
      res.json(enrichedMatches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches", error });
    }
  });

  // Medical record routes
  app.get("/api/medical-records/pet/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const records = await storage.getMedicalRecordsByPetId(petId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical records", error });
    }
  });

  // Generate AI recommendations for a pet
  app.post("/api/ai/generate-recommendations", async (req, res) => {
    try {
      const { petId, name, breed, age, gender, species } = req.body;
      console.log('[AI] /api/ai/generate-recommendations input:', req.body);
      const { generatePetCareRecommendations } = await import("./gemini");
      const recommendations = await generatePetCareRecommendations(name, breed, age, gender, species);
      // Save recommendations to pet
      await storage.updatePet(petId, { aiRecommendations: JSON.stringify(recommendations) });
      console.log('[AI] /api/ai/generate-recommendations output:', recommendations);
      res.json({
        recommendations,
        promptMedicalRecord: true,
        message: 'Would you like to add recommended vaccinations or training to medical records?'
      });
    } catch (error) {
      console.error('[AI] /api/ai/generate-recommendations error:', error);
      res.status(500).json({ message: "Failed to generate AI recommendations", error });
    }
  });

  // Get AI recommendations for a pet (if cached or generated)
  app.get("/api/ai/recommendations/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      console.log('[AI] /api/ai/recommendations/:petId input:', petId);
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      const alwaysRegenerate = process.env.AI_ALWAYS_REGENERATE === 'true';
      let recommendations;
      if (pet.aiRecommendations && !alwaysRegenerate) {
        // Return saved recommendations
        recommendations = JSON.parse(pet.aiRecommendations);
      } else {
        const { generatePetCareRecommendations } = await import("./gemini");
        recommendations = await generatePetCareRecommendations(
          pet.name,
          pet.breed,
          pet.age,
          pet.gender,
          pet.species || "dog"
        );
        // Save recommendations to pet
        await storage.updatePet(petId, { aiRecommendations: JSON.stringify(recommendations) });
        console.log('[AI] /api/ai/recommendations/:petId output:', recommendations);
      }
      // Ensure all fields are present in logical order
      const ordered = {
        trainingPlan: recommendations.trainingPlan || {},
        careGuidelines: recommendations.careGuidelines || {},
        medicalRecommendations: recommendations.medicalRecommendations || {},
        breedingAdvice: recommendations.breedingAdvice || {},
      };
      res.json({
        recommendations: ordered,
        promptMedicalRecord: true,
        message: 'Would you like to add recommended vaccinations or training to medical records?'
      });
    } catch (error) {
      console.error('[AI] /api/ai/recommendations/:petId error:', error);
      res.status(500).json({ message: "Failed to generate recommendations", error });
    }
  });

  // Chat with AI for pet care
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, petName, petBreed, petAge, petSpecies } = req.body;
      console.log('[AI] /api/ai/chat input:', req.body);
      const systemPrompt = `You are a veterinary AI assistant for ${petName}, a ${petAge}-year-old ${petBreed} ${petSpecies || 'dog'}. 
      Provide helpful, accurate advice about pet care, health, training, and nutrition. 
      Always recommend consulting with a veterinarian for serious health concerns.`;
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
        },
        contents: message,
      });
      console.log('[AI] /api/ai/chat output:', response.text);
      res.json({ response: response.text || "I'm sorry, I couldn't process that request." });
    } catch (error) {
      console.error('[AI] /api/ai/chat error:', error);
      res.status(500).json({ message: "Failed to get AI response", error });
    }
  });

  app.get("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical record", error });
    }
  });

  app.patch("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const record = await storage.updateMedicalRecord(id, updates);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medical record", error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      // Optionally validate updates with insertUserSchema.partial()
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Emit notification to user
      sendUserNotification(app, id, { type: 'profile_update', message: 'Your profile was updated successfully.' });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user", error });
    }
  });

  // Test notification endpoint
  app.post('/api/notify', (req, res) => {
    const { userId, message, type = 'test' } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: 'userId and message are required' });
    }
    sendUserNotification(app, userId, { type, message });
    res.json({ message: 'Notification sent (if user is connected)' });
  });

  // Example: emit notification for new connection request (stub)
  app.post('/api/connections/request', async (req, res) => {
    // ... your connection request logic ...
    const { toUserId, fromUserId } = req.body;
    // Notify the recipient
    sendUserNotification(app, toUserId, { type: 'connection_request', message: `You have a new connection request from user ${fromUserId}.` });
    res.json({ message: 'Connection request sent and notification delivered (if user is connected)' });
  });

  // Example: emit notification for added as pet owner (stub)
  app.post('/api/pets/:petId/add-owner', async (req, res) => {
    // ... your add owner logic ...
    const { newOwnerId, addedByUserId } = req.body;
    // Notify the new owner
    sendUserNotification(app, newOwnerId, { type: 'added_as_owner', message: `You were added as a pet owner by user ${addedByUserId}.` });
    res.json({ message: 'Owner added and notification delivered (if user is connected)' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
