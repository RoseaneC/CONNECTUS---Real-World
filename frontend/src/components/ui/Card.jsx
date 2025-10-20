import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const Card = forwardRef(({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'rounded-xl p-6 shadow-xl'
  
  const variants = {
    default: 'card',
    glow: 'card-glow',
    cyber: 'card-cyber',
    glass: 'bg-dark-800/30 backdrop-blur-sm border border-dark-700/30',
    solid: 'bg-dark-800 border border-dark-700'
  }

  const hoverClasses = hover ? 'hover-lift hover-glow' : ''

  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`

  return (
    <motion.div
      ref={ref}
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

export default Card







