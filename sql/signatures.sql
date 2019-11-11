CREATE TABLE signatures (
    id SERIAL primary key,
    signature TEXT NOT NULL,
    users_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

