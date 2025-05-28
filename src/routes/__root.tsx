import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Settings, Shield, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SettingsDialog } from '../components/settings-dialog'
import { UI_CONFIG } from '../config/app-config'

const RootComponent = () => {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [isDark, setIsDark] = useState(false)
    
    // Theme toggle functionality
    useEffect(() => {
        const isDarkMode = localStorage.getItem('theme') === 'dark' || 
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
        setIsDark(isDarkMode)
        document.documentElement.classList.toggle('dark', isDarkMode)
    }, [])
    
    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', newTheme)
    }
    
    return (
        <>
            <header className="glass sticky top-0 z-[99] border-b border-border/50">
                <div className="flex px-6 h-16 items-center max-w-7xl mx-auto">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center">
                            <img src="https://s3.ca-central-1.amazonaws.com/logojoy/images/icons/ic_bubble_icon.svg" alt="Local AI Lab: Image Gen" className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-foreground">
                            {UI_CONFIG.APP_NAME}
                        </span>
                    </Link>
                    
                    <nav className="ml-auto flex items-center space-x-2">
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={toggleTheme}
                                className="w-9 h-9 p-0"
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                            
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => setSettingsOpen(true)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>
            
            <Outlet />
            
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
            
            {/* Footer */}
            <footer className="border-t border-border bg-muted/30">
                <div className="container max-w-7xl mx-auto px-6">
                    {/* Privacy notice */}
                        <div className="flex items-center justify-center py-2">
                            <div className="privacy-badge text-xs">
                                <Shield className="w-3 h-3" />
                                {UI_CONFIG.PRIVACY_NOTICE}
                            </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export const Route = createRootRoute({
    component: RootComponent,
})