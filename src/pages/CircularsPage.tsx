import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, FileText, Home, MessageCircle, Mic, Globe, Link as LinkIcon, GraduationCap, PlayCircle, BookOpen } from "lucide-react";
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
          hindi: 'झारखंड पंचायती राज विभाग - आधिकारिक पोर्टल',
          hinglish: 'Jharkhand Panchayati Raj Department - Official Portal'
        },
        description: {
          hindi: 'अधिसूचनाएं, योजनाएं, प्रशिक्षण और अनुदान की संपूर्ण जानकारी',
          hinglish: 'Complete information on notifications, schemes, training aur grants'
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
          hindi: 'पंचायत सचिव और संबंधित पदों की भर्ती अधिसूचना',
          hinglish: 'Panchayat Secretary aur related posts recruitment notification'
        },
        url: 'https://jharnet.in/jharkhand-gram-panchayat-vacancy/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'मुख्यमंत्री कृषि आशीर्वाद योजना 2025',
          hinglish: 'Mukhyamantri Krishi Ashirwad Yojana 2025'
        },
        description: {
          hindi: '₹5000 प्रति एकड़ वार्षिक सहायता, 5 एकड़ तक कृषि भूमि',
          hinglish: '₹5000 per acre annual assistance, up to 5 acre agricultural land'
        },
        url: 'https://www.jharkhand.gov.in/agriculture',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'झारखंड में PESA अधिनियम सुदृढ़ीकरण',
          hinglish: 'Strengthening PESA Act in Jharkhand'
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
          hindi: 'झारखंड ग्रामीण रोजगार गारंटी योजना (MGNREGA)',
          hinglish: 'Jharkhand Rural Employment Guarantee Scheme (MGNREGA)'
        },
        description: {
          hindi: 'मजदूरी दरें, जॉब कार्ड अपडेट, कार्य योजना',
          hinglish: 'Wage rates, job card updates, work plan'
        },
        url: 'https://nrega.jharkhand.gov.in/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'झारखंड मुख्यमंत्री ग्राम गाड़ी योजना',
          hinglish: 'Jharkhand CM Gram Gadi Yojana'
        },
        description: {
          hindi: 'ग्रामीण परिवहन सुविधा, ऑटो रिक्शा सब्सिडी योजना',
          hinglish: 'Rural transport facility, auto rickshaw subsidy scheme'
        },
        url: 'https://transport.jharkhand.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'झारखंड अबुआ आवास योजना 2025',
          hinglish: 'Jharkhand Abua Awas Yojana 2025'
        },
        description: {
          hindi: 'ग्रामीण आवास योजना, PM आवास योजना का राज्य घटक',
          hinglish: 'Rural housing scheme, state component of PM Awas Yojana'
        },
        url: 'https://www.jharkhand.gov.in/housing',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'झारखंड जल जीवन मिशन प्रगति रिपोर्ट',
          hinglish: 'Jharkhand Jal Jeevan Mission Progress Report'
        },
        description: {
          hindi: 'नल जल कनेक्शन, ग्रामीण जल आपूर्ति, पानी की गुणवत्ता',
          hinglish: 'Nal jal connections, rural water supply, water quality'
        },
        url: 'https://jaljeevanmission.jharkhand.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'झारखंड फसल राहत योजना 2025',
          hinglish: 'Jharkhand Fasal Rahat Yojana 2025'
        },
        description: {
          hindi: 'प्राकृतिक आपदा से फसल नुकसान की भरपाई, किसान सहायता',
          hinglish: 'Crop damage compensation from natural disasters, farmer assistance'
        },
        url: 'https://agriculture.jharkhand.gov.in/',
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
          hindi: 'बिहार पंचायती राज विभाग - आधिकारिक पोर्टल',
          hinglish: 'Bihar Panchayati Raj Department - Official Portal'
        },
        description: {
          hindi: 'नवीनतम सरकारी आदेश, भर्ती अधिसूचनाएं, योजना अपडेट्स',
          hinglish: 'Latest government orders, recruitment notifications, scheme updates'
        },
        url: 'https://state.bihar.gov.in/panchayatiraj/',
        category: 'policy'
      },
      {
        title: {
          hindi: 'बिहार मखाना बोर्ड स्थापना 2025',
          hinglish: 'Bihar Makhana Board Establishment 2025'
        },
        description: {
          hindi: 'मखाना उत्पादन, प्रसंस्करण, मूल्य संवर्धन और विपणन बोर्ड',
          hinglish: 'Makhana production, processing, value addition aur marketing board'
        },
        url: 'https://state.bihar.gov.in/',
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
          hindi: 'बिहार में नेशनल इंस्टीट्यूट ऑफ फूड टेक्नोलॉजी',
          hinglish: 'National Institute of Food Technology in Bihar'
        },
        description: {
          hindi: 'खाद्य प्रसंस्करण, उद्यमिता और प्रबंधन संस्थान',
          hinglish: 'Food processing, entrepreneurship aur management institute'
        },
        url: 'https://www.indiabudget.gov.in/',
        category: 'policy'
      },
      {
        title: {
          hindi: 'बिहार ग्रीनफील्ड एयरपोर्ट प्रोजेक्ट 2025',
          hinglish: 'Bihar Greenfield Airport Project 2025'
        },
        description: {
          hindi: 'नया हवाई अड्डा, पटना विस्तार, बिहटा ब्राउनफील्ड एयरपोर्ट',
          hinglish: 'New airport, Patna expansion, Bihta brownfield airport'
        },
        url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/feb/doc202521492701.pdf',
        category: 'policy'
      },
      {
        title: {
          hindi: 'वेस्टर्न कोसी कैनाल प्रोजेक्ट मिथिलांचल',
          hinglish: 'Western Koshi Canal Project Mithilanchal'
        },
        description: {
          hindi: 'बिहार में सिंचाई परियोजना, केंद्रीय वित्तीय सहायता',
          hinglish: 'Irrigation project in Bihar, central financial assistance'
        },
        url: 'https://state.bihar.gov.in/waterresources/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'बिहार MGNREGA नवीन दिशा-निर्देश 2025',
          hinglish: 'Bihar MGNREGA New Guidelines 2025'
        },
        description: {
          hindi: 'मजदूरी दरें, कार्य योजना, जॉब कार्ड अपडेट',
          hinglish: 'Wage rates, work plan, job card updates'
        },
        url: 'https://nrega.bihar.gov.in/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'मुख्यमंत्री सात निश्चय योजना 2025',
          hinglish: 'Mukhyamantri Saat Nischay Yojana 2025'
        },
        description: {
          hindi: 'शिक्षा, स्वास्थ्य, रोजगार, सिंचाई, सड़क, बिजली, ब्रॉडबैंड',
          hinglish: 'Education, health, employment, irrigation, roads, electricity, broadband'
        },
        url: 'https://www.7nishchay-yuvaupmission.bihar.gov.in',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'बिहार जल जीवन मिशन अपडेट्स',
          hinglish: 'Bihar Jal Jeevan Mission Updates'
        },
        description: {
          hindi: 'ग्रामीण जल आपूर्ति, नल कनेक्शन योजना, जल गुणवत्ता',
          hinglish: 'Rural water supply, nal connection scheme, water quality'
        },
        url: 'https://jaljeevanmission.bihar.gov.in/',
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
          hindi: 'हरियाणा राज्य चुनाव आयोग - पंचायत चुनाव 2025',
          hinglish: 'Haryana State Election Commission - Panchayat Elections 2025'
        },
        description: {
          hindi: 'सरपंच उप-चुनाव मई 2025, चुनाव कार्यक्रम, मतदाता सूची',
          hinglish: 'Sarpanch bye-elections May 2025, election schedule, voter list'
        },
        url: 'https://secharyana.gov.in/orders-notifications-and-circulars-2025/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'हरियाणा पंचायती राज (संशोधन) अधिनियम 2025',
          hinglish: 'Haryana Panchayati Raj (Amendment) Act 2025'
        },
        description: {
          hindi: 'पंचायत गवर्नेंस में नए कानूनी प्रावधान, अधिकार और दायित्व',
          hinglish: 'New legal provisions in panchayat governance, powers aur responsibilities'
        },
        url: 'https://prsindia.org/files/bills_acts/bills_states/haryana/2025/Bill5of2025HR.pdf',
        category: 'policy'
      },
      {
        title: {
          hindi: 'मेरी फसल मेरा ब्यौरा पोर्टल',
          hinglish: 'Meri Fasal Mera Byora Portal'
        },
        description: {
          hindi: 'फसल पंजीकरण, MSP भुगतान, कृषक डेटाबेस, बीमा सुविधा',
          hinglish: 'Crop registration, MSP payment, farmer database, insurance facility'
        },
        url: 'https://fasal.haryana.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'हरियाणा ग्रामीण विकास योजनाएं 2025',
          hinglish: 'Haryana Rural Development Schemes 2025'
        },
        description: {
          hindi: 'MGNREGA, IAY, स्वच्छ भारत ग्रामीण, कौशल विकास',
          hinglish: 'MGNREGA, IAY, Swachh Bharat Gramin, skill development'
        },
        url: 'https://panchayatiraj.haryana.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'हरियाणा मुख्यमंत्री परिवार समृद्धि योजना',
          hinglish: 'Haryana CM Parivar Samridhi Yojana'
        },
        description: {
          hindi: '₹6000 वार्षिक सहायता, सामाजिक सुरक्षा, जीवन बीमा',
          hinglish: '₹6000 annual assistance, social security, life insurance'
        },
        url: 'https://cm-psy.haryana.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'हरियाणा किसान मित्र ऊर्जा योजना',
          hinglish: 'Haryana Kisan Mitra Urja Yojana'
        },
        description: {
          hindi: 'बिजली बिल सब्सिडी, कृषि कनेक्शन, मीटर इंस्टॉलेशन',
          hinglish: 'Electricity bill subsidy, agriculture connection, meter installation'
        },
        url: 'https://energy.haryana.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'हरियाणा MGNREGA मास्टर सर्कुलर 2024-25',
          hinglish: 'Haryana MGNREGA Master Circular 2024-25'
        },
        description: {
          hindi: 'मजदूरी दरें, कार्य श्रेणियां, भुगतान प्रक्रिया',
          hinglish: 'Wage rates, work categories, payment process'
        },
        url: 'https://nrega.haryana.gov.in/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'हरियाणा जल जीवन मिशन प्रगति रिपोर्ट',
          hinglish: 'Haryana Jal Jeevan Mission Progress Report'
        },
        description: {
          hindi: 'हर घर जल कनेक्शन, ग्रामीण जल आपूर्ति, वॉटर क्वालिटी',
          hinglish: 'Har ghar jal connection, rural water supply, water quality'
        },
        url: 'https://jaljeevanmission.haryana.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'हरियाणा ग्राम पंचायत डेवलपमेंट प्लान (GPDP)',
          hinglish: 'Haryana Gram Panchayat Development Plan (GPDP)'
        },
        description: {
          hindi: 'योजना निर्माण, बजट आवंटन, कार्यान्वयन गाइडलाइन्स',
          hinglish: 'Plan formulation, budget allocation, implementation guidelines'
        },
        url: 'https://gpdp.haryana.gov.in/',
        category: 'circular'
      }
    ]
  },
  {
    id: 'central',
    name: {
      hindi: 'केंद्र सरकार',
      hinglish: 'Central Government'
    },
    schemes: [
      {
        title: {
          hindi: 'केंद्रीय बजट 2025-26: ग्रामीण विकास हाइलाइट्स',
          hinglish: 'Union Budget 2025-26: Rural Development Highlights'
        },
        description: {
          hindi: 'PM धन-धान्य कृषि योजना (100 जिले), दलहन आत्मनिर्भरता मिशन, ₹1.80 लाख करोड़ आवंटन',
          hinglish: 'PM Dhan-Dhanya Krishi Yojana (100 districts), Pulses Atmanirbharta Mission, ₹1.80 lakh crore allocation'
        },
        url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/feb/doc202521492701.pdf',
        category: 'policy'
      },
      {
        title: {
          hindi: 'PM-KISAN 20वीं किस्त 2025 - नवीनतम अपडेट',
          hinglish: 'PM-KISAN 20th Installment 2025 - Latest Updates'
        },
        description: {
          hindi: 'जून 2025 में रिलीज़ की उम्मीद, e-KYC अनिवार्य, 9.8 करोड़ लाभार्थी',
          hinglish: 'Expected release June 2025, e-KYC mandatory, 9.8 crore beneficiaries'
        },
        url: 'https://pmkisan.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'PMAY-G नया लक्ष्य: 3 करोड़ घर (2025-26)',
          hinglish: 'PMAY-G New Target: 3 Crore Houses (2025-26)'
        },
        description: {
          hindi: 'शहरी+ग्रामीण आवास, Urban 2.0 शुरुआत, ₹10 लाख करोड़ निवेश',
          hinglish: 'Urban+rural housing, Urban 2.0 launch, ₹10 lakh crore investment'
        },
        url: 'https://pmayg.nic.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'पीपल्स प्लान कैंपेन 2025-26 (GPDP कैंपेन)',
          hinglish: 'People\'s Plan Campaign 2025-26 (GPDP Campaign)'
        },
        description: {
          hindi: 'पंचायत विकास योजना तैयारी, 29 विषयों का अभिसरण, ग्राम सभा कैलेंडर',
          hinglish: 'Panchayat Development Plan preparation, 29 subjects convergence, Gram Sabha calendar'
        },
        url: 'https://gpdp.nic.in/',
        category: 'policy'
      },
      {
        title: {
          hindi: 'MGNREGA मास्टर सर्कुलर 2024-25',
          hinglish: 'MGNREGA Master Circular 2024-25'
        },
        description: {
          hindi: 'राज्य-वार वेतन दरें, ओम्बड्समैन चयन पैनल, कार्य श्रेणियां',
          hinglish: 'State-wise wage rates, Ombudsman selection panel, work categories'
        },
        url: 'https://nrega.nic.in/',
        category: 'circular'
      },
      {
        title: {
          hindi: 'जल जीवन मिशन विस्तार - 2028 तक',
          hinglish: 'Jal Jeevan Mission Extension - Till 2028'
        },
        description: {
          hindi: 'बढ़ा आवंटन, हर घर नल कनेक्शन, ग्रामीण जल आपूर्ति सुधार',
          hinglish: 'Increased allocation, har ghar nal connection, rural water supply improvement'
        },
        url: 'https://jaljeevanmission.gov.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'KCC संशोधित ब्याज सब्सिडी योजना 2025',
          hinglish: 'KCC Modified Interest Subvention Scheme 2025'
        },
        description: {
          hindi: 'ऋण सीमा ₹3 लाख से बढ़कर ₹5 लाख, बेहतर शर्तें',
          hinglish: 'Loan limit increased from ₹3 lakh to ₹5 lakh, better terms'
        },
        url: 'https://www.nabard.org/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'SVAMITVA योजना प्रॉपर्टी कार्ड वितरण 2025',
          hinglish: 'SVAMITVA Scheme Property Card Distribution 2025'
        },
        description: {
          hindi: 'ड्रोन सर्वे, संपत्ति कार्ड ई-वितरण, भूमि रिकॉर्ड डिजिटलीकरण',
          hinglish: 'Drone survey, property card e-distribution, land records digitization'
        },
        url: 'https://svamitva.nic.in/',
        category: 'scheme'
      },
      {
        title: {
          hindi: 'राष्ट्रीय पंचायत पुरस्कार 2024-25',
          hinglish: 'National Panchayat Awards 2024-25'
        },
        description: {
          hindi: 'सर्वश्रेष्ठ पंचायतों को पुरस्कार, आवेदन प्रक्रिया, मानदंड',
          hinglish: 'Awards for best panchayats, application process, criteria'
        },
        url: 'https://panchayat.gov.in/en/',
        category: 'policy'
      },
      {
        title: {
          hindi: 'आत्मनिर्भर कृषि पैकेज 2025 - विस्तृत दिशा-निर्देश',
          hinglish: 'Atmanirbhar Agriculture Package 2025 - Detailed Guidelines'
        },
        description: {
          hindi: '6-वर्षीय दलहन मिशन, 5-वर्षीय कपास मिशन, सब्जी-फल कार्यक्रम',
          hinglish: '6-year Pulses Mission, 5-year Cotton Mission, vegetables-fruits program'
        },
        url: 'https://agricoop.gov.in/',
        category: 'policy'
      }
    ]
  }
];

const centralData = {
  name: {
    hindi: 'केंद्र सरकार',
    hinglish: 'Central Government'
  },
  schemes: [
    {
      title: {
        hindi: 'पंचायती राज मंत्रालय - आधिकारिक अधिसूचनाएं 2024-25',
        hinglish: 'Ministry of Panchayati Raj - Official Notifications 2024-25'
      },
      description: {
        hindi: 'राष्ट्रीय पंचायत पुरस्कार 2024, RGSA संशोधन, eGramSwaraj नवीन फीचर्स',
        hinglish: 'National Panchayat Awards 2024, RGSA revisions, eGramSwaraj new features'
      },
      url: 'https://panchayat.gov.in/en/',
      category: 'policy' as const
    },
    {
      title: {
        hindi: 'केंद्रीय बजट 2025-26: ग्रामीण विकास हाइलाइट्स',
        hinglish: 'Union Budget 2025-26: Rural Development Highlights'
      },
      description: {
        hindi: 'PM धन-धान्य कृषि योजना (100 जिले), दलहन आत्मनिर्भरता मिशन, ₹1.80 लाख करोड़ आवंटन',
        hinglish: 'PM Dhan-Dhanya Krishi Yojana (100 districts), Pulses Atmanirbharta Mission, ₹1.80 lakh crore allocation'
      },
      url: 'https://www.indiabudget.gov.in/',
      category: 'policy' as const
    },
    {
      title: {
        hindi: 'PM-KISAN 20वीं किस्त 2025 - नवीनतम अपडेट',
        hinglish: 'PM-KISAN 20th Installment 2025 - Latest Updates'
      },
      description: {
        hindi: 'जून 2025 में रिलीज़ की उम्मीद, e-KYC अनिवार्य, 9.8 करोड़ लाभार्थी, मोबाइल ऐप eKYC',
        hinglish: 'Expected release June 2025, e-KYC mandatory, 9.8 crore beneficiaries, mobile app eKYC'
      },
      url: 'https://pmkisan.gov.in/',
      category: 'scheme' as const
    },
    {
      title: {
        hindi: 'PMAY-G (प्रधानमंत्री आवास योजना ग्रामीण) 2025-26',
        hinglish: 'PMAY-G (Pradhan Mantri Awas Yojana Gramin) 2025-26'
      },
      description: {
        hindi: 'नया लक्ष्य: 3 करोड़ घर (शहरी+ग्रामीण), Urban 2.0 शुरुआत, ₹10 लाख करोड़ निवेश',
        hinglish: 'New target: 3 crore houses (urban+rural), Urban 2.0 launch, ₹10 lakh crore investment'
      },
      url: 'https://pmayg.nic.in/',
      category: 'scheme' as const
    },
    {
      title: {
        hindi: 'MGNREGA मास्टर सर्कुलर 2024-25',
        hinglish: 'MGNREGA Master Circular 2024-25'
      },
      description: {
        hindi: 'राज्य-वार वेतन दरें, ओम्बड्समैन चयन पैनल, कार्य श्रेणियां, डिजिटल पेमेंट',
        hinglish: 'State-wise wage rates, Ombudsman selection panel, work categories, digital payments'
      },
      url: 'https://nrega.nic.in/',
      category: 'circular' as const
    },
    {
      title: {
        hindi: 'पीपल्स प्लान कैंपेन 2025-26 (GPDP कैंपेन)',
        hinglish: 'People\'s Plan Campaign 2025-26 (GPDP Campaign)'
      },
      description: {
        hindi: 'पंचायत विकास योजना तैयारी, 29 विषयों का अभिसरण, ग्राम सभा कैलेंडर',
        hinglish: 'Panchayat Development Plan preparation, 29 subjects convergence, Gram Sabha calendar'
      },
      url: 'https://gpdp.nic.in/',
      category: 'policy' as const
    },
    {
      title: {
        hindi: 'जल जीवन मिशन अपडेट्स 2025',
        hinglish: 'Jal Jeevan Mission Updates 2025'
      },
      description: {
        hindi: '2028 तक विस्तार, बढ़ा आवंटन, हर घर नल कनेक्शन, ग्रामीण जल आपूर्ति',
        hinglish: 'Extended till 2028, increased allocation, har ghar nal connection, rural water supply'
      },
      url: 'https://jaljeevanmission.gov.in/',
      category: 'scheme' as const
    },
    {
      title: {
        hindi: 'SVAMITVA योजना प्रॉपर्टी कार्ड वितरण 2025',
        hinglish: 'SVAMITVA Scheme Property Card Distribution 2025'
      },
      description: {
        hindi: 'ड्रोन सर्वे, संपत्ति कार्ड ई-वितरण, भूमि रिकॉर्ड डिजिटलीकरण',
        hinglish: 'Drone survey, property card e-distribution, land records digitization'
      },
      url: 'https://svamitva.nic.in/',
      category: 'scheme' as const
    },
    {
      title: {
        hindi: 'कृषि आत्मनिर्भरता पैकेज 2025 - विस्तृत दिशा-निर्देश',
        hinglish: 'Agriculture Atmanirbharta Package 2025 - Detailed Guidelines'
      },
      description: {
        hindi: '6-वर्षीय दलहन मिशन, 5-वर्षीय कपास मिशन, सब्जी-फल कार्यक्रम, बीज मिशन',
        hinglish: '6-year Pulses Mission, 5-year Cotton Mission, vegetables-fruits program, seeds mission'
      },
      url: 'https://agricoop.gov.in/',
      category: 'policy' as const
    },
    {
      title: {
        hindi: 'KCC संशोधित ब्याज सब्सिडी योजना 2025',
        hinglish: 'KCC Modified Interest Subvention Scheme 2025'
      },
      description: {
        hindi: 'ऋण सीमा ₹3 लाख से बढ़कर ₹5 लाख, बेहतर शर्तें, सरल प्रक्रिया',
        hinglish: 'Loan limit increased from ₹3 lakh to ₹5 lakh, better terms, simple process'
      },
      url: 'https://www.nabard.org/',
      category: 'scheme' as const
    }
  ]
};

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

              <Link to="/glossary" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </span>
              </Link>

              <Link to="/videos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <PlayCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos'}
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
            
            {/* Desktop Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Built by Futurelab Ikigai and Piramal Foundation
              </p>
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
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 z-50">
          <div className="flex justify-center items-center space-x-1 max-w-md mx-auto">
            <Link 
              to="/" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Home size={14} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <MessageCircle size={14} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={14} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-1 rounded-xl">
              <LinkIcon size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </div>

            <Link 
              to="/document" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <FileText size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link 
              to="/academy" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <GraduationCap size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <Link 
              to="/glossary" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <BookOpen size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </span>
            </Link>

            <Link 
              to="/videos" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <PlayCircle size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'वीडियो' : 'Videos'}
              </span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-center mb-16">
          <p className="text-xs text-gray-500">
            Built by Futurelab Ikigai and Piramal Foundation
          </p>
        </div>
      </div>
    </div>
  );
} 