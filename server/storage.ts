import { 
  users, pets, posts, medicalRecords, likes, follows, comments,
  type User, type Pet, type Post, type MedicalRecord, type Like, type Follow, type Comment,
  type InsertUser, type InsertPet, type InsertPost, type InsertMedicalRecord, 
  type InsertLike, type InsertFollow, type InsertComment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pets: Map<number, Pet>;
  private posts: Map<number, Post>;
  private medicalRecords: Map<number, MedicalRecord>;
  private likes: Map<string, Like>;
  private follows: Map<string, Follow>;
  private comments: Map<number, Comment>;
  private currentUserId: number;
  private currentPetId: number;
  private currentPostId: number;
  private currentMedicalRecordId: number;
  private currentLikeId: number;
  private currentFollowId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.posts = new Map();
    this.medicalRecords = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.comments = new Map();
    this.currentUserId = 1;
    this.currentPetId = 1;
    this.currentPostId = 1;
    this.currentMedicalRecordId = 1;
    this.currentLikeId = 1;
    this.currentFollowId = 1;
    this.currentCommentId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getPetsByUserId(userId: number): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.userId === userId);
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = this.currentPetId++;
    const pet: Pet = { ...insertPet, id };
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

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentMedicalRecordId++;
    const record: MedicalRecord = { ...insertRecord, id };
    this.medicalRecords.set(id, record);
    return record;
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

  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.currentLikeId++;
    const like: Like = { ...insertLike, id };
    this.likes.set(`${like.userId}-${like.postId}`, like);
    
    // Update post likes count
    const post = this.posts.get(like.postId);
    if (post) {
      this.posts.set(like.postId, { ...post, likesCount: (post.likesCount || 0) + 1 });
    }
    
    return like;
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

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const follow: Follow = { ...insertFollow, id };
    this.follows.set(`${follow.followerId}-${follow.followedPetId}`, follow);
    return follow;
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

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = { ...insertComment, id, timestamp: new Date() };
    this.comments.set(id, comment);
    
    // Update post comments count
    const post = this.posts.get(comment.postId);
    if (post) {
      this.posts.set(comment.postId, { ...post, commentsCount: (post.commentsCount || 0) + 1 });
    }
    
    return comment;
  }
}

export const storage = new MemStorage();
