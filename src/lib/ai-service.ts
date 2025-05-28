export interface CartoonTransformRequest {
  imageFile: File
  style: string
  apiKey: string
  model: string
}

export interface CartoonTransformResponse {
  imageUrl: string
  success: boolean
  error?: string
}

export interface AIProvider {
  name: string
  transformImage: (request: CartoonTransformRequest) => Promise<CartoonTransformResponse>
}

// OpenAI Provider (keeping for future use)
class OpenAIProvider implements AIProvider {
  name = 'OpenAI'

  async transformImage(request: CartoonTransformRequest): Promise<CartoonTransformResponse> {
    try {
      const stylePrompts = {
        "simpsons": "Transform this image into the distinctive Simpsons animation style with yellow skin, simple line art, and the characteristic Simpsons aesthetic",
        "studio-ghibli": "Transform this image into the beautiful Studio Ghibli animation style with soft colors, detailed backgrounds, and the magical Ghibli aesthetic",
        "family-guy": "Transform this image into the Family Guy animation style with the distinctive art style and character design",
        "disney": "Transform this image into classic Disney animation style with vibrant colors and the timeless Disney aesthetic",
        "anime": "Transform this image into anime art style with large expressive eyes and detailed anime features",
        "comic-book": "Transform this image into comic book art style with bold lines, vibrant colors, and superhero comic aesthetic",
        "south-park": "Transform this image into South Park animation style with the simple, cut-out paper aesthetic"
      }

      const prompt = stylePrompts[request.style as keyof typeof stylePrompts] || stylePrompts.simpsons

      // Handle different OpenAI models and their endpoints
      if (request.model === 'gpt-image-1') {
        // Use the edits endpoint for image transformation with gpt-image-1
        const formData = new FormData()
        formData.append('image', request.imageFile)
        formData.append('prompt', prompt)
        formData.append('model', 'gpt-image-1')
        formData.append('n', '1')
        formData.append('size', '1024x1024')

        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${request.apiKey}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`)
        }

        const result = await response.json()
        
        // GPT Image 1 returns b64_json format by default
        if (result.data && result.data[0] && result.data[0].b64_json) {
          // Convert base64 to blob URL for display
          const imageBytes = atob(result.data[0].b64_json)
          const imageArray = new Uint8Array(imageBytes.length)
          for (let i = 0; i < imageBytes.length; i++) {
            imageArray[i] = imageBytes.charCodeAt(i)
          }
          const blob = new Blob([imageArray], { type: 'image/png' })
          const imageUrl = URL.createObjectURL(blob)
          
          return {
            imageUrl,
            success: true
          }
        } else {
          throw new Error("No image data received from API")
        }
      } else {
        // Use DALL-E models with edits endpoint (for image transformation)
        const formData = new FormData()
        formData.append('image', request.imageFile)
        formData.append('prompt', prompt)
        formData.append('model', request.model)
        formData.append('n', '1')
        formData.append('size', '1024x1024')

        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${request.apiKey}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`)
        }

        const result = await response.json()
        
        if (result.data && result.data[0] && result.data[0].url) {
          return {
            imageUrl: result.data[0].url,
            success: true
          }
        } else {
          throw new Error("No image data received from API")
        }
      }

    } catch (error) {
      return {
        imageUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// Gemini Provider
class GeminiProvider implements AIProvider {
  name = 'Gemini'

  async transformImage(request: CartoonTransformRequest): Promise<CartoonTransformResponse> {
    try {
      const stylePrompts = {
        "simpsons": "Transform this image into the distinctive Simpsons animation style with yellow skin, simple line art, and the characteristic Simpsons aesthetic. Make it look exactly like a Simpsons character.",
        "studio-ghibli": "Transform this image into the beautiful Studio Ghibli animation style with soft colors, detailed backgrounds, and the magical Ghibli aesthetic. Use the distinctive Studio Ghibli art style.",
        "family-guy": "Transform this image into the Family Guy animation style with the distinctive art style and character design. Make it look like a Family Guy character.",
        "disney": "Transform this image into classic Disney animation style with vibrant colors and the timeless Disney aesthetic. Use the classic Disney cartoon style.",
        "anime": "Transform this image into anime art style with large expressive eyes and detailed anime features. Make it look like an anime character.",
        "comic-book": "Transform this image into comic book art style with bold lines, vibrant colors, and superhero comic aesthetic. Use a comic book illustration style.",
        "south-park": "Transform this image into South Park animation style with the simple, cut-out paper aesthetic. Make it look like a South Park character."
      }

      const prompt = stylePrompts[request.style as keyof typeof stylePrompts] || stylePrompts.simpsons

      // Convert file to base64
      const base64Image = await this.fileToBase64(request.imageFile)

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: request.imageFile.type,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }

      console.log("Gemini API request:", {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`,
        prompt: prompt.substring(0, 100) + "...",
        imageSize: `${Math.round(base64Image.length / 1024)}KB`,
        mimeType: request.imageFile.type
      })

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${request.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      )

      console.log("Gemini API response status:", response.status, response.statusText)

      if (!response.ok) {
        // Handle non-JSON responses
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json()
          console.error("Gemini API error:", errorData)
          
          // Check for specific API key errors
          if (errorData.error && (
            errorData.error.message?.includes("API key not valid") ||
            errorData.error.message?.includes("API_KEY_INVALID") ||
            errorData.error.code === 400
          )) {
            throw new Error("Your Gemini API key is invalid. Please check your API key and try again.")
          }
          
          throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`)
        } else {
          const text = await response.text()
          console.error("Gemini API non-JSON error:", text)
          throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`)
        }
      }

      const result = await response.json()
      console.log("Gemini API response:", {
        candidates: result.candidates?.length || 0,
        hasContent: !!result.candidates?.[0]?.content,
        parts: result.candidates?.[0]?.content?.parts?.length || 0
      })
      
      // Find the image part in the response
      const candidate = result.candidates?.[0]
      if (!candidate?.content?.parts) {
        console.error("No content parts in response:", result)
        throw new Error("No content parts received from API")
      }

      interface GeminiPart {
        inline_data?: {
          data: string
          mime_type: string
        }
        text?: string
      }
      
      const imagePart = candidate.content.parts.find((part: GeminiPart) => part.inline_data)
      if (!imagePart?.inline_data?.data) {
        console.error("No image data in response parts:", candidate.content.parts)
        throw new Error("No image data received from API. The model may not have generated an image.")
      }

      console.log("Found image data:", {
        mimeType: imagePart.inline_data.mime_type,
        dataSize: `${Math.round(imagePart.inline_data.data.length / 1024)}KB`
      })

      // Convert base64 to blob URL
      const imageBytes = atob(imagePart.inline_data.data)
      const imageArray = new Uint8Array(imageBytes.length)
      for (let i = 0; i < imageBytes.length; i++) {
        imageArray[i] = imageBytes.charCodeAt(i)
      }
      const blob = new Blob([imageArray], { type: imagePart.inline_data.mime_type || 'image/png' })
      const imageUrl = URL.createObjectURL(blob)

      return {
        imageUrl,
        success: true
      }

    } catch (error) {
      console.error("Gemini provider error:", error)
      return {
        imageUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

// Factory function to get the appropriate provider
export function getAIProvider(providerName: 'openai' | 'gemini'): AIProvider {
  switch (providerName) {
    case 'openai':
      return new OpenAIProvider()
    case 'gemini':
      return new GeminiProvider()
    default:
      return new GeminiProvider()
  }
} 