-- Migration: 002_missions_realtime.sql
-- Sistema de Missões em Tempo Real - Tabelas de Auditoria
-- Compatível com SQLite e PostgreSQL

-- Feature Flags para controle de funcionalidades
CREATE TABLE IF NOT EXISTS feature_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    flag_value BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eventos de missão (todos os eventos do sistema)
CREATE TABLE IF NOT EXISTS mission_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mission_slug VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload TEXT NOT NULL, -- JSON
    payload_hash VARCHAR(64) NOT NULL, -- SHA256 do payload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mission_events_user_id (user_id),
    INDEX idx_mission_events_mission_slug (mission_slug),
    INDEX idx_mission_events_created_at (created_at)
);

-- Tentativas de missão (resultado da avaliação)
CREATE TABLE IF NOT EXISTS mission_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mission_slug VARCHAR(100) NOT NULL,
    event_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected'
    score INTEGER DEFAULT 0,
    evidence_hash VARCHAR(64) NOT NULL, -- SHA256 da evidência
    reason TEXT, -- Motivo da aprovação/rejeição
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES mission_events(id) ON DELETE CASCADE,
    INDEX idx_mission_attempts_user_id (user_id),
    INDEX idx_mission_attempts_status (status),
    INDEX idx_mission_attempts_mission_slug (mission_slug)
);

-- Evidências de missão (provas de conclusão)
CREATE TABLE IF NOT EXISTS mission_evidences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL,
    evidence_type VARCHAR(50) NOT NULL, -- 'qr_scan', 'post_created', 'quiz_passed', 'geo_checkin'
    evidence_data TEXT NOT NULL, -- JSON com dados da evidência
    evidence_hash VARCHAR(64) NOT NULL, -- SHA256 da evidência
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (attempt_id) REFERENCES mission_attempts(id) ON DELETE CASCADE,
    INDEX idx_mission_evidences_attempt_id (attempt_id),
    INDEX idx_mission_evidences_type (evidence_type)
);

-- Regras de missão (configuração declarativa)
CREATE TABLE IF NOT EXISTS mission_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_slug VARCHAR(100) UNIQUE NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    rule_config TEXT NOT NULL, -- JSON com configuração da regra
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_mission_rules_slug (mission_slug),
    INDEX idx_mission_rules_active (is_active)
);

-- Inserir feature flag para controle do módulo
INSERT OR IGNORE INTO feature_flags (flag_name, flag_value, description) 
VALUES ('MISSIONS_REALTIME_ENABLED', TRUE, 'Habilita sistema de missões em tempo real');

-- Inserir flags adicionais para controle granular
INSERT OR IGNORE INTO feature_flags (flag_name, flag_value, description) 
VALUES 
    ('MISSIONS_QR_ENABLED', TRUE, 'Habilita missões de QR code'),
    ('MISSIONS_POST_ENABLED', TRUE, 'Habilita missões de posts'),
    ('MISSIONS_QUIZ_ENABLED', TRUE, 'Habilita missões de quiz'),
    ('MISSIONS_GEO_ENABLED', FALSE, 'Habilita missões de geolocalização');

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_mission_rules_timestamp 
    AFTER UPDATE ON mission_rules
    FOR EACH ROW
    BEGIN
        UPDATE mission_rules SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_mission_events_user_mission (user_id, mission_slug);
CREATE INDEX IF NOT EXISTS idx_mission_attempts_user_status (user_id, status);
CREATE INDEX IF NOT EXISTS idx_mission_evidences_hash (evidence_hash);

-- Comentários para documentação
-- mission_events: Registra todos os eventos do sistema (QR scan, post criado, etc.)
-- mission_attempts: Resultado da avaliação automática de cada evento
-- mission_evidences: Provas específicas de conclusão de missão
-- mission_rules: Configuração declarativa das regras de cada missão
-- feature_flags: Controle de funcionalidades do sistema









