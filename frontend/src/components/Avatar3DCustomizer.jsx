import React, { useState, useEffect } from 'react'
import { X, Save, RotateCcw, Palette, User, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { api } from '../services/api'
import { toast } from 'react-hot-toast'

const Avatar3DCustomizer = ({ isOpen, onClose, onSave, currentAvatar }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState({
    // Base do avatar
    base: 'chibi_female', // chibi_female, chibi_male, realistic_female, realistic_male
    
    // Cor de pele (baseada nos modelos fornecidos)
    skin: 'peach', // peach, fair, medium, dark, lavender, purple
    
    // Estilo de cabelo
    hairStyle: 'long_straight', // long_straight, bob, afro, short, ponytail, bun
    hairColor: 'black', // black, brown, blonde, red, blue, purple, pink, white
    
    // Acessórios
    glasses: 'none', // none, round, cat_eye, square, aviator, reading
    hat: 'none', // none, cap, beanie, hat, crown, headband
    jewelry: 'none', // none, earrings, necklace, bracelet, ring
    
    // Expressão
    expression: 'happy', // happy, neutral, sleepy, cool, surprised, tired
    
    // Roupas
    clothing: 'basic', // basic, formal, casual, sporty, elegant, cozy
    clothingColor: 'black' // black, white, red, blue, green, purple, pink
  })

  // Opções de personalização baseadas nos modelos fornecidos
  const customizationOptions = {
    base: [
      { id: 'chibi_female', name: 'Feminino Fofo', description: 'Estilo fofo e exagerado', emoji: '👩' },
      { id: 'chibi_male', name: 'Masculino Fofo', description: 'Estilo fofo e exagerado', emoji: '👨' },
      { id: 'realistic_female', name: 'Feminino Realista', description: 'Proporções realistas', emoji: '👩' },
      { id: 'realistic_male', name: 'Masculino Realista', description: 'Proporções realistas', emoji: '👨' }
    ],
    
    skin: [
      { id: 'peach', name: 'Pêssego', description: 'Tom pêssego com bochechas rosadas', color: '#FFDBAC' },
      { id: 'fair', name: 'Clara', description: 'Pele clara e suave', color: '#F5E6D3' },
      { id: 'medium', name: 'Média', description: 'Tom médio equilibrado', color: '#D4A574' },
      { id: 'dark', name: 'Escura', description: 'Tom mais escuro', color: '#8B4513' },
      { id: 'lavender', name: 'Lavanda', description: 'Tom lavanda único', color: '#E6E6FA' },
      { id: 'purple', name: 'Roxa', description: 'Tom roxo vibrante', color: '#DDA0DD' }
    ],
    
    hairStyle: [
      { id: 'long_straight', name: 'Longo Liso', description: 'Cabelo longo e liso', emoji: '👩' },
      { id: 'bob', name: 'Bob', description: 'Corte bob curto', emoji: '👩‍🦱' },
      { id: 'afro', name: 'Afro', description: 'Cabelo afro volumoso', emoji: '👩🏾' },
      { id: 'short', name: 'Curto', description: 'Corte curto e moderno', emoji: '👨' },
      { id: 'ponytail', name: 'Rabo de Cavalo', description: 'Cabelo preso', emoji: '👩‍🦱' },
      { id: 'bun', name: 'Coque', description: 'Cabelo em coque', emoji: '👩‍🦰' }
    ],
    
    hairColor: [
      { id: 'black', name: 'Preto', color: '#000000' },
      { id: 'brown', name: 'Castanho', color: '#8B4513' },
      { id: 'blonde', name: 'Loiro', color: '#F4E4BC' },
      { id: 'red', name: 'Ruivo', color: '#A0522D' },
      { id: 'blue', name: 'Azul', color: '#4169E1' },
      { id: 'purple', name: 'Roxo', color: '#8A2BE2' },
      { id: 'pink', name: 'Rosa', color: '#FF69B4' },
      { id: 'white', name: 'Branco', color: '#FFFFFF' }
    ],
    
    glasses: [
      { id: 'none', name: 'Nenhum', emoji: '' },
      { id: 'round', name: 'Redondos', emoji: '🤓' },
      { id: 'cat_eye', name: 'Gatinho', emoji: '😎' },
      { id: 'square', name: 'Quadrados', emoji: '🤓' },
      { id: 'aviator', name: 'Aviador', emoji: '🕶️' },
      { id: 'reading', name: 'Leitura', emoji: '🤓' }
    ],
    
    hat: [
      { id: 'none', name: 'Nenhum', emoji: '' },
      { id: 'cap', name: 'Boné', emoji: '🧢' },
      { id: 'beanie', name: 'Gorro', emoji: '🧶' },
      { id: 'hat', name: 'Chapéu', emoji: '🎩' },
      { id: 'crown', name: 'Coroa', emoji: '👑' },
      { id: 'headband', name: 'Tiara', emoji: '👑' }
    ],
    
    jewelry: [
      { id: 'none', name: 'Nenhum', emoji: '' },
      { id: 'earrings', name: 'Brincos', emoji: '💎' },
      { id: 'necklace', name: 'Colar', emoji: '📿' },
      { id: 'bracelet', name: 'Pulseira', emoji: '💍' },
      { id: 'ring', name: 'Anel', emoji: '💍' }
    ],
    
    expression: [
      { id: 'happy', name: 'Feliz', emoji: '😊' },
      { id: 'neutral', name: 'Neutro', emoji: '😐' },
      { id: 'sleepy', name: 'Sonolento', emoji: '😴' },
      { id: 'cool', name: 'Descolado', emoji: '😎' },
      { id: 'surprised', name: 'Surpreso', emoji: '😮' },
      { id: 'tired', name: 'Cansado', emoji: '😩' }
    ],
    
    clothing: [
      { id: 'basic', name: 'Básico', description: 'Camiseta simples', emoji: '👕' },
      { id: 'formal', name: 'Formal', description: 'Roupa social', emoji: '👔' },
      { id: 'casual', name: 'Casual', description: 'Roupa casual', emoji: '👕' },
      { id: 'sporty', name: 'Esportivo', description: 'Roupa de academia', emoji: '👕' },
      { id: 'elegant', name: 'Elegante', description: 'Roupa elegante', emoji: '👗' },
      { id: 'cozy', name: 'Confortável', description: 'Roupa confortável', emoji: '🧥' }
    ],
    
    clothingColor: [
      { id: 'black', name: 'Preto', color: '#000000' },
      { id: 'white', name: 'Branco', color: '#FFFFFF' },
      { id: 'red', name: 'Vermelho', color: '#FF0000' },
      { id: 'blue', name: 'Azul', color: '#0000FF' },
      { id: 'green', name: 'Verde', color: '#008000' },
      { id: 'purple', name: 'Roxo', color: '#800080' },
      { id: 'pink', name: 'Rosa', color: '#FFC0CB' }
    ]
  }

  // Carregar avatar atual ao abrir
  useEffect(() => {
    if (isOpen && currentAvatar) {
      try {
        const avatarData = typeof currentAvatar === 'string' ? JSON.parse(currentAvatar) : currentAvatar
        setSelectedOptions(prev => ({ ...prev, ...avatarData }))
      } catch (error) {
        console.error('Erro ao carregar avatar:', error)
      }
    }
  }, [isOpen, currentAvatar])

  // Gerar avatar 3D baseado nas opções
  const generate3DAvatar = () => {
    const { base, skin, hairStyle, hairColor, glasses, hat, jewelry, expression, clothing, clothingColor } = selectedOptions
    
    // Mapear combinações para avatares 3D baseados nas imagens fornecidas
    const avatarMap = {
      // Feminino Fofo (Chibi)
      'chibi_female-long_straight': '👩',
      'chibi_female-bob': '👩‍🦱',
      'chibi_female-afro': '👩🏾',
      'chibi_female-ponytail': '👩‍🦱',
      'chibi_female-bun': '👩‍🦰',
      
      // Masculino Fofo (Chibi)
      'chibi_male-short': '👨',
      'chibi_male-long_straight': '👨',
      'chibi_male-afro': '👨🏾',
      
      // Feminino Realista
      'realistic_female-long_straight': '👩',
      'realistic_female-bob': '👩‍🦱',
      'realistic_female-afro': '👩🏾',
      
      // Masculino Realista
      'realistic_male-short': '👨',
      'realistic_male-long_straight': '👨',
      'realistic_male-afro': '👨🏾'
    }
    
    // Gerar chave baseada na combinação base-cabelo
    const key = `${base}-${hairStyle}`
    let avatar = avatarMap[key] || '👨'
    
    // Aplicar acessórios baseados nas imagens fornecidas
    const accessoryMap = {
      'glasses': {
        'round': '🤓',
        'cat_eye': '😎',
        'square': '🤓',
        'aviator': '🕶️',
        'reading': '🤓'
      },
      'hat': {
        'cap': '🧢',
        'beanie': '🧶',
        'hat': '🎩',
        'crown': '👑',
        'headband': '👑'
      },
      'jewelry': {
        'earrings': '💎',
        'necklace': '📿',
        'bracelet': '💍',
        'ring': '💍'
      }
    }
    
    // Aplicar óculos (prioridade alta)
    if (glasses !== 'none' && accessoryMap.glasses[glasses]) {
      avatar = accessoryMap.glasses[glasses]
    }
    
    // Aplicar chapéu (prioridade média)
    if (hat !== 'none' && accessoryMap.hat[hat]) {
      avatar = accessoryMap.hat[hat]
    }
    
    // Aplicar joias (prioridade baixa - apenas se não houver óculos ou chapéu)
    if (jewelry !== 'none' && glasses === 'none' && hat === 'none' && accessoryMap.jewelry[jewelry]) {
      avatar = accessoryMap.jewelry[jewelry]
    }
    
    return avatar
  }

  // Salvar avatar personalizado
  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const avatarData = {
        ...selectedOptions,
        emoji: generate3DAvatar(),
        type: '3d_custom',
        timestamp: new Date().toISOString()
      }
      
      const response = await api.put('/profile', {
        avatar: JSON.stringify(avatarData)
      })
      
      if (response.status === 200) {
        toast.success('Avatar personalizado salvo!')
        onSave(avatarData)
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar avatar:', error)
      toast.error('Erro ao salvar avatar personalizado')
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar opção selecionada
  const updateOption = (category, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: value
    }))
  }

  // Renderizar seção de opções
  const renderOptionSection = (category, title, icon) => {
    const options = customizationOptions[category] || []
    
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => updateOption(category, option.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedOptions[category] === option.id
                  ? 'border-primary-500 bg-primary-500/20'
                  : 'border-dark-600 hover:border-primary-400'
              }`}
            >
              <div className="text-center space-y-1">
                {option.emoji && (
                  <div className="text-2xl">{option.emoji}</div>
                )}
                {option.color && (
                  <div 
                    className="w-8 h-8 mx-auto rounded-full border-2 border-white"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <div className="text-xs text-white font-medium">
                  {option.name}
                </div>
                {option.description && (
                  <div className="text-xs text-dark-400">
                    {option.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-dark-800 border-dark-600">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Personalizar Avatar 3D</h2>
                <p className="text-dark-400">Crie seu avatar único com base nos modelos 3D fornecidos</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-dark-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview do Avatar */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Preview do Avatar</h3>
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-8xl">
                    {generate3DAvatar()}
                  </span>
                </div>
                <div className="mt-4 text-sm text-dark-400">
                  {customizationOptions.base.find(b => b.id === selectedOptions.base)?.name} • {customizationOptions.skin.find(s => s.id === selectedOptions.skin)?.name} • {customizationOptions.hairStyle.find(h => h.id === selectedOptions.hairStyle)?.name}
                </div>
              </div>

              {/* Informações do Avatar */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Configuração Atual</h4>
                <div className="space-y-1 text-sm text-dark-300">
                  <div>Base: {customizationOptions.base.find(b => b.id === selectedOptions.base)?.name}</div>
                  <div>Pele: {customizationOptions.skin.find(s => s.id === selectedOptions.skin)?.name}</div>
                  <div>Cabelo: {customizationOptions.hairStyle.find(h => h.id === selectedOptions.hairStyle)?.name}</div>
                  <div>Cor: {customizationOptions.hairColor.find(h => h.id === selectedOptions.hairColor)?.name}</div>
                  {selectedOptions.glasses !== 'none' && (
                    <div>Óculos: {customizationOptions.glasses.find(g => g.id === selectedOptions.glasses)?.name}</div>
                  )}
                  {selectedOptions.hat !== 'none' && (
                    <div>Chapéu: {customizationOptions.hat.find(h => h.id === selectedOptions.hat)?.name}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Opções de Personalização */}
            <div className="space-y-6">
              {renderOptionSection('base', 'Estilo Base', <User className="w-4 h-4" />)}
              {renderOptionSection('skin', 'Cor de Pele', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('hairStyle', 'Estilo de Cabelo', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('hairColor', 'Cor do Cabelo', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('glasses', 'Óculos', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('hat', 'Chapéu', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('jewelry', 'Joias', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('expression', 'Expressão', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('clothing', 'Roupa', <Sparkles className="w-4 h-4" />)}
              {renderOptionSection('clothingColor', 'Cor da Roupa', <Sparkles className="w-4 h-4" />)}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-600">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-dark-600 text-dark-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Avatar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Avatar3DCustomizer
