import { storage } from './storage';

export async function seedDatabase() {
  console.log('Starting database seeding for PawConnect...');

  try {
    // Create users compatible with both systems
    console.log('Creating users...');
    
    const client1 = await storage.createUser({
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

    const client2 = await storage.createUser({
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

    const client3 = await storage.createUser({
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

    // Create pets with both social and medical data
    console.log('Creating pets...');
    
    const pet1 = await storage.createPet({
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

    const pet2 = await storage.createPet({
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

    const pet3 = await storage.createPet({
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

    const pet4 = await storage.createPet({
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

    const pet5 = await storage.createPet({
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

    // Create some social posts
    console.log('Creating posts...');
    
    await storage.createPost({
      petId: pet1.id,
      userId: client1.id,
      imageUrl: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      caption: 'Buddy had the best day at the dog park today! 🐕',
      location: 'Central Park Dog Run',
    });

    await storage.createPost({
      petId: pet2.id,
      userId: client1.id,
      imageUrl: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      caption: 'Luna found her favorite sunny spot again ☀️',
      location: 'Home sweet home',
    });

    await storage.createPost({
      petId: pet3.id,
      userId: client2.id,
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      caption: 'Max protecting our backyard like the good boy he is!',
      location: 'Backyard',
    });

    // Create medical records for health tracking
    console.log('Creating medical records...');
    
    await storage.createMedicalRecord({
      petId: pet1.id,
      veterinarianId: null,
      date: new Date('2025-06-01T09:15:00Z'),
      recordType: 'wellness',
      type: 'wellness',
      title: 'Annual Wellness Examination',
      diagnosis: 'Healthy adult dog, mild dental tartar',
      treatment: 'Dental cleaning recommended, updated vaccinations',
      notes: 'Overall excellent health. Owner educated on dental care.',
      cost: '185.50',
      attachments: [],
      prescriptions: JSON.stringify([
        {
          medicationName: 'Heartgard Plus',
          dosage: '25mg',
          frequency: 'Monthly',
          duration: '12 months',
          instructions: 'Give with food, continue year-round',
        },
      ]),
    });

    await storage.createMedicalRecord({
      petId: pet2.id,
      veterinarianId: null,
      date: new Date('2025-05-20T11:30:00Z'),
      recordType: 'surgery',
      type: 'surgery',
      title: 'Spay Surgery',
      diagnosis: 'Routine spay procedure',
      treatment: 'Ovariohysterectomy completed successfully',
      notes: 'Surgery went well. Monitor for 7-10 days.',
      cost: '450.00',
      prescriptions: JSON.stringify([
        {
          medicationName: 'Carprofen',
          dosage: '25mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Give with food for pain management',
        },
      ]),
    });

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