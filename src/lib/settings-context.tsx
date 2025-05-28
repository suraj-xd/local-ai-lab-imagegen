import React, { createContext, useContext, useState, useEffect } from 'react'

interface Settings {
  openaiApiKey: string
  geminiApiKey: string
  selectedProvider: 'openai' | 'gemini'
  selectedModel: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  isConfigured: boolean
}

const defaultSettings: Settings = {
  openaiApiKey: '',
  geminiApiKey: '',
  selectedProvider: 'openai',
  selectedModel: 'gpt-image-1'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    // Try new app name first, then fallback to old name for migration
    const savedSettings = localStorage.getItem('localailab-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
        
        // Migrate to new storage key if using old one
        if (localStorage.getItem('localailab-settings') && !localStorage.getItem('localailab-settings')) {
          localStorage.setItem('localailab-settings', savedSettings)
        }
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('localailab-settings', JSON.stringify(updatedSettings))
  }

  const isConfigured = Boolean(
    (settings.selectedProvider === 'openai' && settings.openaiApiKey) ||
    (settings.selectedProvider === 'gemini' && settings.geminiApiKey)
  )

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 