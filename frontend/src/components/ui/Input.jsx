import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  variant = 'default',
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'w-full rounded-lg px-4 py-3 text-white placeholder-dark-400 transition-all duration-200 focus:outline-none'
  
  const variants = {
    default: 'bg-dark-800/50 border border-dark-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
    cyber: 'input-cyber',
    ghost: 'bg-transparent border border-dark-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'
  }

  const classes = `${baseClasses} ${variants[variant]} ${className}`

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-dark-200">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={classes}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input







