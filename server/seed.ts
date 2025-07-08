import { storage } from './storage';
import type { InsertUser, InsertPet } from '@shared/schema';

async function upsertUser(user: InsertUser) {
  const existing = await storage.getUserByEmail(user.email);
  // Only update if updateUser exists, otherwise just return existing
  if (existing && typeof (storage as any).updateUser === 'function') {
    await (storage as any).updateUser(existing.id, user);
    return { ...existing, ...user };
  }
  if (existing) return existing;
  return await storage.createUser(user);
}

async function upsertPet(pet: InsertPet) {
  if (typeof pet.userId !== 'number') {
    throw new Error('pet.userId must be a number for upsertPet');
  }
  const allPets = await storage.getPetsByUserId(pet.userId);
  const existing = allPets.find(p => p.microchipId && pet.microchipId && p.microchipId === pet.microchipId);
  if (existing) {
    await storage.updatePet(existing.id, pet);
    return { ...existing, ...pet };
  }
  return await storage.createPet(pet);
}

export async function seedDatabase() {
  console.log('Starting database seeding for PawConnect...');

  try {
    // Upsert users
    console.log('Upserting users...');

    const client1 = await upsertUser({
      name: 'John Smith',
      email: 'john.smith@email.com',
      password: 'password123',
      username: 'johnsmith',
      firstName: 'John',
      lastName: 'Smith',
      role: 'client',
      phone: '+1-555-1001',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Dog lover and first-time pet owner learning about proper pet care.',
      location: 'Brooklyn, NY',
      isActive: true,
    });

    const client2 = await upsertUser({
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      password: 'password123',
      username: 'mariagarcia',
      firstName: 'Maria',
      lastName: 'Garcia',
      role: 'client',
      phone: '+1-555-1002',
      bio: 'Experienced pet owner with multiple cats and dogs.',
      location: 'Manhattan, NY',
      isActive: true,
    });

    const client3 = await upsertUser({
      name: 'Robert Chen',
      email: 'robert.chen@email.com',
      password: 'password123',
      username: 'robertchen',
      firstName: 'Robert',
      lastName: 'Chen',
      role: 'client',
      phone: '+1-555-1003',
      location: 'Queens, NY',
      isActive: true,
    });

    // Upsert pets
    console.log('Upserting pets...');

    const pet1 = await upsertPet({
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: '65.5',
      color: 'Golden',
      gender: 'male',
      ownerId: client1.id,
      userId: client1.id,
      avatar: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      bio: 'Friendly golden retriever who loves playing fetch and swimming!',
      isPublic: true,
      photos: [
        'https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
        'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
      ],
      microchipId: 'MC001234567890',
      nextVaccination: new Date('2025-08-15T10:00:00Z'),
      lastCheckup: new Date('2025-05-15T14:30:00Z'),
      lastVisit: new Date('2025-06-01T09:15:00Z'),
      healthTips: ['Regular exercise', 'Dental care', 'Weight management'],
      dietRecommendations: 'High-quality adult dog food, 2 cups twice daily',
    });

    const pet2 = await upsertPet({
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese',
      age: 2,
      weight: '8.2',
      color: 'Seal Point',
      gender: 'female',
      ownerId: client1.id,
      userId: client1.id,
      avatar: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      bio: 'Elegant Siamese cat with beautiful blue eyes and a playful personality.',
      isPublic: true,
      photos: [
        'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
      ],
      microchipId: 'MC009876543210',
      nextVaccination: new Date('2025-09-10T11:00:00Z'),
      lastCheckup: new Date('2025-04-20T16:00:00Z'),
      healthTips: ['Indoor environment', 'Regular grooming', 'Dental hygiene'],
      dietRecommendations: 'Premium cat food, 1/2 cup twice daily',
    });

    const pet3 = await upsertPet({
      name: 'Max',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 5,
      weight: '75.0',
      color: 'Black and Tan',
      gender: 'male',
      ownerId: client2.id,
      userId: client2.id,
      avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      bio: 'Loyal German Shepherd, great with kids and loves outdoor adventures.',
      isPublic: true,
      photos: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
      ],
      microchipId: 'MC001122334455',
    });

    const pet4 = await upsertPet({
      name: 'Bella',
      species: 'Cat',
      breed: 'Persian',
      age: 4,
      weight: '9.1',
      color: 'White',
      gender: 'female',
      ownerId: client2.id,
      userId: client2.id,
      avatar: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      bio: 'Beautiful Persian cat who loves to be pampered and enjoys sunny windowsills.',
      isPublic: true,
      photos: [
        'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
      ],
      microchipId: 'MC005566778899',
    });

    const pet5 = await upsertPet({
      name: 'Charlie',
      species: 'Dog',
      breed: 'Labrador',
      age: 1,
      weight: '45.3',
      color: 'Yellow',
      gender: 'male',
      ownerId: client2.id,
      userId: client2.id,
      avatar: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      bio: 'Energetic young Labrador puppy who loves everyone and everything!',
      isPublic: true,
      photos: [
        'https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
      ],
    });

    // (Optional) Upsert posts and medical records similarly if needed
    // ...

    console.log('Database seeding completed successfully!');

    return {
      users: { client1, client2, client3 },
      pets: { pet1, pet2, pet3, pet4, pet5 },
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}