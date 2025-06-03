import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { documentAnalysisService, DocumentAnalysisResult } from '@/services/documentAnalysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

interface DocumentUploadProps {
  onAnalysisComplete?: (result: DocumentAnalysisResult) => void;
}

export default function DocumentUpload({ onAnalysisComplete }: DocumentUploadProps) {
  const { language, t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: language === 'hindi' ? 'फ़ाइल बहुत बड़ी है' : 'File too large',
          description: language === 'hindi' 
            ? 'कृपया 10MB से छोटी फ़ाइल अपलोड करें।'
            : 'Please upload a file smaller than 10MB.',
          variant: 'destructive'
        });
        return;
      }

      // Check file type
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type) && 
          !file.name.endsWith('.txt') && 
          !file.name.endsWith('.doc') && 
          !file.name.endsWith('.docx') && 
          !file.name.endsWith('.pdf')) {
        toast({
          title: language === 'hindi' ? 'असमर्थित फ़ाइल प्रकार' : 'Unsupported file type',
          description: language === 'hindi' 
            ? 'कृपया TXT, PDF, या Word दस्तावेज़ अपलोड करें।'
            : 'Please upload TXT, PDF, or Word documents.',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const result = await documentAnalysisService.analyzeDocument(uploadedFile, language);
      setAnalysisResult(result);
      onAnalysisComplete?.(result);
      
      toast({
        title: language === 'hindi' ? 'विश्लेषण पूर्ण' : 'Analysis Complete',
        description: language === 'hindi' 
          ? 'दस्तावेज़ का विश्लेषण सफलतापूर्वक पूरा हुआ।'
          : 'Document analysis completed successfully.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: language === 'hindi' ? 'विश्लेषण त्रुटि' : 'Analysis Error',
        description: language === 'hindi' 
          ? 'दस्तावेज़ विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error analyzing document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('documentAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!uploadedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                onClick={handleUploadClick}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  {t('uploadDocument')}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'hindi' 
                    ? 'TXT, PDF, या Word फ़ाइलें समर्थित हैं (अधिकतम 10MB)'
                    : 'TXT, PDF, or Word files supported (max 10MB)'
                  }
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="primary-button"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('analyzingDocument')}
                      </>
                    ) : (
                      t('analyzeDocument')
                    )}
                  </Button>
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    disabled={isAnalyzing}
                  >
                    {language === 'hindi' ? 'रीसेट' : 'Reset'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {t('documentSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2 text-emerald-700">
                {language === 'hindi' ? 'सारांश' : 'Summary'}
              </h4>
              <p className="text-gray-700 p-3 bg-emerald-50 rounded-lg">
                {analysisResult.summary}
              </p>
            </div>

            {/* Key Points */}
            <div>
              <h4 className="font-semibold mb-2 text-emerald-700">
                {language === 'hindi' ? 'मुख्य बिंदु' : 'Key Points'}
              </h4>
              <ul className="space-y-2">
                {analysisResult.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-1">•</span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Translation */}
            {analysisResult.translation && (
              <div>
                <h4 className="font-semibold mb-2 text-emerald-700">
                  {language === 'hindi' ? 'अनुवाद' : 'Translation'}
                </h4>
                <p className="text-gray-700 p-3 bg-blue-50 rounded-lg">
                  {analysisResult.translation}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-emerald-700">
                  {language === 'hindi' ? 'सुझाव' : 'Recommendations'}
                </h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">→</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 