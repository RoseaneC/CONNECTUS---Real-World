/**
 * SettingsPanel - Painel de configurações acessível
 */
import { useState, useEffect } from 'react'

const SETTINGS_KEY = 'connectus.play.settings'

const DEFAULT_SETTINGS = {
  quality: 'medium',
  contrast: 'normal',
  fontSize: 100,
  sensitivity: 1.0,
  volume: 1.0,
  keymap: {
    forward: 'KeyW',
    backward: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    run: 'ShiftLeft',
    interact: 'KeyE'
  }
}

export default function SettingsPanel({ onClose, onSettingsChange }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    onSettingsChange?.(newSettings)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.95)',
        color: '#fff',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #4F46E5',
        zIndex: 10001,
        maxWidth: '500px',
        width: '90%'
      }}
    >
      <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>⚙️ Configurações</h2>

      {/* Qualidade */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Qualidade Gráfica</label>
        <select
          value={settings.quality}
          onChange={(e) => updateSetting('quality', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1a1a1a', color: '#fff' }}
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>

      {/* Alto Contraste */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Alto Contraste</label>
        <select
          value={settings.contrast}
          onChange={(e) => updateSetting('contrast', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1a1a1a', color: '#fff' }}
        >
          <option value="normal">Normal</option>
          <option value="high">Alto</option>
        </select>
      </div>

      {/* Tamanho da Fonte */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Tamanho da Fonte: {settings.fontSize}%
        </label>
        <input
          type="range"
          min="80"
          max="150"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Sensibilidade Câmera */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Sensibilidade: {settings.sensitivity.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.sensitivity}
          onChange={(e) => updateSetting('sensitivity', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Volume */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Volume: {Math.round(settings.volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.volume}
          onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          onClick={() => {
            localStorage.removeItem(SETTINGS_KEY)
            setSettings(DEFAULT_SETTINGS)
            updateSetting('quality', 'medium')
          }}
          style={{
            padding: '10px 20px',
            background: '#666',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Resetar
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#4F46E5',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}








