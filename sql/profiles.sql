CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR,
    url VARCHAR,
    user_id INTEGER NOT NULL
  );