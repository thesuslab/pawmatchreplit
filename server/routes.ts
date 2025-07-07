import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePetCareRecommendations } from "./gemini";
import { 
  insertUserSchema, insertPetSchema, insertPostSchema, insertMedicalRecordSchema,
  insertLikeSchema, insertFollowSchema, insertCommentSchema, insertMatchSchema
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      
      // Generate AI-powered care recommendations
      try {
        const recommendations = await generatePetCareRecommendations(
          pet.name,
          pet.breed,
          pet.age,
          pet.gender,
          pet.species || "dog"
        );
        
        // Store recommendations as health tips
        const updatedPet = await storage.updatePet(pet.id, {
          healthTips: [
            `Training: ${recommendations.trainingPlan.basicCommands.join(', ')}`,
            `Exercise: ${recommendations.careGuidelines.exerciseRequirements}`,
            `Nutrition: ${recommendations.careGuidelines.nutritionTips.join(', ')}`,
            `Health monitoring: ${recommendations.medicalRecommendations.commonHealthIssues.join(', ')}`,
            `Breeding age: ${recommendations.breedingAdvice.optimalAge}`
          ],
          dietRecommendations: recommendations.careGuidelines.nutritionTips.join('; ')
        });
        
        res.json({ ...updatedPet, aiRecommendations: recommendations });
      } catch (aiError) {
        console.error("AI recommendations failed:", aiError);
        res.json(pet); // Return pet without AI recommendations if AI fails
      }
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
      const updates = req.body;
      const pet = await storage.updatePet(id, updates);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      res.status(400).json({ message: "Failed to update pet", error });
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
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.json(record);
    } catch (error) {
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

  app.post("/api/medical-records", async (req, res) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid medical record data", error });
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

  const httpServer = createServer(app);
  return httpServer;
}
