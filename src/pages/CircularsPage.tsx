import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, FileText, Home, MessageCircle, Mic, Globe, Link as LinkIcon, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";

interface StateData {
  id: string;
  name: {
    hindi: string;
    hinglish: string;
  };
  schemes: Array<{
    title: {
      hindi: string;
      hinglish: string;
    };
    description: {
      hindi: string;
      hinglish: string;
    };
    url: string;
    category: 'scheme' | 'circular' | 'policy';
  }>;
}

const statesData: StateData[] = [
  {
    id: 'jharkhand',
    name: {
      hindi: 'झारखंड',
      hinglish: 'Jharkhand'
    },
    schemes: [
      {
        title: {
          hindi: 'झारखंड पंचायती राज विभाग',
          hinglish: 'Jharkhand Panchayati Raj Department'
        },
        description: {
          hindi: 'अधिसूचनाएं, योजनाएं, प्रशिक्षण और अनुदान',
          hinglish: 'Notifications, schemes, training aur grants'
        },
        url: 'https://www.jharkhand.gov.in/panchayatiraj',
        category: 'policy'
      },
      {
        title: {
          hindi: 'झारखंड ग्राम पंचायत भर्ती 2025',
          hinglish: 'Jharkhand Gram Panchayat Vacancy 2025'
        },
        description: {
          hindi: 'पंचायत सचिव और संबंधित पदों की भर्ती',
          hinglish: 'Panchayat Secretary aur related posts recruitment'
        },
        url: 'https://jharnet.in/jharkhand-gram-panchayat-vacancy/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'झारखंड राज्य कृषि योजनाएं',
          hinglish: 'Jharkhand State Agricultural Schemes'
        },
        description: {
          hindi: 'कृषि आशीर्वाद योजना, कृषि ऋण माफी, फसल राहत',
          hinglish: 'Krishi Ashirwad, Rin Mafi, Fasal Rahat schemes'
        },
        url: 'https://www.manage.gov.in/fpoacademy/SGSchemes/Jharkhand.pdf',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'झारखंड में PESA अधिनियम सुदृढ़ीकरण',
          hinglish: 'Strengthening PESA in Jharkhand'
        },
        description: {
          hindi: 'आदिवासी क्षेत्र परिपत्र और कार्यान्वयन दिशा-निर्देश',
          hinglish: 'Tribal area circulars aur implementation guidelines'
        },
        url: 'https://cdnbbsr.s3waas.gov.in/s316026d60ff9b54410b3435b403afd226/uploads/2025/01/2025012289328784.pdf',
        category: 'circular'
      },
      {
        title: {
          hindi: 'झारखंड इंटर्नशिप योजना 2025',
          hinglish: 'Jharkhand Internship Scheme 2025'
        },
        description: {
          hindi: 'छात्रों के लिए ग्रामीण विकास इंटर्नशिप',
          hinglish: 'Students ke liye rural development internship'
        },
        url: 'https://harichandguruchanduniversity.com/jharkhand-internship-scheme-2025/',
        category: 'scheme'
      }
    ]
  },
  {
    id: 'haryana',
    name: {
      hindi: 'हरियाणा',
      hinglish: 'Haryana'
    },
    schemes: [
      {
        title: {
          hindi: 'हरियाणा राज्य चुनाव आयोग',
          hinglish: 'State Election Commission Haryana'
        },
        description: {
          hindi: '2025 के सभी आदेश, अधिसूचनाएं और परिपत्र',
          hinglish: 'All 2025 orders, notifications aur circulars'
        },
        url: 'https://secharyana.gov.in/orders-notifications-and-circulars-2025/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'हरियाणा बजट 2025-26',
          hinglish: 'Haryana Budget 2025-26'
        },
        description: {
          hindi: 'ग्रामीण, कृषि, जल और किसान योजनाओं की पूरी सूची',
          hinglish: 'Rural, agriculture, water aur kisan schemes ki list'
        },
        url: 'https://cdnbbsr.s3waas.gov.in/s386e78499eeb33fb9cac16b7555b50767/uploads/2025/03/202503171028223073.pdf',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'हरियाणा पंचायती राज (संशोधन) विधेयक 2025',
          hinglish: 'Haryana Panchayati Raj Amendment Bill 2025'
        },
        description: {
          hindi: 'पंचायत शासन के लिए नवीन कानून',
          hinglish: 'Latest law for panchayat governance'
        },
        url: 'https://prsindia.org/files/bills_acts/bills_states/haryana/2025/Bill5of2025HR.pdf',
        category: 'policy'
      },
      {
        title: {
          hindi: 'सरपंच और पंचायत समिति उप-चुनाव',
          hinglish: 'Sarpanch aur Panchayat Samiti Bye-elections'
        },
        description: {
          hindi: 'मई 2025 उप-चुनाव अधिसूचना',
          hinglish: 'May 2025 bye-election notification'
        },
        url: 'https://cdnbbsr.s3waas.gov.in/s31c6a0198177bfcc9bd93f6aab94aad3c/uploads/2025/05/20250515677007789.pdf',
        category: 'circular'
      },
      {
        title: {
          hindi: 'मेरी फसल मेरा ब्यौरा',
          hinglish: 'Meri Fasal Mera Byora'
        },
        description: {
          hindi: 'किसानों के लिए फसल पंजीकरण योजना',
          hinglish: 'Crop registration scheme for farmers'
        },
        url: 'https://fasal.haryana.gov.in',
        category: 'scheme'
      }
    ]
  },
 
  {
    id: 'bihar',
    name: {
      hindi: 'बिहार',
      hinglish: 'Bihar'
    },
    schemes: [
      {
        title: {
          hindi: 'बिहार पंचायती राज विभाग',
          hinglish: 'Bihar Panchayati Raj Department'
        },
        description: {
          hindi: 'आधिकारिक साइट: अधिसूचनाएं, भर्ती, परिपत्र',
          hinglish: 'Official site: notifications, recruitment, circulars'
        },
        url: 'https://state.bihar.gov.in/planning/',
        category: 'policy'
      },
      {
        title: {
          hindi: 'बिहार पंचायती राज भर्ती 2025',
          hinglish: 'Bihar Panchayati Raj Recruitment 2025'
        },
        description: {
          hindi: 'ग्राम कचहरी सचिव - 1583 पदों की भर्ती',
          hinglish: 'Gram Kachahari Sachiv - 1583 posts recruitment'
        },
        url: 'https://www.freshersnow.com/bihar-panchayati-raj-recruitment/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'प्रधानमंत्री आवास योजना ग्रामीण बिहार',
          hinglish: 'PM Awas Yojana Gramin Bihar'
        },
        description: {
          hindi: 'पात्रता, सूची और प्रक्रिया की जानकारी',
          hinglish: 'Eligibility, list aur process information'
        },
        url: 'https://www.bajajfinserv.in/pradhan-mantri-awas-yojana-gramin-bihar-list',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'बिहार की शीर्ष 10 सरकारी योजनाएं 2025',
          hinglish: 'Top 10 Government Schemes Bihar 2025'
        },
        description: {
          hindi: 'फसल सहायता, सौर क्रांति सिंचाई, स्टूडेंट क्रेडिट कार्ड',
          hinglish: 'Fasal Sahayata, Saur Kranti Sinchai, Student Credit Card'
        },
        url: 'https://www.jaagrukbharat.com/top-government-schemes-in-bihar-2025-4855771',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'मुख्यमंत्री निश्चय स्वयं सहायता भत्ता योजना',
          hinglish: 'CM Nischay Swayam Sahayata Bhatta Yojana'
        },
        description: {
          hindi: 'युवाओं के लिए स्वयं सहायता भत्ता',
          hinglish: 'Self-help allowance for youth'
        },
        url: 'https://www.7nishchay-yuvaupmission.bihar.gov.in',
        category: 'scheme'
      }
    ]
  },
  {
    id: 'central',
    name: {
      hindi: 'केंद्रीय योजनाएं',
      hinglish: 'Central Government'
    },
    schemes: [
      {
        title: {
          hindi: 'महात्मा गांधी नरेगा वार्षिक मास्टर परिपत्र 2024-25',
          hinglish: 'MGNREGA Annual Master Circular 2024-25'
        },
        description: {
          hindi: 'जॉब कार्ड, कन्वर्जेंस, नई दिशा-निर्देश',
          hinglish: 'Job card, convergence, new guidelines'
        },
        url: 'https://nregaplus.nic.in/netnrega/writereaddata/Circulars/AMC_2024-25-English.pdf',
        category: 'circular'
      },
      {
        title: {
          hindi: 'पंचायत विकास योजना (GPDP) अभियान',
          hinglish: 'Panchayat Development Plan Campaign'
        },
        description: {
          hindi: 'ग्राम पंचायत विकास योजना के विवरण और दिशा-निर्देश',
          hinglish: 'GPDP campaign details aur guidelines'
        },
        url: 'https://gpdp.nic.in',
        category: 'policy'
      },
      {
        title: {
          hindi: 'राष्ट्रीय ग्राम स्वराज अभियान (RGSA)',
          hinglish: 'Rashtriya Gram Swaraj Abhiyan'
        },
        description: {
          hindi: 'पंचायतों के लिए प्रशिक्षण और क्षमता निर्माण',
          hinglish: 'Training aur capacity building for panchayats'
        },
        url: 'https://rgsa.gov.in',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'केंद्रीय बजट 2025-26',
          hinglish: 'Union Budget 2025-26'
        },
        description: {
          hindi: 'ग्रामीण योजनाएं, जल जीवन मिशन, अमृत सरोवर',
          hinglish: 'Rural schemes, Jal Jeevan Mission, Amrit Sarovar'
        },
        url: 'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2100410',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'मॉडल महिला-अनुकूल ग्राम पंचायत पहल',
          hinglish: 'Model Women-Friendly Gram Panchayats'
        },
        description: {
          hindi: 'महिला नेतृत्व, स्वास्थ्य, निगरानी डैशबोर्ड',
          hinglish: 'Women leadership, health, monitoring dashboard'
        },
        url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2108572',
        category: 'policy'
      }
    ]
  }
];

export default function CircularsPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'scheme' | 'circular' | 'policy'>('all');

  const toggleLanguage = () => {
    if (language === 'hindi') setLanguage('hinglish');
    else setLanguage('hindi');
  };

  const getLanguageButtonText = () => {
    switch(language) {
      case 'hindi': return t('switchToHinglish');
      case 'hinglish': return t('switchToHindi');
      default: return 'हिंदी';
    }
  };

  const getCategoryText = (category: string) => {
    const categories = {
      all: language === 'hindi' ? 'सभी' : 'All',
      scheme: language === 'hindi' ? 'योजनाएं' : 'Schemes',
      circular: language === 'hindi' ? 'परिपत्र' : 'Circulars',
      policy: language === 'hindi' ? 'नीतियां' : 'Policies'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getCategoryIcon = (category: 'scheme' | 'circular' | 'policy') => {
    const icons = {
      scheme: '🎯',
      circular: '📋',
      policy: '📜'
    };
    return icons[category];
  };

  const selectedStateData = selectedState ? statesData.find(s => s.id === selectedState) : null;
  const filteredSchemes = selectedStateData?.schemes.filter(scheme => 
    selectedCategory === 'all' || scheme.category === selectedCategory
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Desktop Layout */}
      <div className="hidden lg:block desktop-layout">
        <div className="chat-desktop">
          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-emerald-600 mb-2">{t('appTitle')}</h1>
              <p className="text-gray-600 text-sm">{t('appSubtitle')}</p>
            </div>
            
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="w-full mb-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Globe className="w-4 h-4 mr-2" />
              {getLanguageButtonText()}
            </Button>

            <div className="space-y-3">
              <Link to="/" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Home className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('home')}</span>
              </Link>
              
              <Link to="/chat" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('chat')}</span>
              </Link>
              
              <Link to="/voice-agent" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Mic className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('voice')}</span>
              </Link>

              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <LinkIcon className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {language === 'hindi' ? 'सरकारी परिपत्र' : 'Government Circulars'}
                </span>
              </div>

              <Link to="/document" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('documentAnalysis')}</span>
              </Link>

              <Link to="/academy" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <GraduationCap className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                </span>
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedState ? (
                // State Selection
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-emerald-600 mb-4">
                      {language === 'hindi' ? 'महत्वपूर्ण सरकारी योजनाएं और परिपत्र' : 'Important Government Schemes and Circulars'}
                    </h2>
                    <p className="text-gray-600">
                      {language === 'hindi' 
                        ? 'अपना राज्य चुनें और संबंधित योजनाओं की जानकारी प्राप्त करें'
                        : 'Choose your state and access relevant schemes and information'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {statesData.map((state) => (
                      <Card 
                        key={state.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                        onClick={() => setSelectedState(state.id)}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="text-4xl mb-4">🏛️</div>
                          <h3 className="text-xl font-bold text-emerald-700 mb-2">
                            {state.name[language]}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {state.schemes.length} {language === 'hindi' ? 'योजनाएं और परिपत्र' : 'schemes and circulars'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                // State Schemes and Circulars
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setSelectedState(null)}
                        variant="outline"
                        size="sm"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {language === 'hindi' ? 'वापस' : 'Back'}
                      </Button>
                      <h2 className="text-2xl font-bold text-emerald-600">
                        {selectedStateData?.name[language]} - {language === 'hindi' ? 'योजनाएं और परिपत्र' : 'Schemes & Circulars'}
                      </h2>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 mb-6">
                    {['all', 'scheme', 'circular', 'policy'].map((category) => (
                      <Button
                        key={category}
                        onClick={() => setSelectedCategory(category as any)}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        className={selectedCategory === category ? "primary-button" : ""}
                      >
                        {getCategoryText(category)}
                      </Button>
                    ))}
                  </div>

                  {/* Schemes List */}
                  <div className="space-y-4">
                    {filteredSchemes.map((scheme, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{getCategoryIcon(scheme.category)}</span>
                                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                  {getCategoryText(scheme.category)}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {scheme.title[language]}
                              </h3>
                              <p className="text-gray-600 mb-4">
                                {scheme.description[language]}
                              </p>
                            </div>
                            <Button
                              onClick={() => window.open(scheme.url, '_blank')}
                              className="primary-button ml-4"
                              size="sm"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {language === 'hindi' ? 'देखें' : 'View'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredSchemes.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {language === 'hindi' 
                          ? 'इस श्रेणी में कोई योजना या परिपत्र उपलब्ध नहीं है।'
                          : 'No schemes or circulars available in this category.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              {selectedState && (
                <Button
                  onClick={() => setSelectedState(null)}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-bold text-emerald-600">
                  {language === 'hindi' ? 'सरकारी परिपत्र' : 'Gov Circulars'}
                </h1>
                <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
              </div>
            </div>
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Globe className="w-4 h-4 mr-1" />
              {getLanguageButtonText()}
            </Button>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto bg-white mobile-padding">
          <div className="max-w-md mx-auto p-4">
            {!selectedState ? (
              // State Selection
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-emerald-600 mb-2">
                    {language === 'hindi' ? 'राज्य चुनें' : 'Select State'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {language === 'hindi' 
                      ? 'अपना राज्य चुनें'
                      : 'Choose your state'
                    }
                  </p>
                </div>

                <div className="space-y-4">
                  {statesData.map((state) => (
                    <Card 
                      key={state.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedState(state.id)}
                    >
                      <CardContent className="p-4 flex items-center">
                        <div className="text-2xl mr-4">🏛️</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-700">
                            {state.name[language]}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {state.schemes.length} {language === 'hindi' ? 'योजनाएं' : 'items'}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              // State Schemes
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-emerald-600 mb-3">
                    {selectedStateData?.name[language]}
                  </h2>
                  
                  {/* Mobile Category Filter */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'scheme', 'circular', 'policy'].map((category) => (
                      <Button
                        key={category}
                        onClick={() => setSelectedCategory(category as any)}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${selectedCategory === category ? "primary-button" : ""}`}
                      >
                        {getCategoryText(category)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mobile Schemes List */}
                <div className="space-y-3">
                  {filteredSchemes.map((scheme, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">{getCategoryIcon(scheme.category)}</span>
                              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                {getCategoryText(scheme.category)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                              {scheme.title[language]}
                            </h3>
                            <p className="text-gray-600 text-xs mb-3">
                              {scheme.description[language]}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(scheme.url, '_blank')}
                          className="primary-button w-full"
                          size="sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          {language === 'hindi' ? 'देखें' : 'View'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredSchemes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      {language === 'hindi' 
                        ? 'कोई योजना उपलब्ध नहीं है।'
                        : 'No schemes available.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="flex justify-center items-center space-x-6 max-w-md mx-auto">
            <Link 
              to="/" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Home size={18} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <MessageCircle size={18} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={18} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-2 rounded-xl">
              <LinkIcon size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </div>

            <Link 
              to="/document" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <FileText size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link 
              to="/academy" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <GraduationCap size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
} 