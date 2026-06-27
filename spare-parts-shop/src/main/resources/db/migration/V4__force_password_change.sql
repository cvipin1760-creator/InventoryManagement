-- Migration to support forcing users to change default passwords on first login

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT FALSE;

-- Set existing users to true so we don't disrupt current accounts
UPDATE users SET password_changed = TRUE;
