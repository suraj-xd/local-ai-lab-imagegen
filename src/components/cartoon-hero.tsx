import {
  Download,
  Sparkles,
  Upload,
  Settings,
  Shield,
  Key,
  Database,
  Zap,
} from "lucide-react";
import React, { DragEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/toast";
import { useSettings } from "../lib/settings-context";
import { SettingsDialog } from "./settings-dialog";
import { getAIProvider } from "../lib/ai-service";
import { APP_CONFIG } from "../config/app-config";

export default function TransformHero() {
  const { settings, isConfigured } = useSettings();
  const [image, setImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transformStyle, setTransformStyle] = useState<string>("artistic");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const generateTransformedImage = async (imageFile: File) => {
    // Check if the appropriate API key is configured
    const requiredApiKey =
      settings.selectedProvider === "openai"
        ? settings.openaiApiKey
        : settings.geminiApiKey;
    if (!requiredApiKey) {
      const providerName =
        settings.selectedProvider === "openai" ? "OpenAI" : "Gemini";
      setUploadError(
        `Please configure your ${providerName} API key in settings`
      );
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    try {
      // Transform the uploaded image
      addToast("Transforming image with your AI service...", "info", 2000);

      // Get the appropriate AI provider
      const aiProvider = getAIProvider(settings.selectedProvider);

      // Transform the image using the selected provider
      const result = await aiProvider.transformImage({
        imageFile,
        style: transformStyle,
        apiKey: requiredApiKey,
        model: settings.selectedModel,
      });

      if (result.success && result.imageUrl) {
        setTransformedImage(result.imageUrl);
        addToast("Image transformation completed!", "success");
      } else {
        throw new Error(result.error || "Failed to transform image");
      }
    } catch (error: unknown) {
      console.error("Error transforming image:", error);
      let errorMessage = "Failed to transform image";

      if (error instanceof Error) {
        if (error.message?.includes("API")) {
          errorMessage = "API error. Please check your API key and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setUploadError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if API key is configured
    if (!isConfigured) {
      const providerName =
        settings.selectedProvider === "openai" ? "OpenAI" : "Gemini";
      setUploadError(
        `Please configure your ${providerName} API key in settings`
      );
      setSettingsOpen(true);
      return;
    }

    setUploadError(null);

    try {
      // Display the image preview locally
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        setImage(imageData);
        setTransformedImage(null);
      };
      reader.readAsDataURL(file);

      // Generate transformed image
      await generateTransformedImage(file);
    } catch (error) {
      console.error("Error processing image:", error);
      setUploadError("Failed to process image. Please try again.");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over");

    if (!isConfigured) {
      const providerName =
        settings.selectedProvider === "openai" ? "OpenAI" : "Gemini";
      setUploadError(
        `Please configure your ${providerName} API key in settings`
      );
      setSettingsOpen(true);
      return;
    }

    if (isProcessing) {
      setUploadError("Please wait for the current image to finish processing");
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        if (fileInputRef.current) {
          fileInputRef.current.files = dataTransfer.files;
          const event = new Event("change", { bubbles: true });
          fileInputRef.current.dispatchEvent(event);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full py-16 px-4">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center mb-16 px-4 sm:px-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6 border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {APP_CONFIG.BYOK_FEATURE}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            {APP_CONFIG.MAIN_HEADING}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {APP_CONFIG.SUB_HEADING}
          </p>
        </div>

        {/* Configuration Notice */}
        {!isConfigured && (
          <div className="mx-auto max-w-md mb-12">
            <div className="security-indicator">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Setup Required
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Configure your AI provider API key to start transforming
                  images.
                </p>
                <Button
                  onClick={() => setSettingsOpen(true)}
                  className="btn-modern w-full"
                  size="sm"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Configure API Keys
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Image Transformation Studio */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="glass rounded-2xl overflow-hidden border border-border/50">
            {/* Studio Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-foreground">
                    Original Image
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Transformed Result
                  </span>
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                </div>
              </div>
            </div>

            {/* Main Studio Area */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* Left side - Original image */}
                <div className="w-full lg:w-[45%]">
                  <div className="aspect-square overflow-hidden rounded-xl relative">
                    {image ? (
                      <div className="result-area h-full">
                        <img
                          src={image}
                          alt="Original"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`upload-area h-full flex flex-col items-center justify-center p-8 cursor-pointer ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
                        onClick={() => {
                          if (isProcessing) {
                            setUploadError(
                              "Please wait for the current image to finish processing"
                            );
                            return;
                          }

                          if (!isConfigured) {
                            setUploadError(
                              "Please configure your API key in settings"
                            );
                            setSettingsOpen(true);
                            return;
                          }

                          fileInputRef.current?.click();
                        }}
                        onDragOver={(e: DragEvent<HTMLDivElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDragEnter={(e: DragEvent<HTMLDivElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add("drag-over");
                        }}
                        onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove("drag-over");
                        }}
                        onDrop={handleDrop}
                      >
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {APP_CONFIG.UPLOAD_TEXT}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {APP_CONFIG.SUPPORTED_FORMATS}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle - Transformation indicator */}
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Mobile label for Transformed Result */}
                <div className="flex items-center justify-center w-full lg:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-sm font-medium text-foreground">
                      Transformed Result
                    </span>
                  </div>
                </div>

                {/* Right side - Transformed result */}
                <div className="w-full lg:w-[45%]">
                  <div className="aspect-square overflow-hidden rounded-xl relative">
                    {transformedImage ? (
                      <div className="result-area h-full">
                        <img
                          src={transformedImage}
                          alt="Transformed"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="result-area h-full flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                          <Sparkles className="h-8 w-8 text-accent" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {APP_CONFIG.RESULT_TEXT}
                        </h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Your transformed image will appear here
                        </p>
                        {uploadError && (
                          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive text-center">
                              {uploadError}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {isProcessing && (
                      <div className="processing-overlay">
                        <div className="flex flex-col items-center">
                          <div className="spinner mb-4"></div>
                          <p className="text-sm font-medium text-foreground bg-card px-4 py-2 rounded-full shadow-sm">
                            {APP_CONFIG.PROCESSING_TEXT}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls Section */}
              <div className="mt-8 flex flex-col items-center space-y-6">
                {/* Style selector */}
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Transformation Style
                  </label>
                  <Select
                    value={transformStyle}
                    onValueChange={(value) => setTransformStyle(value)}
                  >
                    <SelectTrigger className="w-full h-12 rounded-lg border-border hover:border-primary transition-colors">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_CONFIG.TRANSFORMATION_STYLES.map((style) => (
                        <SelectItem
                          key={style.id}
                          value={style.id}
                          className="cursor-pointer"
                        >
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 w-full max-w-md">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {transformedImage && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 h-12 btn-modern"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = transformedImage || "";
                          link.download = "transformed-image.png";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="mr-2 h-5 w-5" /> Download
                      </Button>

                      <Button
                        className="flex-1 h-12 btn-modern gradient-primary text-white"
                        onClick={() => {
                          setImage(null);
                          setTransformedImage(null);
                          setUploadError(null);
                        }}
                      >
                        Transform New
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Style indicator */}
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Selected style:{" "}
              {
                APP_CONFIG.TRANSFORMATION_STYLES.find(
                  (style) => style.id === transformStyle
                )?.name
              }
            </span>
          </div>

          {/* Privacy & How it works */}
          <div className="mt-16 grid gap-8 max-w-4xl mx-auto">
            <div className="security-indicator">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  How it works
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload any image and select your preferred transformation
                  style. Our AI analyzes your image and recreates it in the
                  chosen artistic style while preserving key features.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Showcase */}
        <div className="text-center mx-auto max-w-4xl mb-16 mt-24 px-4 sm:px-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 mb-6 border border-accent/20">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Transformation Examples
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Before & After Transformations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See how real images transform into stunning artistic styles.
          </p>
        </div>

        {/* Showcase Gallery */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <div className="grid grid-cols-1 gap-8">
            {/* Example 1: Artistic Portrait */}
            <div className="feature-card overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <div className="grid grid-cols-2 h-full">
                  <div className="relative">
                    <img
                      src="/original.png"
                      alt="Original portrait"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-border">
                      Original
                    </div>
                  </div>
                  <div className="relative bg-gradient-to-br from-accent/5 to-primary/5">
                    <img
                      src="/cartoon.png"
                      alt="Artistic style"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                      Artistic Portrait
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Artistic Portrait Style
                </h3>
                <p className="text-sm text-muted-foreground">
                  Transform photos into beautiful artistic portraits with
                  enhanced colors and artistic flair
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* BYOK Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          {APP_CONFIG.BYOK_FEATURES.map((feature, index) => {
            const IconComponent =
              {
                shield: Shield,
                key: Key,
                database: Database,
                settings: Settings,
              }[feature.icon] || Shield;

            return (
              <div key={index} className="feature-card text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
