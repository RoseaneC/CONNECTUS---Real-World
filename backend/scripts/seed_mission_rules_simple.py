#!/usr/bin/env python3
"""
Seed Simples de Regras de Missão - Sistema de Missões em Tempo Real
Popula o banco com regras declarativas de exemplo (sem dependências de relacionamentos)
"""

import sys
import os
import json
import sqlite3
from datetime import datetime

def create_tables_simple():
    """Cria as tabelas necessárias usando SQL direto"""
    try:
        # Conectar ao banco SQLite
        conn = sqlite3.connect('connectus.db')
        cursor = conn.cursor()
        
        # Executar migration SQL
        with open('app/db/migrations/002_missions_realtime.sql', 'r', encoding='utf-8') as f:
            migration_sql = f.read()
        
        # Executar comandos SQL um por vez
        commands = migration_sql.split(';')
        for command in commands:
            command = command.strip()
            if command and not command.startswith('--'):
                try:
                    cursor.execute(command)
                except sqlite3.OperationalError as e:
                    if "already exists" not in str(e):
                        print(f"⚠️ Aviso SQL: {e}")
        
        conn.commit()
        print("✅ Tabelas criadas com sucesso")
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def seed_feature_flags_simple():
    """Insere feature flags necessárias usando SQL direto"""
    try:
        conn = sqlite3.connect('connectus.db')
        cursor = conn.cursor()
        
        flags = [
            ("MISSIONS_REALTIME_ENABLED", 1, "Habilita sistema de missões em tempo real"),
            ("MISSIONS_QR_ENABLED", 1, "Habilita missões de QR code"),
            ("MISSIONS_POST_ENABLED", 1, "Habilita missões de posts"),
            ("MISSIONS_QUIZ_ENABLED", 1, "Habilita missões de quiz"),
            ("MISSIONS_GEO_ENABLED", 0, "Habilita missões de geolocalização")
        ]
        
        for flag_name, flag_value, description in flags:
            # Verificar se já existe
            cursor.execute("SELECT id FROM feature_flags WHERE flag_name = ?", (flag_name,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO feature_flags (flag_name, flag_value, description, created_at, updated_at)
                    VALUES (?, ?, ?, datetime('now'), datetime('now'))
                """, (flag_name, flag_value, description))
                print(f"✅ Feature flag criada: {flag_name}")
            else:
                print(f"ℹ️ Feature flag já existe: {flag_name}")
        
        conn.commit()
        print("✅ Feature flags inseridas com sucesso")
        
    except Exception as e:
        print(f"❌ Erro ao inserir feature flags: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def seed_mission_rules_simple():
    """Insere regras de missão de exemplo usando SQL direto"""
    try:
        conn = sqlite3.connect('connectus.db')
        cursor = conn.cursor()
        
        # Regra 1: Onboarding QR
        onboarding_qr_config = {
            "valid_qrs": ["abc-123", "def-456", "ghi-789"],
            "score": 100,
            "description": "Missão de onboarding via QR code",
            "event_type": "qr_scanned",
            "requirements": {
                "qr_validation": True,
                "one_time_only": True
            }
        }
        
        # Regra 2: Timeline 3 Posts
        timeline_3_posts_config = {
            "min_content_length": 50,
            "required_hashtags": ["connectus", "educacao"],
            "min_posts": 3,
            "score": 150,
            "description": "Criar 3 posts na timeline com hashtags específicas",
            "event_type": "post_created",
            "requirements": {
                "content_quality": True,
                "hashtag_compliance": True,
                "quantity_requirement": True
            }
        }
        
        # Regra 3: Quiz Básico
        quiz_basico_config = {
            "min_score": 70,
            "score": 200,
            "description": "Aprovar no quiz básico de conhecimentos",
            "event_type": "quiz_completed",
            "requirements": {
                "passing_score": True,
                "completion_required": True
            }
        }
        
        # Regra 4: Presença em Evento
        presenca_evento_config = {
            "target_lat": -23.5505,
            "target_lng": -46.6333,
            "max_distance_meters": 100,
            "score": 300,
            "description": "Check-in presencial em evento",
            "event_type": "geo_checkin",
            "requirements": {
                "location_verification": True,
                "distance_validation": True
            }
        }
        
        rules = [
            ("onboarding_qr", "Onboarding QR Code", json.dumps(onboarding_qr_config), 1),
            ("timeline_3_posts", "Timeline 3 Posts", json.dumps(timeline_3_posts_config), 1),
            ("quiz_basico_ok", "Quiz Básico Aprovado", json.dumps(quiz_basico_config), 1),
            ("presenca_evento", "Presença em Evento", json.dumps(presenca_evento_config), 1)
        ]
        
        for mission_slug, rule_name, rule_config, is_active in rules:
            # Verificar se já existe
            cursor.execute("SELECT id FROM mission_rules WHERE mission_slug = ?", (mission_slug,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO mission_rules (mission_slug, rule_name, rule_config, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                """, (mission_slug, rule_name, rule_config, is_active))
                print(f"✅ Regra criada: {mission_slug}")
            else:
                # Atualizar regra existente
                cursor.execute("""
                    UPDATE mission_rules 
                    SET rule_name = ?, rule_config = ?, is_active = ?, updated_at = datetime('now')
                    WHERE mission_slug = ?
                """, (rule_name, rule_config, is_active, mission_slug))
                print(f"🔄 Regra atualizada: {mission_slug}")
        
        conn.commit()
        print("✅ Regras de missão inseridas com sucesso")
        
    except Exception as e:
        print(f"❌ Erro ao inserir regras de missão: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Função principal do seed"""
    print("🌱 Iniciando seed simples de regras de missão...")
    
    try:
        # Criar tabelas
        create_tables_simple()
        
        # Inserir feature flags
        print("\n📋 Inserindo feature flags...")
        seed_feature_flags_simple()
        
        # Inserir regras de missão
        print("\n📋 Inserindo regras de missão...")
        seed_mission_rules_simple()
        
        print("\n✅ Seed concluído com sucesso!")
        
        # Mostrar resumo
        conn = sqlite3.connect('connectus.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM feature_flags")
        flags_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM mission_rules")
        rules_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM mission_rules WHERE is_active = 1")
        active_rules_count = cursor.fetchone()[0]
        
        print("\n📊 Resumo:")
        print(f"- Feature flags: {flags_count}")
        print(f"- Regras de missão: {rules_count}")
        print(f"- Regras ativas: {active_rules_count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()









