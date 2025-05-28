import React, { useState } from 'react'
import { Settings, Eye, EyeOff, Shield, Key, ExternalLink } from 'lucide-react'
import { useSettings } from '../lib/settings-context'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { APP_CONFIG } from '../config/app-config'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings()
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)

  React.useEffect(() => {
    if (open) {
      setTempSettings(settings)
    }
  }, [open, settings])

  const handleSave = () => {
    updateSettings(tempSettings)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempSettings(settings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur border-border/50 max-h-[80vh] overflow-y-auto mt-20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            API Configuration
          </DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="space-y-8">
          {/* Privacy Notice */}
          <div className="security-indicator bg-background/80 rounded-lg p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Complete Privacy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your API keys are stored locally in your browser and never transmitted to our servers. 
                All image processing happens directly between your browser and your chosen AI provider.
              </p>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <Label htmlFor="provider" className="text-sm font-medium text-foreground">AI Provider</Label>
            <Select
              value={tempSettings.selectedProvider}
              onValueChange={(value: 'openai' | 'gemini') => {
                setTempSettings(prev => ({ 
                  ...prev, 
                  selectedProvider: value,
                  selectedModel: value === 'openai' ? 'dall-e-2' : 'gemini-2.0-flash-preview-image-generation'
                }))
              }}
            >
              <SelectTrigger className="h-12 bg-background border-border hover:border-primary transition-colors">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* OpenAI API Key */}
          {tempSettings.selectedProvider === 'openai' && (
            <div className="space-y-3">
              <Label htmlFor="openai-key" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key className="w-4 h-4" />
                OpenAI API Key
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenAIKey ? "text" : "password"}
                  placeholder={APP_CONFIG.API_KEY_PLACEHOLDER}
                  value={tempSettings.openaiApiKey}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                  className="pr-12 h-12 bg-background border-border hover:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Get your API key from</span>
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
                >
                  OpenAI Platform
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Gemini API Key */}
          {tempSettings.selectedProvider === 'gemini' && (
            <div className="space-y-3">
              <Label htmlFor="gemini-key" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key className="w-4 h-4" />
                Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? "text" : "password"}
                  placeholder={APP_CONFIG.API_KEY_PLACEHOLDER}
                  value={tempSettings.geminiApiKey}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                  className="pr-12 h-12 bg-background border-border hover:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Get your API key from</span>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
                >
                  Google AI Studio
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-3">
            <Label htmlFor="model" className="text-sm font-medium text-foreground">Model</Label>
            <Select
              value={tempSettings.selectedModel}
              onValueChange={(value) => setTempSettings(prev => ({ ...prev, selectedModel: value }))}
            >
              <SelectTrigger className="h-12 bg-background border-border hover:border-primary transition-colors">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {tempSettings.selectedProvider === 'openai' ? (
                  <>
                    <SelectItem value="gpt-image-1">GPT Image 1</SelectItem>
                    <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                    <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                  </>
                ) : (
                  <SelectItem value="gemini-2.0-flash-preview-image-generation">Gemini 2.0 Flash (Image Generation)</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* BYOK Benefits */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Why Bring Your Own Keys?
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {APP_CONFIG.BYOK_FEATURES.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="flex-1 h-12 bg-background hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 h-12 gradient-primary text-white hover:opacity-90"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}