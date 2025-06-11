CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, role) VALUES
('Production User', 'planer@fujisemec.com', 'Production Planner')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, role) VALUES
('Quality Inspector', 'quality@fujisemec.com', 'Quality Inspector')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, role) VALUES
('Administrator', 'admin@fujisemec.com', 'Administrator')
ON CONFLICT (email) DO NOTHING;