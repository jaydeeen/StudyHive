import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Settings {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  soundEnabled: boolean
  autoSave: boolean
  fontSize: 'small' | 'medium' | 'large'
  language: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  applyTheme: (theme: string) => void
  applyFontSize: (size: string) => void
  applyLanguage: (lang: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    notifications: true,
    soundEnabled: true,
    autoSave: true,
    fontSize: 'medium',
    language: 'en'
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('studyHiveSettings')
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      setSettings(parsedSettings)
      
      // Apply saved settings
      applyTheme(parsedSettings.theme)
      applyFontSize(parsedSettings.fontSize)
      applyLanguage(parsedSettings.language)
    }
  }, [])

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('dark', 'light')
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'auto') {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }
    // 'light' theme - no additional classes needed
  }

  const applyFontSize = (size: string) => {
    const root = document.documentElement
    
    // Remove existing font size classes
    root.classList.remove('text-sm', 'text-base', 'text-lg')
    
    switch (size) {
      case 'small':
        root.classList.add('text-sm')
        break
      case 'large':
        root.classList.add('text-lg')
        break
      default: // medium
        root.classList.add('text-base')
        break
    }
  }

  const applyLanguage = (lang: string) => {
    // Set language attribute on html element
    document.documentElement.lang = lang
    
    // You can add more language-specific logic here
    // For example, loading translation files
    console.log(`Language changed to: ${lang}`)
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('studyHiveSettings', JSON.stringify(updatedSettings))
    
    // Apply changes immediately
    if (newSettings.theme !== undefined) {
      applyTheme(newSettings.theme)
    }
    if (newSettings.fontSize !== undefined) {
      applyFontSize(newSettings.fontSize)
    }
    if (newSettings.language !== undefined) {
      applyLanguage(newSettings.language)
    }
  }

  // Listen for system theme changes when auto mode is enabled
  useEffect(() => {
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      applyTheme,
      applyFontSize,
      applyLanguage
    }}>
      {children}
    </SettingsContext.Provider>
  )
} 