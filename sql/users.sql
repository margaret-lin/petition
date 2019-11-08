CREATE TABLE signatures (
    id SERIAL primary key,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255),
    signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

