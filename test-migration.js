// Simple migration test script
import { storage } from './server/storage.js';

async function testMigration() {
  console.log('🧪 Testing PostgreSQL migration...');
  
  try {
    // Test user creation
    console.log('Creating test user...');
    const testUser = await storage.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    });
    console.log('✅ User created:', testUser.username);
    
    // Test pet creation
    console.log('Creating test pet...');
    const testPet = await storage.createPet({
      ownerId: testUser.id,
      userId: testUser.id,
      name: 'Test Pet',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Male',
      species: 'Dog',
      isPublic: true
    });
    console.log('✅ Pet created:', testPet.name);
    
    // Test medical record creation
    console.log('Creating test medical record...');
    const testRecord = await storage.createMedicalRecord({
      petId: testPet.id,
      title: 'Test Vaccination',
      recordType: 'vaccination',
      date: new Date(),
      description: 'Annual vaccination check'
    });
    console.log('✅ Medical record created:', testRecord.title);
    
    console.log('🎉 Migration test completed successfully!');
    console.log('Database is ready and all operations working.');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  }
}

testMigration();