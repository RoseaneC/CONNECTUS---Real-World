import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, RotateCcw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'

const AvatarCustomizer = ({ isOpen, onClose, onSave, currentAvatar }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    skin: 'light',
    hair: 'short',
    hairColor: 'brown',
    eyes: 'brown',
    clothes: 'casual',
    accessories: 'none'
  })

  const [isLoading, setIsLoading] = useState(false)

  // Opções de personalização
  const options = {
    skin: [
      { id: 'light', name: 'Clara', color: '#FDBCB4' },
      { id: 'medium', name: 'Média', color: '#E8A87C' },
      { id: 'dark', name: 'Escura', color: '#C68642' },
      { id: 'very-dark', name: 'Muito Escura', color: '#8D5524' }
    ],
    hair: [
      { id: 'short', name: 'Curto', icon: '👨' },
      { id: 'long', name: 'Longo', icon: '👩' },
      { id: 'afro', name: 'Afro', icon: '👨🏿' },
      { id: 'bald', name: 'Careca', icon: '👨‍🦲' },
      { id: 'ponytail', name: 'Rabo de Cavalo', icon: '👩‍🦱' },
      { id: 'bun', name: 'Coque', icon: '👩‍🦰' }
    ],
    hairColor: [
      { id: 'black', name: 'Preto', color: '#000000' },
      { id: 'brown', name: 'Castanho', color: '#8B4513' },
      { id: 'blonde', name: 'Loiro', color: '#FFD700' },
      { id: 'red', name: 'Ruivo', color: '#A0522D' },
      { id: 'gray', name: 'Grisalho', color: '#808080' },
      { id: 'white', name: 'Branco', color: '#FFFFFF' }
    ],
    eyes: [
      { id: 'brown', name: 'Castanhos', color: '#8B4513' },
      { id: 'blue', name: 'Azuis', color: '#4169E1' },
      { id: 'green', name: 'Verdes', color: '#228B22' },
      { id: 'hazel', name: 'Avelã', color: '#DAA520' },
      { id: 'gray', name: 'Cinza', color: '#808080' }
    ],
    clothes: [
      { id: 'casual', name: 'Casual', icon: '👕' },
      { id: 'formal', name: 'Formal', icon: '👔' },
      { id: 'sport', name: 'Esportivo', icon: '👟' },
      { id: 'elegant', name: 'Elegante', icon: '👗' },
      { id: 'vintage', name: 'Vintage', icon: '👘' },
      { id: 'modern', name: 'Moderno', icon: '🦺' }
    ],
    accessories: [
      { id: 'none', name: 'Nenhum', icon: '' },
      { id: 'glasses', name: 'Óculos', icon: '🤓' },
      { id: 'hat', name: 'Chapéu', icon: '🎩' },
      { id: 'cap', name: 'Boné', icon: '🧢' },
      { id: 'scarf', name: 'Cachecol', icon: '🧣' },
      { id: 'jewelry', name: 'Joias', icon: '💍' }
    ]
  }

  // Gerar avatar baseado nas opções
  const generateAvatar = () => {
    const { skin, hair, hairColor, eyes, clothes, accessories } = selectedOptions
    
    // Mapear opções para emojis/ícones baseados na combinação
    const avatarMap = {
      // Pele clara
      'light-short': '👨',
      'light-long': '👩',
      'light-afro': '👨',
      'light-bald': '👨‍🦲',
      'light-ponytail': '👩‍🦱',
      'light-bun': '👩‍🦰',
      
      // Pele média
      'medium-short': '👨🏽',
      'medium-long': '👩🏽',
      'medium-afro': '👨🏽',
      'medium-bald': '👨🏽‍🦲',
      'medium-ponytail': '👩🏽‍🦱',
      'medium-bun': '👩🏽‍🦰',
      
      // Pele escura
      'dark-short': '👨🏾',
      'dark-long': '👩🏾',
      'dark-afro': '👨🏾',
      'dark-bald': '👨🏾‍🦲',
      'dark-ponytail': '👩🏾‍🦱',
      'dark-bun': '👩🏾‍🦰',
      
      // Pele muito escura
      'very-dark-short': '👨🏿',
      'very-dark-long': '👩🏿',
      'very-dark-afro': '👨🏿',
      'very-dark-bald': '👨🏿‍🦲',
      'very-dark-ponytail': '👩🏿‍🦱',
      'very-dark-bun': '👩🏿‍🦰'
    }
    
    // Gerar chave baseada na combinação pele-cabelo
    const key = `${skin}-${hair}`
    let avatar = avatarMap[key] || '👨'
    
    // Adicionar acessórios se houver
    const accessoryEmoji = {
      'none': '',
      'glasses': '🤓',
      'hat': '🎩',
      'cap': '🧢',
      'scarf': '🧣',
      'jewelry': '💍'
    }
    
    if (accessories !== 'none') {
      // Para acessórios, usar emojis específicos
      avatar = accessoryEmoji[accessories] || avatar
    }
    
    return avatar
  }

  // Salvar avatar personalizado
  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const avatarData = {
        ...selectedOptions,
        emoji: generateAvatar(),
        custom: true
      }
      
      // Salvar no backend
      await api.put('/profile', {
        avatar: JSON.stringify(avatarData)
      })
      
      onSave(avatarData)
      toast.success('Avatar personalizado salvo!')
      onClose()
      
    } catch (error) {
      console.error('Erro ao salvar avatar:', error)
      toast.error('Erro ao salvar avatar')
    } finally {
      setIsLoading(false)
    }
  }

  // Resetar para avatar padrão
  const handleReset = () => {
    setSelectedOptions({
      skin: 'light',
      hair: 'short',
      hairColor: 'brown',
      eyes: 'brown',
      clothes: 'casual',
      accessories: 'none'
    })
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Personalizar Avatar</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview do Avatar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Preview</h3>
            <div className="bg-dark-700 rounded-lg p-8 text-center">
              <div className="text-8xl mb-4">
                {generateAvatar()}
              </div>
              <p className="text-dark-400">
                Seu avatar personalizado
              </p>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Salvando...' : 'Salvar Avatar'}</span>
              </button>
              
              <button
                onClick={handleReset}
                className="bg-dark-600 hover:bg-dark-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resetar</span>
              </button>
            </div>
          </div>

          {/* Opções de Personalização */}
          <div className="space-y-6">
            {Object.entries(options).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-md font-semibold text-white mb-3 capitalize">
                  {category === 'hairColor' ? 'Cor do Cabelo' : 
                   category === 'very-dark' ? 'Pele' : category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedOptions(prev => ({
                        ...prev,
                        [category]: item.id
                      }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedOptions[category] === item.id
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {item.color && (
                          <div
                            className="w-4 h-4 rounded-full border border-dark-400"
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                        {item.icon && (
                          <span className="text-lg">{item.icon}</span>
                        )}
                        <span className="text-sm text-white">{item.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AvatarCustomizer
