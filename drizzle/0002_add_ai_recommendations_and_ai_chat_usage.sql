-- Add ai_recommendations field to pets
ALTER TABLE pets ADD COLUMN ai_recommendations TEXT;

-- Create ai_chat_usage table to track daily chat usage per user and pet
CREATE TABLE ai_chat_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  pet_id INTEGER NOT NULL,
  date DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_pet_date UNIQUE(user_id, pet_id, date)
); 