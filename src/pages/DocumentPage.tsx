import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Camera,
  MessageCircle,
  Send,
  Loader2,
  Home,
  Mic,
  Globe,
  Link as LinkIcon,
  GraduationCap,
  PlayCircle,
  BookOpen,
  Image,
  Palette,
} from "lucide-react";
import { apiClient, ChatMessage } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/components/ui/use-toast";
import { Link, useLocation } from "react-router-dom";
import { Message } from "@/types";
import { v4 as uuidv4 } from "uuid";
import MainLayout from "@/components/layout/MainLayout";
import MobileNavigation from "@/components/MobileNavigation";

interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  translation?: string;
  recommendations?: string[];
}

export default function DocumentPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<DocumentAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleLanguage = () => {
    if (language === "hindi") setLanguage("hinglish");
    else setLanguage("hindi");
  };

  const getLanguageButtonText = () => {
    switch (language) {
      case "hindi":
        return t("switchToHinglish");
      case "hinglish":
        return t("switchToHindi");
      default:
        return "हिंदी";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: language === "hindi" ? "फ़ाइल बहुत बड़ी है" : "File too large",
          description:
            language === "hindi"
              ? "कृपया 50MB से छोटी फ़ाइल अपलोड करें।"
              : "Please upload a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      setAnalysisResult(null);
      setMessages([]);
      setCapturedImage(null);
    }
  };

  const startCamera = async () => {
    try {
      console.log("📸 Starting camera...");

      // Check if we're on mobile or desktop
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      console.log("📱 Device type:", isMobile ? "Mobile" : "Desktop");

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // First show the camera modal
      setShowCamera(true);

      // Request camera permission and get stream
      const constraints = {
        video: {
          facingMode: isMobile ? "environment" : "user", // Back camera on mobile, front camera on laptop
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      console.log("🎥 Requesting camera with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Camera stream obtained");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        return new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video ref not available"));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            console.log("📹 Video metadata loaded");
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  console.log("▶️ Video started playing");
                  resolve();
                })
                .catch((playError) => {
                  console.error("❌ Error playing video:", playError);
                  reject(playError);
                });
            }
          };

          videoRef.current.onerror = (error) => {
            console.error("❌ Video error:", error);
            reject(new Error("Video loading failed"));
          };

          // Timeout if video doesn't load within 10 seconds
          setTimeout(() => {
            reject(new Error("Camera loading timeout"));
          }, 10000);
        });
      } else {
        throw new Error("Video element not available");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);

      let errorMessage = "";
      let errorTitle = "";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorTitle =
            language === "hindi"
              ? "कैमरा अनुमति चाहिए"
              : "Camera Permission Required";
          errorMessage =
            language === "hindi"
              ? "कृपया ब्राउज़र में कैमरा का उपयोग करने की अनुमति दें।"
              : "Please allow camera access in your browser settings.";
        } else if (error.name === "NotFoundError") {
          errorTitle =
            language === "hindi" ? "कैमरा नहीं मिला" : "Camera Not Found";
          errorMessage =
            language === "hindi"
              ? "कोई कैमरा डिवाइस नहीं मिला।"
              : "No camera device found.";
        } else {
          errorTitle = language === "hindi" ? "कैमरा त्रुटि" : "Camera Error";
          errorMessage =
            language === "hindi"
              ? "कैमरा एक्सेस नहीं हो सका। कृपया पुनः प्रयास करें।"
              : "Could not access camera. Please try again.";
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    console.log("📸 Capturing photo...");

    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: language === "hindi" ? "कैमरा त्रुटि" : "Camera Error",
        description:
          language === "hindi"
            ? "कैमरा उपलब्ध नहीं है।"
            : "Camera not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context not available");
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      console.log("📐 Canvas dimensions:", canvas.width, "x", canvas.height);

      // Draw the current frame from video to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data as base64
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      console.log("🖼️ Image captured, size:", imageData.length, "characters");

      // Set captured image for preview
      setCapturedImage(imageData);
      setShowCamera(false);

      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        console.log("📷 Camera stream stopped");
      }

      // Convert canvas to blob and create file for analysis
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const file = new File([blob], "captured-document.jpg", {
              type: "image/jpeg",
            });
            console.log("📁 File created:", file.name, file.size, "bytes");

            // Reset previous analysis
            setUploadedFile(file);
            setAnalysisResult(null);
            setMessages([]);
            setGeneratedImageUrl(null);

            // Show success message
            toast({
              title:
                language === "hindi" ? "फोटो कैप्चर हुई" : "Photo Captured",
              description:
                language === "hindi"
                  ? "फोटो सफलतापूर्वक कैप्चर हुई। अब विश्लेषण करें।"
                  : "Photo captured successfully. Now analyze it.",
            });

            console.log("✅ Photo capture complete, ready for analysis");
          } else {
            throw new Error("Failed to create blob from canvas");
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("❌ Error capturing photo:", error);
      toast({
        title:
          language === "hindi" ? "फोटो कैप्चर त्रुटि" : "Photo Capture Error",
        description:
          language === "hindi"
            ? "फोटो कैप्चर करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "Error capturing photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    setShowCamera(false);
  };

  const handleAnalyze = async () => {
    console.log("🔍 handleAnalyze called");
    console.log(
      "📁 uploadedFile:",
      uploadedFile?.name,
      uploadedFile?.size,
      "bytes"
    );
    console.log("📷 capturedImage:", capturedImage ? "Present" : "None");
    console.log(
      "🎨 generatedImageUrl:",
      generatedImageUrl ? "Present" : "None"
    );

    // Check if we have any content to analyze
    if (!uploadedFile && !capturedImage && !generatedImageUrl) {
      console.log("❌ No file/image found, showing error toast");
      toast({
        title: language === "hindi" ? "कोई फ़ाइल नहीं" : "No File Selected",
        description:
          language === "hindi"
            ? "कृपया पहले कोई फ़ाइल अपलोड करें या फोटो लें।"
            : "Please upload a file or take a photo first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      let result: DocumentAnalysisResult;

      console.log("🚀 Starting analysis process...");

      // Determine what type of content we're analyzing
      if (capturedImage && uploadedFile) {
        console.log("📸 Analyzing captured photo");
        result = await apiClient.analyzeDocument(uploadedFile, language);
        console.log("✅ Captured photo analysis complete");
      } else if (generatedImageUrl) {
        console.log("Analyzing generated image");
        console.log("🚀 Generated image URL:", generatedImageUrl);
        console.log(
          "🚀 About to call apiClient.analyzeDocument with backend /document endpoint for generated image"
        );

        try {
          // For generated images, convert URL to blob and analyze
          console.log("📥 Fetching generated image from URL...");
          const response = await fetch(generatedImageUrl, {
            mode: "cors",
            headers: {
              Accept: "image/*",
            },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch image: ${response.status} ${response.statusText}`
            );
          }

          console.log("✅ Successfully fetched image, converting to blob...");
          const blob = await response.blob();
          console.log(
            "✅ Blob created, size:",
            blob.size,
            "bytes, type:",
            blob.type
          );

          const file = new File([blob], "generated-image.png", {
            type: blob.type || "image/png",
          });
          console.log("✅ File created, calling analyze API...");

          result = await apiClient.analyzeDocument(file, language);
        } catch (fetchError) {
          console.error("❌ Error fetching generated image:", fetchError);

          // Fallback: Try to analyze using the image URL directly by sending it to backend
          console.log("🔄 Trying fallback method - sending URL to backend...");

          try {
            const fallbackResponse = await fetch(
              `http://localhost:8000/document`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  image_url: generatedImageUrl, // Send URL instead of base64
                  document_type: "image/png",
                  language,
                }),
              }
            );

            if (!fallbackResponse.ok) {
              throw new Error(
                `Fallback method failed: ${fallbackResponse.status}`
              );
            }

            const fallbackData = await fallbackResponse.json();

            if (fallbackData.success && fallbackData.analysis) {
              result = {
                summary:
                  fallbackData.analysis.main_information ||
                  "Generated image analyzed successfully",
                keyPoints: fallbackData.analysis.fields_detected.map(
                  (field: { field_name: string; value: string }) =>
                    `${field.field_name}: ${field.value}`
                ),
                recommendations: fallbackData.analysis.suggestions,
              };
              console.log("✅ Fallback analysis successful");
            } else {
              throw new Error("Fallback analysis failed");
            }
          } catch (fallbackError) {
            console.error("❌ Fallback method also failed:", fallbackError);

            // Final fallback: Use the image prompt for analysis
            result = {
              summary:
                language === "hindi"
                  ? `यह एक AI द्वारा बनाई गई छवि है। छवि की सामग्री का विश्लेषण करने में तकनीकी समस्या हुई है। छवि प्रॉम्प्ट के आधार पर: "${imagePrompt}"`
                  : `This is an AI-generated image. There was a technical issue analyzing the image content. Based on the image prompt: "${imagePrompt}"`,
              keyPoints: [
                language === "hindi"
                  ? "AI द्वारा बनाई गई छवि"
                  : "AI-generated image",
                language === "hindi"
                  ? "छवि विश्लेषण में तकनीकी समस्या"
                  : "Technical issue with image analysis",
                language === "hindi"
                  ? "प्रॉम्प्ट आधारित जानकारी उपलब्ध"
                  : "Prompt-based information available",
              ],
              recommendations: [
                language === "hindi"
                  ? "छवि को डाउनलोड करके पुनः अपलोड करें"
                  : "Download image and re-upload for analysis",
                language === "hindi"
                  ? "छवि का मैन्युअल रूप से उपयोग करें"
                  : "Use the image manually as needed",
              ],
            };
          }
        }
      } else if (uploadedFile) {
        console.log("📁 Analyzing uploaded file:", uploadedFile.name);
        result = await apiClient.analyzeDocument(uploadedFile, language);
        console.log("✅ Uploaded file analysis complete");
      } else {
        throw new Error("No valid input found for analysis");
      }

      console.log("Analysis result:", result);
      setAnalysisResult(result);

      // Add analysis as first message
      const analysisMessage: Message = {
        id: uuidv4(),
        content: formatAnalysisMessage(result),
        role: "assistant",
      };
      setMessages([analysisMessage]);

      toast({
        title: language === "hindi" ? "विश्लेषण पूर्ण" : "Analysis Complete",
        description:
          language === "hindi"
            ? "दस्तावेज़ का विश्लेषण सफलतापूर्वक पूरा हुआ।"
            : "Document analysis completed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);

      let errorMessage = "";
      let errorTitle = "";

      if (error instanceof Error) {
        errorMessage = error.message;

        if (
          error.message.includes("connection") ||
          error.message.includes("network")
        ) {
          errorTitle =
            language === "hindi" ? "कनेक्शन त्रुटि" : "Connection Error";
        } else if (
          error.message.includes("API") ||
          error.message.includes("service")
        ) {
          errorTitle = language === "hindi" ? "सेवा त्रुटि" : "Service Error";
        } else if (
          error.message.includes("file") ||
          error.message.includes("format")
        ) {
          errorTitle = language === "hindi" ? "फ़ाइल त्रुटि" : "File Error";
        } else {
          errorTitle =
            language === "hindi" ? "विश्लेषण त्रुटि" : "Analysis Error";
        }
      } else {
        errorTitle = language === "hindi" ? "अज्ञात त्रुटि" : "Unknown Error";
        errorMessage =
          language === "hindi"
            ? "दस्तावेज़ विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "Error analyzing document. Please try again.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });

      // Add error message to chat
      const errorChatMessage: Message = {
        id: uuidv4(),
        content:
          language === "hindi"
            ? `क्षमा करें, दस्तावेज़ विश्लेषण में समस्या हुई: ${errorMessage}\n\nकृपया:\n• अपना इंटरनेट कनेक्शन जांचें\n• फ़ाइल का साइज़ और फॉर्मेट जांचें\n• थोड़ी देर बाद पुनः प्रयास करें`
            : `Sorry, there was an issue with document analysis: ${errorMessage}\n\nPlease:\n• Check your internet connection\n• Verify file size and format\n• Try again after some time`,
        role: "assistant",
      };
      setMessages([errorChatMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisMessage = (result: DocumentAnalysisResult): string => {
    const header =
      language === "hindi"
        ? "📄 दस्तावेज़ विश्लेषण परिणाम:"
        : "📄 Document Analysis Results:";

    let message = `${header}\n\n`;

    message += `**${language === "hindi" ? "सारांश" : "Summary"}:**\n${
      result.summary
    }\n\n`;

    message += `**${language === "hindi" ? "मुख्य बिंदु" : "Key Points"}:**\n`;
    result.keyPoints.forEach((point, index) => {
      message += `${index + 1}. ${point}\n`;
    });

    if (result.translation) {
      message += `\n**${language === "hindi" ? "अनुवाद" : "Translation"}:**\n${
        result.translation
      }\n`;
    }

    if (result.recommendations && result.recommendations.length > 0) {
      message += `\n**${
        language === "hindi" ? "सुझाव" : "Recommendations"
      }:**\n`;
      result.recommendations.forEach((rec, index) => {
        message += `${index + 1}. ${rec}\n`;
      });
    }

    return message;
  };

  const handleQuestionSubmit = async () => {
    if (!currentQuestion.trim() || !analysisResult) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: currentQuestion,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      const conversationHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date().toISOString(),
      }));

      const contextPrompt =
        language === "hindi"
          ? `आपने इस दस्तावेज़ का विश्लेषण किया है। कृपया इस दस्तावेज़ के संदर्भ में उत्तर दें: ${currentQuestion}`
          : `You have analyzed this document. Please answer in the context of this document: ${currentQuestion}`;

      const response = await apiClient.sendChatMessage(
        contextPrompt,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending question:", error);

      const errorMessage =
        language === "hindi"
          ? "क्षमा करें, मैं अभी आपके प्रश्न का उत्तर नहीं दे सका। कृपया पुनः प्रयास करें।"
          : "Sorry, mai abhi aapke question ka jawab nahi de saka. Kripya phir try kariye.";

      const assistantMessage: Message = {
        id: uuidv4(),
        content: errorMessage,
        role: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: language === "hindi" ? "प्रॉम्प्ट खाली है" : "Empty Prompt",
        description:
          language === "hindi"
            ? "कृपया छवि का विस्तृत विवरण लिखें।"
            : "Please provide a detailed description of the image.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);

    try {
      console.log("Generating image with prompt:", imagePrompt);
      const imageUrl = await apiClient.generateImage(imagePrompt, language);

      console.log("Image generated successfully:", imageUrl);
      setGeneratedImageUrl(imageUrl);
      setImagePrompt(""); // Clear the prompt after successful generation

      toast({
        title: language === "hindi" ? "छवि तैयार हुई" : "Image Generated",
        description:
          language === "hindi"
            ? "आपकी छवि सफलतापूर्वक बनाई गई है।"
            : "Your image has been generated successfully.",
      });
    } catch (error) {
      console.error("Image generation error:", error);

      let errorMessage = "";
      let errorTitle = "";

      if (error instanceof Error) {
        errorMessage = error.message;

        if (
          error.message.includes("appropriate") ||
          error.message.includes("suitable")
        ) {
          errorTitle =
            language === "hindi" ? "अनुचित सामग्री" : "Inappropriate Content";
        } else if (
          error.message.includes("quota") ||
          error.message.includes("limit")
        ) {
          errorTitle = language === "hindi" ? "सीमा पार" : "Limit Exceeded";
          errorMessage =
            language === "hindi"
              ? "दैनिक छवि बनाने की सीमा पार हो गई। कल पुनः कोशिश करें।"
              : "Daily image generation limit exceeded. Please try again tomorrow.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("connection")
        ) {
          errorTitle =
            language === "hindi" ? "कनेक्शन त्रुटि" : "Connection Error";
          errorMessage =
            language === "hindi"
              ? "इंटरनेट कनेक्शन में समस्या। कृपया पुनः प्रयास करें।"
              : "Internet connection issue. Please try again.";
        } else {
          errorTitle = language === "hindi" ? "छवि त्रुटि" : "Image Error";
        }
      } else {
        errorTitle = language === "hindi" ? "छवि त्रुटि" : "Image Error";
        errorMessage =
          language === "hindi"
            ? "छवि बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "Error generating image. Please try again.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const resetDocument = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setMessages([]);
    setCapturedImage(null);
    setGeneratedImageUrl(null);
    setShowImageGenerator(false);
    setImagePrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <MainLayout>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Document Upload Section */}
        {!analysisResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("documentAnalysis")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.csv,.rtf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!uploadedFile && !capturedImage && !generatedImageUrl ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        {language === "hindi"
                          ? "फ़ाइल अपलोड करें"
                          : "Upload File"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === "hindi"
                          ? "PDF ✓, Word, PPT, छवि फ़ाइलें"
                          : "PDF ✓, Word, PPT, Image files"}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {language === "hindi"
                          ? "• PDF फ़ाइलें अब समर्थित हैं! • वास्तविक AI विश्लेषण!"
                          : "• PDF files now supported! • Real AI analysis!"}
                      </p>
                    </div>

                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                      onClick={startCamera}
                    >
                      <Camera className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        {language === "hindi" ? "फोटो लें" : "Take Photo"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === "hindi"
                          ? "दस्तावेज़ की फोटो खींचें + AI विश्लेषण"
                          : "Capture photo + AI analysis"}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {language === "hindi"
                          ? "• वास्तविक विश्लेषण!"
                          : "• Real analysis!"}
                      </p>
                    </div>

                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                      onClick={() => setShowImageGenerator(true)}
                    >
                      <Palette className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        {language === "hindi"
                          ? "छवि बनाएं"
                          : "Generate Image"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === "hindi"
                          ? "इन्फोग्राफिक और चार्ट बनाएं"
                          : "Create infographics & charts"}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {language === "hindi"
                          ? "• DALL-E AI द्वारा संचालित!"
                          : "• Powered by DALL-E AI!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {capturedImage ? (
                        <img
                          src={capturedImage}
                          alt="Captured"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : generatedImageUrl ? (
                        <img
                          src={generatedImageUrl}
                          alt="Generated"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-emerald-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {uploadedFile?.name ||
                            (capturedImage
                              ? language === "hindi"
                                ? "कैप्चर किया गया दस्तावेज़"
                                : "Captured Document"
                              : generatedImageUrl
                              ? language === "hindi"
                                ? "बनाई गई छवि"
                                : "Generated Image"
                              : "")}
                        </p>
                        {uploadedFile && (
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAnalyze}
                        disabled={
                          isAnalyzing ||
                          (!uploadedFile &&
                            !capturedImage &&
                            !generatedImageUrl)
                        }
                        className="primary-button"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t("analyzingDocument")}
                          </>
                        ) : (
                          t("analyzeDocument")
                        )}
                      </Button>
                      <Button
                        onClick={resetDocument}
                        variant="outline"
                        disabled={isAnalyzing}
                      >
                        {language === "hindi" ? "रीसेट" : "Reset"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-lg font-bold mb-4 text-center">
                {language === "hindi"
                  ? "दस्तावेज़ की फोटो लें"
                  : "Capture Document Photo"}
              </h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  webkit-playsinline="true"
                  className="w-full h-64 sm:h-80 bg-gray-200 rounded-lg mb-4 object-cover"
                  style={{ transform: "scaleX(-1)" }} // Mirror effect for front camera
                />
                {!videoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                    <p className="text-gray-500">
                      {language === "hindi"
                        ? "कैमरा लोड हो रहा है..."
                        : "Loading camera..."}
                    </p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4 justify-center">
                <Button onClick={capturePhoto} className="primary-button">
                  <Camera className="w-4 h-4 mr-2" />
                  {language === "hindi" ? "फोटो लें" : "Capture"}
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  {language === "hindi" ? "रद्द करें" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Image Generator Modal */}
        {showImageGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-emerald-600">
                {language === "hindi"
                  ? "इन्फोग्राफिक और चार्ट बनाएं"
                  : "Generate Infographics & Charts"}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {language === "hindi"
                  ? "केवल सरकारी कार्य, प्रशिक्षण सामग्री और अधिकारिक प्रस्तुतियों के लिए छवियां बनाएं।"
                  : "Create images only for government work, training materials and official presentations."}
              </p>
              <details className="mb-4">
                <summary className="text-sm font-medium text-emerald-600 cursor-pointer">
                  {language === "hindi" ? "उदाहरण देखें" : "View Examples"}
                </summary>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>
                    •{" "}
                    {language === "hindi"
                      ? "MGNREGA कार्य प्रक्रिया का फ्लोचार्ट"
                      : "MGNREGA work process flowchart"}
                  </p>
                  <p>
                    •{" "}
                    {language === "hindi"
                      ? "ग्राम पंचायत बजट का पाई चार्ट"
                      : "Gram Panchayat budget pie chart"}
                  </p>
                  <p>
                    •{" "}
                    {language === "hindi"
                      ? "स्वच्छ भारत योजना के चरण"
                      : "Swachh Bharat scheme steps"}
                  </p>
                  <p>
                    •{" "}
                    {language === "hindi"
                      ? "पंचायत चुनाव प्रक्रिया डायग्राम"
                      : "Panchayat election process diagram"}
                  </p>
                  <p>
                    •{" "}
                    {language === "hindi"
                      ? "जल जीवन मिशन इन्फोग्राफिक"
                      : "Jal Jeevan Mission infographic"}
                  </p>
                </div>
              </details>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder={
                  language === "hindi"
                    ? "विस्तार से बताएं कि आप क्या चार्ट या डायग्राम बनाना चाहते हैं...\nउदाहरण: MGNREGA के तहत मजदूरी भुगतान की प्रक्रिया दिखाने वाला स्टेप-बाई-स्टेप चार्ट बनाएं"
                    : "Describe in detail what chart or diagram you want to create...\nExample: Create a step-by-step chart showing the wage payment process under MGNREGA"
                }
                className="w-full p-4 border border-gray-300 rounded-lg mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {generatedImageUrl && (
                <div className="mb-4">
                  <img
                    src={generatedImageUrl}
                    alt="Generated"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}
              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => setShowImageGenerator(false)}
                  variant="outline"
                  disabled={isGeneratingImage}
                >
                  {language === "hindi" ? "बंद करें" : "Close"}
                </Button>
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="primary-button"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "hindi"
                        ? "बनाई जा रही है..."
                        : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4 mr-2" />
                      {language === "hindi"
                        ? "छवि बनाएं"
                        : "Generate Image"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-xl ${
                  message.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200"
                }`}
                dangerouslySetInnerHTML={{
                  __html: message.content.replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl animate-pulse">
              <p className="text-emerald-600 text-center font-medium">
                {t("thinking")}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Question Input */}
      {analysisResult && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuestionSubmit()}
              placeholder={
                language === "hindi"
                  ? "दस्तावेज़ के बारे में प्रश्न पूछें..."
                  : "Ask questions about the document..."
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleQuestionSubmit}
              disabled={isLoading || !currentQuestion.trim()}
              className="primary-button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Built by Futurelab Ikigai and Piramal Foundation © 2025
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
