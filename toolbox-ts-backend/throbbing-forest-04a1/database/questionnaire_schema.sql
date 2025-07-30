
-- Schema for the Questionnaire Feature

-- Main table for questionnaires
CREATE TABLE IF NOT EXISTS questionnaires (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    admin_token TEXT NOT NULL,
    expires_at DATETIME,
    status TEXT NOT NULL DEFAULT 'open', -- open, closed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    one_submission_per_person BOOLEAN NOT NULL DEFAULT 0
);

-- Table for questions within a questionnaire
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    questionnaire_id TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL, -- 'single', 'multiple', 'text', 'rating'
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- Table for options available for a given question (for single/multiple choice)
CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Table to record each submission
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    questionnaire_id TEXT NOT NULL,
    submitter_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- Table for the actual answers provided in a submission
CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    answer_text TEXT,
    option_id TEXT,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
);
