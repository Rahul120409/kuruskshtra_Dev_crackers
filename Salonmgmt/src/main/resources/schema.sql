-- ==========================================================
-- SalonFlow AI: Supabase Database Schema
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Customer, Staff, Admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    dob DATE,
    gender VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    profile_image TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. States Table
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_states_code ON states(code);

-- 3. Cities Table (Foreign key to states)
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_city_state_code UNIQUE (state_id, code),
    CONSTRAINT uq_city_state_name UNIQUE (state_id, name)
);

CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_code ON cities(code);

-- 4. Salons Table
CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    logo TEXT,
    description TEXT,
    location_link TEXT,
    operating_schedule TEXT,
    opening_time VARCHAR(20) DEFAULT '09:00',
    closing_time VARCHAR(20) DEFAULT '21:00',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_salons_city ON salons(city);
CREATE INDEX IF NOT EXISTS idx_salons_status ON salons(status);

-- 5. Style Types Table (Categories: Haircut, Beard, Hair Color, etc.)
CREATE TABLE IF NOT EXISTS style_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    image_url TEXT,
    gender VARCHAR(20) DEFAULT 'UNISEX',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_style_types_code ON style_types(code);
CREATE INDEX IF NOT EXISTS idx_style_types_salon ON style_types(salon_id);

-- 6. Specific Styles Table (Concrete styles: Mullet, Taper Fade, Stubble, etc.)
CREATE TABLE IF NOT EXISTS specific_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_type_id UUID NOT NULL REFERENCES style_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    price NUMERIC(10, 2),
    duration_minutes INTEGER DEFAULT 30,
    image_url TEXT,
    suitable_face_shapes VARCHAR(255),
    suitable_hair_types VARCHAR(255),
    gender VARCHAR(20) DEFAULT 'UNISEX',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_specific_styles_type_id ON specific_styles(style_type_id);
CREATE INDEX IF NOT EXISTS idx_specific_styles_code ON specific_styles(code);

-- 7. Staff Table (Stylists and Barbers with specializations and status)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    experience_years INTEGER,
    profile_image TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_salon_id ON staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);

-- 8. Queue Tokens Table (Single Unified Queue for Online & Walk-In)
CREATE TABLE IF NOT EXISTS queue_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    token_number INTEGER NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    service_id UUID,
    service_name VARCHAR(255),
    service_duration_minutes INTEGER DEFAULT 30,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    staff_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    position INTEGER,
    estimated_wait_minutes INTEGER,
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP WITHOUT TIME ZONE,
    started_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uq_salon_date_token UNIQUE (salon_id, queue_date, token_number)
);

CREATE INDEX IF NOT EXISTS idx_queue_tokens_salon_date ON queue_tokens(salon_id, queue_date);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_status ON queue_tokens(status);

-- 9. Queue Events Table (Audit Log for Realtime and History)
CREATE TABLE IF NOT EXISTS queue_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL,
    salon_id UUID NOT NULL,
    token_number INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_events_salon ON queue_events(salon_id);
CREATE INDEX IF NOT EXISTS idx_queue_events_token ON queue_events(token_id);

-- 10. Appointments Table (Advance Bookings for User Panel & Salon Panel)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    salon_name VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    service_id UUID,
    service_name VARCHAR(255),
    service_price NUMERIC(10, 2),
    service_duration_minutes INTEGER DEFAULT 30,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    staff_name VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    booking_source VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    notes TEXT,
    queue_token_id UUID,
    queue_token_number INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

