import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, PlayCircle, BookOpen, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface GlossaryTerm {
  id: number;
  term: {
    hindi: string;
    hinglish: string;
  };
  meaning: {
    hindi: string;
    hinglish: string;
  };
  example: {
    hindi: string;
    hinglish: string;
  };
  category: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    id: 1,
    term: {
      hindi: 'मनरेगा (MGNREGA)',
      hinglish: 'MGNREGA'
    },
    meaning: {
      hindi: 'महात्मा गांधी राष्ट्रीय रोजगार गारंटी अधिनियम - गरीब परिवारों को 100 दिन काम की गारंटी',
      hinglish: 'Mahatma Gandhi National Rural Employment Guarantee Act - gareeb families ko 100 din kaam ki guarantee'
    },
    example: {
      hindi: 'राम को मनरेगा में तालाब खोदने का काम मिला',
      hinglish: 'Ram ko MGNREGA mein talab khodne ka kaam mila'
    },
    category: 'schemes'
  },
  {
    id: 2,
    term: {
      hindi: 'ग्राम सभा',
      hinglish: 'Gram Sabha'
    },
    meaning: {
      hindi: 'गांव के सभी बालिग लोगों की बैठक जहां गांव के फैसले होते हैं',
      hinglish: 'Gaon ke sabhi adult logo ki meeting jaha gaon ke decisions hote hain'
    },
    example: {
      hindi: 'ग्राम सभा में स्कूल बनाने का फैसला हुआ',
      hinglish: 'Gram Sabha mein school banane ka decision hua'
    },
    category: 'governance'
  },
  {
    id: 3,
    term: {
      hindi: 'सरकारी परिपत्र',
      hinglish: 'Government Circular'
    },
    meaning: {
      hindi: 'सरकार की तरफ से आने वाला कागज जिसमें नए नियम या जानकारी होती है',
      hinglish: 'Government ki taraf se aane wala paper jismein naye rules ya information hoti hai'
    },
    example: {
      hindi: 'नई योजना का परिपत्र सभी सरपंचों को भेजा गया',
      hinglish: 'Nayi scheme ka circular sabhi sarpanch ko bheja gaya'
    },
    category: 'documents'
  },
  {
    id: 4,
    term: {
      hindi: 'लाभार्थी',
      hinglish: 'Beneficiary'
    },
    meaning: {
      hindi: 'वह व्यक्ति जिसको सरकारी योजना का फायदा मिलता है',
      hinglish: 'Wo vyakti jisko government scheme ka fayda milta hai'
    },
    example: {
      hindi: 'सीता आवास योजना की लाभार्थी है',
      hinglish: 'Sita awas yojana ki beneficiary hai'
    },
    category: 'general'
  },
  {
    id: 5,
    term: {
      hindi: 'ऑडिट',
      hinglish: 'Audit'
    },
    meaning: {
      hindi: 'पैसों का हिसाब-किताब की जांच करना कि सही खर्च हुआ है या नहीं',
      hinglish: 'Paiso ka hisab-kitab ki checking karna ki sahi kharch hua hai ya nahi'
    },
    example: {
      hindi: 'ग्राम पंचायत का ऑडिट हर साल होता है',
      hinglish: 'Gram Panchayat ka audit har saal hota hai'
    },
    category: 'finance'
  },
  {
    id: 6,
    term: {
      hindi: 'बजट',
      hinglish: 'Budget'
    },
    meaning: {
      hindi: 'साल भर में कितना पैसा कहां खर्च होगा इसकी योजना',
      hinglish: 'Saal bhar mein kitna paisa kaha kharch hoga iski planning'
    },
    example: {
      hindi: 'अगले साल का बजट 10 लाख रुपए है',
      hinglish: 'Agle saal ka budget 10 lakh rupees hai'
    },
    category: 'finance'
  },
  {
    id: 7,
    term: {
      hindi: 'प्रमाणपत्र',
      hinglish: 'Certificate'
    },
    meaning: {
      hindi: 'सरकारी कागज जो किसी बात को सच मानता है',
      hinglish: 'Government paper jo kisi baat ko sach manta hai'
    },
    example: {
      hindi: 'राज को जाति प्रमाणपत्र चाहिए',
      hinglish: 'Raj ko caste certificate chahiye'
    },
    category: 'documents'
  },
  {
    id: 8,
    term: {
      hindi: 'आवेदन',
      hinglish: 'Application'
    },
    meaning: {
      hindi: 'किसी चीज को मांगने के लिए भरा जाने वाला फॉर्म',
      hinglish: 'Kisi cheez ko maangne ke liye bhara jaane wala form'
    },
    example: {
      hindi: 'पेंशन के लिए आवेदन दिया',
      hinglish: 'Pension ke liye application diya'
    },
    category: 'general'
  },
  {
    id: 9,
    term: {
      hindi: 'पोर्टल',
      hinglish: 'Portal'
    },
    meaning: {
      hindi: 'इंटरनेट पर सरकारी काम करने की वेबसाइट',
      hinglish: 'Internet par government kaam karne ki website'
    },
    example: {
      hindi: 'ई-ग्राम स्वराज पोर्टल पर रिपोर्ट भेजी',
      hinglish: 'e-Gram Swaraj portal par report bheji'
    },
    category: 'digital'
  },
  {
    id: 10,
    term: {
      hindi: 'PFMS',
      hinglish: 'PFMS'
    },
    meaning: {
      hindi: 'पब्लिक फाइनेंशियल मैनेजमेंट सिस्टम - सरकारी पैसे भेजने का सिस्टम',
      hinglish: 'Public Financial Management System - government money bhejne ka system'
    },
    example: {
      hindi: 'PFMS से मजदूरों को पेमेंट किया',
      hinglish: 'PFMS se majdooro ko payment kiya'
    },
    category: 'digital'
  },
  {
    id: 11,
    term: {
      hindi: 'प्रधानमंत्री आवास योजना',
      hinglish: 'PM Awas Yojana'
    },
    meaning: {
      hindi: 'गरीब परिवारों को पक्का घर बनाने के लिए पैसा देने की योजना',
      hinglish: 'Gareeb families ko pakka ghar banane ke liye paisa dene ki scheme'
    },
    example: {
      hindi: 'गीता को PM आवास योजना से घर मिला',
      hinglish: 'Geeta ko PM Awas Yojana se ghar mila'
    },
    category: 'schemes'
  },
  {
    id: 12,
    term: {
      hindi: 'स्वच्छ भारत मिशन',
      hinglish: 'Swachh Bharat Mission'
    },
    meaning: {
      hindi: 'भारत को साफ-सुथरा बनाने की योजना, शौचालय बनवाना',
      hinglish: 'Bharat ko saaf-suthra banane ki scheme, toilet banwana'
    },
    example: {
      hindi: 'स्वच्छ भारत मिशन से हर घर में टॉयलेट बना',
      hinglish: 'Swachh Bharat Mission se har ghar mein toilet bana'
    },
    category: 'schemes'
  },
  {
    id: 13,
    term: {
      hindi: 'जॉब कार्ड',
      hinglish: 'Job Card'
    },
    meaning: {
      hindi: 'मनरेगा में काम करने के लिए मिलने वाला कार्ड',
      hinglish: 'MGNREGA mein kaam karne ke liye milne wala card'
    },
    example: {
      hindi: 'श्याम का जॉब कार्ड बन गया',
      hinglish: 'Shyam ka job card ban gaya'
    },
    category: 'documents'
  },
  {
    id: 14,
    term: {
      hindi: 'सामाजिक लेखा परीक्षा',
      hinglish: 'Social Audit'
    },
    meaning: {
      hindi: 'गांव के लोगों के सामने पैसे का हिसाब दिखाना',
      hinglish: 'Gaon ke logo ke saamne paise ka hisab dikhana'
    },
    example: {
      hindi: 'सामाजिक लेखा परीक्षा में सभी खर्च बताए गए',
      hinglish: 'Social audit mein sabhi expenses bataye gaye'
    },
    category: 'governance'
  },
  {
    id: 15,
    term: {
      hindi: 'मेट',
      hinglish: 'Mate'
    },
    meaning: {
      hindi: 'मनरेगा के काम की देखरेख करने वाला व्यक्ति',
      hinglish: 'MGNREGA ke kaam ki dekhrekh karne wala vyakti'
    },
    example: {
      hindi: 'मेट रोज काम की जांच करता है',
      hinglish: 'Mate roz kaam ki checking karta hai'
    },
    category: 'general'
  },
  {
    id: 16,
    term: {
      hindi: 'मस्टर रोल',
      hinglish: 'Muster Roll'
    },
    meaning: {
      hindi: 'मनरेगा में काम करने वाले मजदूरों की हाजिरी की सूची',
      hinglish: 'MGNREGA mein kaam karne wale majdooro ki attendance ki list'
    },
    example: {
      hindi: 'मस्टर रोल में 20 मजदूरों के नाम हैं',
      hinglish: 'Muster roll mein 20 majdooro ke naam hain'
    },
    category: 'documents'
  },
  {
    id: 17,
    term: {
      hindi: 'ई-FMS',
      hinglish: 'e-FMS'
    },
    meaning: {
      hindi: 'इलेक्ट्रॉनिक फंड मैनेजमेंट सिस्टम - कंप्यूटर से पैसे का हिसाब',
      hinglish: 'Electronic Fund Management System - computer se paise ka hisab'
    },
    example: {
      hindi: 'ई-FMS में सभी पेमेंट का रिकॉर्ड है',
      hinglish: 'e-FMS mein sabhi payments ka record hai'
    },
    category: 'digital'
  },
  {
    id: 18,
    term: {
      hindi: 'BPL सूची',
      hinglish: 'BPL List'
    },
    meaning: {
      hindi: 'गरीबी रेखा से नीचे के परिवारों की सूची',
      hinglish: 'Garibi rekha se niche ke families ki list'
    },
    example: {
      hindi: 'BPL सूची में 50 परिवार हैं',
      hinglish: 'BPL list mein 50 families hain'
    },
    category: 'documents'
  },
  {
    id: 19,
    term: {
      hindi: 'अनुदान',
      hinglish: 'Grant'
    },
    meaning: {
      hindi: 'सरकार की तरफ से मिलने वाला पैसा जो वापस नहीं करना होता',
      hinglish: 'Government ki taraf se milne wala paisa jo wapas nahi karna hota'
    },
    example: {
      hindi: 'स्कूल बनाने के लिए 5 लाख का अनुदान मिला',
      hinglish: 'School banane ke liye 5 lakh ka grant mila'
    },
    category: 'finance'
  },
  {
    id: 20,
    term: {
      hindi: 'कार्य दिवस',
      hinglish: 'Work Days'
    },
    meaning: {
      hindi: 'मनरेगा में किसी ने कितने दिन काम किया इसकी गिनती',
      hinglish: 'MGNREGA mein kisi ne kitne din kaam kiya iski counting'
    },
    example: {
      hindi: 'राम ने 50 कार्य दिवस पूरे किए',
      hinglish: 'Ram ne 50 work days complete kiye'
    },
    category: 'general'
  }
];

export default function GlossaryPage() {
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isReading, setIsReading] = useState(false);

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

  const categories = [
    { id: "all", name: { hindi: "सभी शब्द", hinglish: "All Terms" } },
    { id: "schemes", name: { hindi: "योजनाएं", hinglish: "Schemes" } },
    { id: "governance", name: { hindi: "शासन", hinglish: "Governance" } },
    { id: "documents", name: { hindi: "दस्तावेज", hinglish: "Documents" } },
    { id: "finance", name: { hindi: "वित्त", hinglish: "Finance" } },
    { id: "digital", name: { hindi: "डिजिटल", hinglish: "Digital" } },
    { id: "general", name: { hindi: "सामान्य", hinglish: "General" } }
  ];

  // Filter terms based on search and category
  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.meaning[language].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Text-to-Speech functionality
  const startReading = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang === 'en-IN' || 
        voice.name.includes('Indian') || 
        voice.name.includes('India') ||
        (language === 'hindi' && voice.lang === 'hi-IN')
      );
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  const readTerm = (term: GlossaryTerm) => {
    const text = `${term.term[language]}. ${term.meaning[language]}. ${language === 'hindi' ? 'उदाहरण:' : 'Example:'} ${term.example[language]}`;
    startReading(text);
  };

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

              <Link to="/circulars" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <LinkIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरकारी परिपत्र' : 'Government Circulars'}
                </span>
              </Link>

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

              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <BookOpen className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </span>
              </div>

              <Link to="/videos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <PlayCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos'}
                </span>
              </Link>
            </div>
          </div>

          {/* Main Glossary Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-4xl font-bold text-emerald-600 mb-4">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </h2>
                <p className="text-xl text-gray-600">
                  {language === 'hindi' 
                    ? 'सरपंच के लिए जरूरी शब्दों का सरल अर्थ'
                    : 'Simple meanings of important words for sarpanch'
                  }
                </p>
              </div>

              {/* Search and Filter */}
              <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={language === 'hindi' ? 'शब्द खोजें...' : 'Search terms...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name[language]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Glossary Terms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {filteredTerms.map((term) => (
                  <Card key={term.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-emerald-600">
                          {term.term[language]}
                        </CardTitle>
                        <Button
                          onClick={() => readTerm(term)}
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">
                            {language === 'hindi' ? 'अर्थ:' : 'Meaning:'}
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {term.meaning[language]}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">
                            {language === 'hindi' ? 'उदाहरण:' : 'Example:'}
                          </h4>
                          <p className="text-gray-600 text-sm italic">
                            "{term.example[language]}"
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTerms.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {language === 'hindi' ? 'कोई शब्द नहीं मिला' : 'No terms found'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'hindi' 
                      ? 'कृपया अपने खोज शब्द बदलें'
                      : 'Please try different search terms'
                    }
                  </p>
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
            <div>
              <h1 className="text-lg font-bold text-emerald-600">
                📚 {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </h1>
              <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
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
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📚</div>
              <h2 className="text-xl font-bold text-emerald-600 mb-2">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </h2>
              <p className="text-gray-600 text-sm">
                {language === 'hindi' 
                  ? 'जरूरी शब्दों का सरल अर्थ'
                  : 'Simple meanings of important words'
                }
              </p>
            </div>

            {/* Mobile Search */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'hindi' ? 'शब्द खोजें...' : 'Search terms...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-emerald-200 focus:border-emerald-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name[language]}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Terms */}
            <div className="space-y-4">
              {filteredTerms.map((term) => (
                <Card key={term.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-emerald-600 text-sm">
                        {term.term[language]}
                      </h3>
                      <Button
                        onClick={() => readTerm(term)}
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-700 text-xs leading-relaxed">
                          {term.meaning[language]}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-gray-600 text-xs italic">
                          "{term.example[language]}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTerms.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {language === 'hindi' ? 'कोई शब्द नहीं मिला' : 'No terms found'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {language === 'hindi' 
                    ? 'कृपया अपने खोज शब्द बदलें'
                    : 'Please try different search terms'
                  }
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 z-50">
          <div className="flex justify-center items-center space-x-2 max-w-md mx-auto">
            <Link to="/" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <Home size={14} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link to="/chat" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <MessageCircle size={14} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link to="/voice-agent" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <Mic size={14} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link to="/circulars" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <LinkIcon size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link to="/document" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <FileText size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link to="/academy" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <GraduationCap size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-1 rounded-xl">
              <BookOpen size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </span>
            </div>

            <Link to="/videos" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <PlayCircle size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'वीडियो' : 'Videos'}
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
} 