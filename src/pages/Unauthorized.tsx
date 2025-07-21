import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Unauthorized() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {language === 'hindi' ? 'अनधिकृत पहुंच' : 'Unauthorized Access'}
          </CardTitle>
          <CardDescription>
            {language === 'hindi'
              ? 'आपको इस पृष्ठ तक पहुंचने की अनुमति नहीं है।'
              : 'You do not have permission to access this page.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            {language === 'hindi'
              ? 'यह पृष्ठ केवल एडमिन उपयोगकर्ताओं के लिए है। यदि आपको लगता है कि यह एक गलती है, तो कृपया अपने सिस्टम एडमिनिस्ट्रेटर से संपर्क करें।'
              : 'This page is restricted to admin users only. If you believe this is an error, please contact your system administrator.'}
          </p>

          <div className="pt-4">
            <Link to="/chat">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                {language === 'hindi' ? 'होम पर वापस जाएं' : 'Go Back Home'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
