import { 
  users, pets, posts, medicalRecords, likes, follows, comments, matches,
  type User, type Pet, type Post, type MedicalRecord, type Like, type Follow, type Comment, type Match,
  type InsertUser, type InsertPet, type InsertPost, type InsertMedicalRecord, 
  type InsertLike, type InsertFollow, type InsertComment, type InsertMatch
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Pet operations
  getPet(id: number): Promise<Pet | undefined>;
  getPetsByUserId(userId: number): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, updates: Partial<Pet>): Promise<Pet | undefined>;
  getPublicPets(): Promise<Pet[]>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostsByPetId(petId: number): Promise<Post[]>;
  getPostsForFeed(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;

  // Medical record operations
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPetId(petId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, updates: Partial<MedicalRecord>): Promise<MedicalRecord | undefined>;

  // Like operations
  getLike(userId: number, postId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId: number): Promise<boolean>;
  getLikesByPostId(postId: number): Promise<Like[]>;

  // Follow operations
  getFollow(followerId: number, followedPetId: number): Promise<Follow | undefined>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followedPetId: number): Promise<boolean>;
  getFollowsByUserId(userId: number): Promise<Follow[]>;

  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Match operations
  getMatch(userId: number, petId1: number, petId2: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUserId(userId: number): Promise<Match[]>;
  getPotentialMatches(userId: number): Promise<Pet[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pets: Map<number, Pet>;
  private posts: Map<number, Post>;
  private medicalRecords: Map<number, MedicalRecord>;
  private likes: Map<string, Like>;
  private follows: Map<string, Follow>;
  private comments: Map<number, Comment>;
  private matches: Map<string, Match>;
  private currentUserId: number;
  private currentPetId: number;
  private currentPostId: number;
  private currentMedicalRecordId: number;
  private currentLikeId: number;
  private currentFollowId: number;
  private currentCommentId: number;
  private currentMatchId: number;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.posts = new Map();
    this.medicalRecords = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.comments = new Map();
    this.matches = new Map();
    this.currentUserId = 1;
    this.currentPetId = 1;
    this.currentPostId = 1;
    this.currentMedicalRecordId = 1;
    this.currentLikeId = 1;
    this.currentFollowId = 1;
    this.currentCommentId = 1;
    this.currentMatchId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      username: insertUser.username || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || "client",
      phone: insertUser.phone || null,
      department: insertUser.department || null,
      specialization: insertUser.specialization || null,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      isActive: insertUser.isActive ?? true
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getPetsByUserId(userId: number): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.userId === userId || pet.ownerId === userId);
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = this.currentPetId++;
    const pet: Pet = { 
      ...insertPet, 
      id,
      ownerId: insertPet.ownerId || insertPet.userId || 0,
      userId: insertPet.userId || null,
      name: insertPet.name || '',
      species: insertPet.species || null,
      breed: insertPet.breed || '',
      age: insertPet.age ?? 0,
      gender: insertPet.gender || '',
      weight: insertPet.weight || null,
      color: insertPet.color || null,
      bio: insertPet.bio || null,
      isPublic: insertPet.isPublic ?? true,
      profileImage: insertPet.profileImage || null,
      avatar: insertPet.avatar || null,
      photos: insertPet.photos || [],
      microchipId: insertPet.microchipId || null,
      nextVaccination: insertPet.nextVaccination || null,
      lastCheckup: insertPet.lastCheckup || null,
      lastVisit: insertPet.lastVisit || null,
      healthTips: insertPet.healthTips || [],
      dietRecommendations: insertPet.dietRecommendations || null,
      aiRecommendations: insertPet.aiRecommendations ?? null,
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePet(id: number, updates: Partial<Pet>): Promise<Pet | undefined> {
    const pet = this.pets.get(id);
    if (!pet) return undefined;
    const updatedPet = { ...pet, ...updates };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  async getPublicPets(): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.isPublic);
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByPetId(petId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.petId === petId);
  }

  async getPostsForFeed(userId: number): Promise<Post[]> {
    const userPets = await this.getPetsByUserId(userId);
    const userPetIds = userPets.map(pet => pet.id);
    
    const follows = Array.from(this.follows.values()).filter(follow => follow.followerId === userId);
    const followedPetIds = follows.map(follow => follow.followedPetId);
    
    const relevantPetIds = [...userPetIds, ...followedPetIds];
    
    return Array.from(this.posts.values())
      .filter(post => relevantPetIds.includes(post.petId))
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = { 
      ...insertPost, 
      id, 
      caption: insertPost.caption || null,
      location: insertPost.location || null,
      likesCount: 0, 
      commentsCount: 0, 
      timestamp: new Date() 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    const updatedPost = { ...post, ...updates };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  // Medical record operations
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async getMedicalRecordsByPetId(petId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(record => record.petId === petId);
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentMedicalRecordId++;
    const medRecord: MedicalRecord = { 
      ...record, 
      id,
      appointmentId: record.appointmentId || null,
      veterinarianId: record.veterinarianId || null,
      description: record.description || null,
      diagnosis: record.diagnosis || null,
      treatment: record.treatment || null,
      notes: record.notes || null,
      cost: record.cost || null,
      attachments: record.attachments || [],
      prescriptions: record.prescriptions || null,
      type: record.type || null,
      nextDue: record.nextDue || null,
      isCompleted: record.isCompleted ?? false
    };
    this.medicalRecords.set(id, medRecord);
    return medRecord;
  }

  async updateMedicalRecord(id: number, updates: Partial<MedicalRecord>): Promise<MedicalRecord | undefined> {
    const record = this.medicalRecords.get(id);
    if (!record) return undefined;
    const updatedRecord = { ...record, ...updates };
    this.medicalRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  // Like operations
  async getLike(userId: number, postId: number): Promise<Like | undefined> {
    return this.likes.get(`${userId}-${postId}`);
  }

  async createLike(like: InsertLike): Promise<Like> {
    const id = this.currentLikeId++;
    const likeObj: Like = { ...like, id };
    this.likes.set(`${like.userId}-${like.postId}`, likeObj);
    
    // Update post likes count
    const post = this.posts.get(like.postId);
    if (post) {
      this.posts.set(like.postId, { ...post, likesCount: (post.likesCount || 0) + 1 });
    }
    
    return likeObj;
  }

  async deleteLike(userId: number, postId: number): Promise<boolean> {
    const deleted = this.likes.delete(`${userId}-${postId}`);
    
    if (deleted) {
      // Update post likes count
      const post = this.posts.get(postId);
      if (post && post.likesCount && post.likesCount > 0) {
        this.posts.set(postId, { ...post, likesCount: post.likesCount - 1 });
      }
    }
    
    return deleted;
  }

  async getLikesByPostId(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.postId === postId);
  }

  // Follow operations
  async getFollow(followerId: number, followedPetId: number): Promise<Follow | undefined> {
    return this.follows.get(`${followerId}-${followedPetId}`);
  }

  async createFollow(follow: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const followObj: Follow = { ...follow, id };
    this.follows.set(`${follow.followerId}-${follow.followedPetId}`, followObj);
    return followObj;
  }

  async deleteFollow(followerId: number, followedPetId: number): Promise<boolean> {
    return this.follows.delete(`${followerId}-${followedPetId}`);
  }

  async getFollowsByUserId(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followerId === userId);
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(comment => comment.postId === postId);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const commentObj: Comment = {
      ...comment,
      id,
      timestamp: new Date(),
    };
    this.comments.set(id, commentObj);
    // Update post comments count
    const post = this.posts.get(comment.postId);
    if (post) {
      this.posts.set(comment.postId, { ...post, commentsCount: (post.commentsCount || 0) + 1 });
    }
    return commentObj;
  }

  // Match operations
  async getMatch(userId: number, petId1: number, petId2: number): Promise<Match | undefined> {
    const key = `${userId}-${Math.min(petId1, petId2)}-${Math.max(petId1, petId2)}`;
    return this.matches.get(key);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const matchObj: Match = { 
      ...match, 
      id, 
      timestamp: new Date(),
      isMatch: match.isMatch ?? false
    };
    const key = `${match.userId}-${Math.min(match.petId1, match.petId2)}-${Math.max(match.petId1, match.petId2)}`;
    this.matches.set(key, matchObj);
    return matchObj;
  }

  async getMatchesByUserId(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => match.userId === userId);
  }

  async getPotentialMatches(userId: number): Promise<Pet[]> {
    const userPets = await this.getPetsByUserId(userId);
    const userPetIds = userPets.map(pet => pet.id);
    
    // Get all public pets that don't belong to the current user
    const publicPets = await this.getPublicPets();
    const potentialMatches = publicPets.filter(pet => !userPetIds.includes(pet.id));
    
    // Filter out pets that have already been swiped on
    const existingMatches = await this.getMatchesByUserId(userId);
    const swipedPetIds = new Set();
    
    existingMatches.forEach(match => {
      if (userPetIds.includes(match.petId1)) {
        swipedPetIds.add(match.petId2);
      } else {
        swipedPetIds.add(match.petId1);
      }
    });
    
    return potentialMatches.filter(pet => !swipedPetIds.has(pet.id));
  }
}

// Database Storage Implementation
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async getPetsByUserId(userId: number): Promise<Pet[]> {
    return await db.select().from(pets).where(or(eq(pets.userId, userId), eq(pets.ownerId, userId)));
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const [pet] = await db
      .insert(pets)
      .values({
        ...insertPet,
        ownerId: insertPet.ownerId || insertPet.userId || 0,
      })
      .returning();
    return pet;
  }

  async updatePet(id: number, updates: Partial<Pet>): Promise<Pet | undefined> {
    const [pet] = await db
      .update(pets)
      .set(updates)
      .where(eq(pets.id, id))
      .returning();
    return pet || undefined;
  }

  async getPublicPets(): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.isPublic, true));
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostsByPetId(petId: number): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.petId, petId)).orderBy(desc(posts.timestamp));
  }

  async getPostsForFeed(userId: number): Promise<Post[]> {
    // Return all posts from all users, ordered by timestamp descending
    return await db.select().from(posts).orderBy(desc(posts.timestamp));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  // Medical record operations
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record || undefined;
  }

  async getMedicalRecordsByPetId(petId: number): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.petId, petId)).orderBy(desc(medicalRecords.date));
  }

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const [record] = await db
      .insert(medicalRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updateMedicalRecord(id: number, updates: Partial<MedicalRecord>): Promise<MedicalRecord | undefined> {
    const [record] = await db
      .update(medicalRecords)
      .set(updates)
      .where(eq(medicalRecords.id, id))
      .returning();
    return record || undefined;
  }

  // Like operations
  async getLike(userId: number, postId: number): Promise<Like | undefined> {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return like || undefined;
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();
      
    // Update post likes count
    await db.update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, like.postId));
    
    return like;
  }

  async deleteLike(userId: number, postId: number): Promise<boolean> {
    const result = await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    if (result.rowCount && result.rowCount > 0) {
      // Update post likes count
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
      return true;
    }
    return false;
  }

  async getLikesByPostId(postId: number): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.postId, postId));
  }

  // Follow operations
  async getFollow(followerId: number, followedPetId: number): Promise<Follow | undefined> {
    const [follow] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followedPetId, followedPetId)));
    return follow || undefined;
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values(insertFollow)
      .returning();
    return follow;
  }

  async deleteFollow(followerId: number, followedPetId: number): Promise<boolean> {
    const result = await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followedPetId, followedPetId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getFollowsByUserId(userId: number): Promise<Follow[]> {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.timestamp));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
      
    // Update post comments count
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return comment;
  }

  // Match operations
  async getMatch(userId: number, petId1: number, petId2: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches)
      .where(and(
        eq(matches.userId, userId),
        or(
          and(eq(matches.petId1, petId1), eq(matches.petId2, petId2)),
          and(eq(matches.petId1, petId2), eq(matches.petId2, petId1))
        )
      ));
    return match || undefined;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values(insertMatch)
      .returning();
    return match;
  }

  async getMatchesByUserId(userId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.userId, userId)).orderBy(desc(matches.timestamp));
  }

  async getPotentialMatches(userId: number): Promise<Pet[]> {
    // Get pets that haven't been swiped on yet
    const userMatches = await this.getMatchesByUserId(userId);
    const swipedPetIds = userMatches.map(match => [match.petId1, match.petId2]).flat();
    const userPets = await this.getPetsByUserId(userId);
    const userPetIds = userPets.map(pet => pet.id);
    
    const excludedIds = [...swipedPetIds, ...userPetIds];
    
    if (excludedIds.length === 0) {
      return await this.getPublicPets();
    }
    
    return await db.select().from(pets)
      .where(and(
        eq(pets.isPublic, true),
        excludedIds.length > 0 ? sql`${pets.id} NOT IN (${sql.join(excludedIds.map(id => sql`${id}`), sql`, `)})` : sql`1=1`
      ));
  }
}

// Use DatabaseStorage for PostgreSQL persistence
export const storage = new DatabaseStorage();
