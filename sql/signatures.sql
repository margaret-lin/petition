CREATE TABLE signatures (
    id SERIAL primary key,
    signature TEXT,
    users_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

