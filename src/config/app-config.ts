export const APP_CONFIG = {
  APP_NAME: "Local AI Lab: Image Gen",
  TAGLINE: "Professional image transformation with your own AI keys",
  MAIN_HEADING: "Transform Images with Your Own AI",
  SUB_HEADING: "Secure, private image processing using your own API keys - no data stored on our servers",
  BYOK_FEATURE: "🔑 Bring Your Own Keys - Complete Privacy & Control",
  BYOK_DESCRIPTION: "Use your own OpenAI, Replicate, or other AI service keys for maximum privacy and control",
  UPLOAD_TEXT: "Drop your image here",
  RESULT_TEXT: "Transformed result",
  PRIVACY_NOTICE: "Your API keys and images are processed locally - we never store your data",
  
  // New transformation styles (replacing cartoon styles)
  TRANSFORMATION_STYLES: [
    { id: "artistic", name: "Artistic Portrait" },
    { id: "digital-art", name: "Digital Art" },
    { id: "oil-painting", name: "Oil Painting" },
    { id: "watercolor", name: "Watercolor" },
    { id: "sketch", name: "Pencil Sketch" },
    { id: "pop-art", name: "Pop Art" },
    { id: "abstract", name: "Abstract Style" }
  ],
  
  // UI Text
  SUPPORTED_FORMATS: "Supports JPG, PNG, WebP",
  PROCESSING_TEXT: "Processing with your AI service...",
  API_KEY_PLACEHOLDER: "Enter your API key",
  
  ERROR_MESSAGES: {
    upload: "Please select a valid image file",
    processing: "Something went wrong. Please try again.",
    apiKey: "Please configure your API key in settings",
    invalidKey: "Invalid API key format"
  },
  
  ROUTES: {
    home: "/",
    settings: "/settings",
    transform: "/transform",
    about: "/about"
  },
  
  // Feature highlights for BYOK
  BYOK_FEATURES: [
    {
      title: "Complete Privacy",
      description: "Your images and API keys never leave your device",
      icon: "shield"
    },
    {
      title: "Your Own Keys",
      description: "Use your own OpenAI, Gemini, or other AI service accounts",
      icon: "key"
    },
    {
      title: "No Data Storage",
      description: "We don't store, analyze, or train on your images",
      icon: "database"
    },
    {
      title: "Full Control",
      description: "You control costs, usage, and data handling",
      icon: "settings"
    }
  ]
}

export const UI_CONFIG = {
  ...APP_CONFIG,
  
  
  // Call-to-action buttons
  CTA_PRIMARY: "Start Transforming",
  CTA_SECONDARY: "Configure API Keys",
  
  // Footer
  FOOTER_TEXT: "© 2025 AI Transform Studio. All rights reserved.",
  FOOTER_LINKS: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Contact", href: "/contact" }
  ]
} 