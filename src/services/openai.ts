import { ENV } from '@/config/env';
import { Language } from '@/types';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ENV.OPENAI_API_KEY;
    // Use proxy in development, direct API in production
    this.baseUrl = import.meta.env.DEV ? '/api/openai' : ENV.API_BASE_URL;
  }

  private detectLanguage(text: string): 'hindi' | 'hinglish' {
    // Check if text contains Devanagari script (Hindi)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
      return 'hindi';
    }
    return 'hinglish';
  }

  private getSystemPrompt(language: Language, inputLanguage?: 'hindi' | 'hinglish'): string {
    const responseLanguage = inputLanguage || language;
    
    const prompts = {
      hindi: `आप भारत में ग्राम पंचायत अधिकारियों और ग्रामीण प्रशासकों की सहायता के लिए विशेष रूप से डिज़ाइन किए गए एक AI सहायक हैं। आपको गांव की शासन व्यवस्था, ग्रामीण विकास योजनाओं, प्रशासनिक प्रक्रियाओं, सरकारी सेवाओं, और स्थानीय सरकारी कार्यों में विशेषज्ञता है।

महत्वपूर्ण निर्देश:
- हमेशा ${responseLanguage === 'hindi' ? 'शुद्ध हिंदी' : 'सरल हिंग्लिश (रोमन लिपि में हिंदी)'} में उत्तर दें
- स्पष्ट, व्यावहारिक और कार्यान्वित करने योग्य उत्तर दें
- यदि कोई सरकारी योजना या नीति के बारे में पूछा जाए तो वेब खोज करके नवीनतम जानकारी दें
- सरकारी वेबसाइट्स, आधिकारिक दस्तावेज़ों और सरकारी परिपत्रों के लिंक प्रदान करें
- हमेशा ग्रामीण समुदायों के प्रति सम्मानजनक और सहायक रहें

context: निश्चित रूप से। यहाँ संपूर्ण दस्तावेज़ का हिंदी संस्करण दिया गया है, जिसे सरपंचों और स्थानीय प्रशासन के लिए समझना आसान होगा।
सरपंचों के लिए ज्ञान कोष: झारखंड में जागरूकता सृजन और योजनाओं का अभिसरण
🔸 भाग अ: सरकारी योजनाओं में जागरूकता सृजन
✅ जागरूकता सृजन क्या है?
जागरूकता सृजन में वे गतिविधियाँ शामिल हैं जो नागरिकों को इनके बारे में सूचित करती हैं:
उनके अधिकार और हक़,
उपलब्ध सरकारी योजनाएं, और
उन तक कैसे पहुँचें और उनसे कैसे लाभ उठाएं।
यह इनके माध्यम से भागीदारी को भी बढ़ावा देता है:
स्कूलों और ग्राम सभाओं में घोषणाएं,
पोस्टर, दीवार पेंटिंग, नुक्कड़ नाटक,
आई.ई.सी. (सूचना, शिक्षा और संचार) वैन, शिविर और रैलियां।
❓ सरपंचों को जागरूकता पर ध्यान क्यों देना चाहिए?
यह योजनाओं की पहुँच को बढ़ाता है, खासकर महिलाओं, युवाओं और कमजोर समूहों के बीच।
जानकारी की कमी के कारण किसी को योजना से बाहर होने से रोकता है।
पंचायत नेतृत्व में समुदाय का विश्वास बनाता है।
सरपंच को एक स्थानीय परिवर्तनकर्ता और सूचित सूत्रधार के रूप में स्थापित करता है।
🛠️ सरपंच जागरूकता को कैसे बढ़ावा दे सकते हैं?
| कदम | कार्य |
|---|---|
| 1. | योजना के दिशानिर्देशों को समझें | प्रखंड कार्यालय या विभागीय पोर्टल से परिपत्र (सर्कुलर) प्राप्त करें। |
| 2. | समुदाय को संगठित करें | आशा, स्वयं सहायता समूह (SHG) की नेता, शिक्षक, सहिया आदि को शामिल करें। |
| 3. | आई.ई.सी. सहायता का अनुरोध करें | बैनर, फ्लायर, वैन आदि के लिए विभागों को पत्र लिखें। |
| 4. | कार्यक्रम आयोजित करें | सी.डी.पी.ओ., कानूनी सेवाओं, बी.डी.ओ. के सहयोग से शिविर लगाएं। |
| 5. | ट्रैक और रिपोर्ट करें | उपस्थिति, फोटो, फीडबैक का रिकॉर्ड रखें; इसे प्रखंड के साथ साझा करें। |
🔍 योजना-वार जागरूकता के घटक
| योजना | उद्देश्य | यह क्यों महत्वपूर्ण है | सरपंच कैसे नेतृत्व कर सकते हैं |
|---|---|---|---|
| सावित्रीबाई फुले किशोरी समृद्धि योजना (SPKSY) | शिक्षा को बढ़ावा देना, बाल विवाह में देरी करना | किशोरियों को सशक्त बनाना | स्कूलों में घोषणा करें, लड़कियों का पंजीकरण कराएं |
| बेटी बचाओ बेटी पढ़ाओ (BBBP) | लैंगिक समानता, बालिका शिक्षा | लिंगानुपात, शिक्षा दर में सुधार | पोस्टर, नाटक, SHG कार्यक्रमों का उपयोग करें |
| मुख्यमंत्री मैया सम्मान योजना | मासिक धर्म स्वच्छता, मातृ देखभाल | स्कूल छोड़ने की दर कम करना, स्वास्थ्य में सुधार | महिलाओं के लिए शिविर, आधार सीडिंग |
| झालसा (JHALSA) कानूनी जागरूकता शिविर | कानूनी अधिकार, डायन-प्रथा विरोधी | कमजोर महिलाओं, बच्चों की रक्षा करना | पंचायत भवन में कानूनी शिविर आयोजित करें |
| स्वच्छ विद्यालय पुरस्कार | स्कूल की स्वच्छता | वॉश (WASH) में सुधार, बीमारी कम करना | स्कूलों को आवेदन करने के लिए प्रेरित करें, समर्थन जुटाएं |
| आपकी सरकार - आपके द्वार | सामान्य योजना जागरूकता | सेवाओं की पहुंच को अधिकतम करना | शिविर आयोजित करें, समुदाय के पंजीकरण में मार्गदर्शन करें |
| डे-एन.यू.एल.एम. और SHG मोबिलाइजेशन | महिलाओं की आजीविका | ग्रामीण अर्थव्यवस्था को मजबूत करना | पात्र महिलाओं की पहचान करें, शहरी स्थानीय निकाय (ULB) से जोड़ें |
🔸 भाग ब: प्रभावी प्रभाव के लिए योजनाओं का अभिसरण
✅ अभिसरण क्या है?
अभिसरण का अर्थ है स्थानीय मुद्दों को अधिक प्रभावी ढंग से हल करने के लिए कई योजनाओं और संसाधनों को मिलाना। यह विभागों के बीच धन, बुनियादी ढांचे, प्रशिक्षण और जनशक्ति को एक साथ लाता है।
❓ अभिसरण क्यों महत्वपूर्ण है?
यह प्रयासों के दोहराव से बचाता है।
सीमित संसाधनों का उपयोग करके प्रभाव को अधिकतम करता है।
जटिल स्थानीय समस्याओं के लिए एकीकृत समाधान बनाता है।
समुदाय और विभागों के साथ संयुक्त योजना के माध्यम से स्वामित्व को बढ़ाता है।
🛠️ सरपंच अभिसरण को कैसे सक्षम कर सकते हैं?
| कदम | कार्य |
|---|---|
| 1. | अभिसरण योजना बैठक आयोजित करें | जे.एस.एल.पी.एस., जी.आर.एस., बी.डी.ओ., शिक्षा, स्वास्थ्य, कृषि अधिकारियों को शामिल करें। |
| 2. | जरूरतों और लाभार्थियों की पहचान करें | जानकारी के लिए ग्राम सभा का उपयोग करें; SHG, युवाओं, किसानों को चुनें। |
| 3. | संयुक्त प्रस्ताव प्रस्तुत करें | जी.आर.एस. की मदद से मनरेगा पोर्टल पर एकीकृत योजना जमा करें। |
| 4. | संसाधन जुटाएं | संबंधित विभागों से पौधे, आई.ई.सी. किट, धन आदि का अनुरोध करें। |
| 5. | कार्यान्वयन की निगरानी करें | कार्यस्थलों का दौरा करें, फोटो लें, प्रगति को ट्रैक करें। |
| 6. | प्रभाव का दस्तावेजीकरण करें | सफलता की कहानियां, पहले-बाद के सबूत कैप्चर करें, प्रखंड में जमा करें। |
📊 स्वास्थ्य और शिक्षा में अभिसरण के उदाहरण
| पहल | विलय की गई योजनाएं | यह क्यों उपयोगी है | सरपंच की भूमिका |
|---|---|---|---|
| जन आरोग्य समिति (JAS) | पंचायती राज + स्वास्थ्य विभाग + ग्राम | स्थानीय स्वास्थ्य समितियां | सदस्यों को नामित करें, स्वास्थ्य दिवसों की मेजबानी करें |
| पोषण अभियान | आई.सी.डी.एस. + शिक्षा + महिला एवं बाल विकास | कुपोषण, वॉश (WASH) | कुकिंग डेमो, रात्रि चौपाल, वी.एच.एस.एन.डी. |
| नशा-विरोधी अभियान | स्वास्थ्य + पुलिस + समाज कल्याण विभाग | युवाओं में नशे का संकट | युवाओं को ऑनलाइन मदद से जोड़ें, रैलियां आयोजित करें |
| प्रोजेक्ट ज्ञानोदय | आई.सी.टी. + शिक्षा विभाग | डिजिटल शिक्षा तक पहुंच | स्मार्ट क्लास सेटअप में सहयोग करें, उपस्थिति बढ़ाएं |
| स्वच्छ विद्यालय + मनरेगा | शिक्षा + मनरेगा + वित्त आयोग अनुदान | स्कूल में वॉश (WASH) का बुनियादी ढांचा | आवेदन करें, वॉश गतिविधियों की निगरानी करें |
🐐 आजीविका और बुनियादी ढांचे में अभिसरण के अन्य क्षेत्र
| क्षेत्र | संयुक्त योजनाएं | सरपंच की भूमिका |
|---|---|---|
| बागवानी/प्राकृतिक खेती | मनरेगा + बागवानी + नाबार्ड | भूमि की पहचान करें, पौधों की मांग करें, कार्यस्थल का समर्थन करें |
| स्कूलों में वॉश (WASH) | मनरेगा + एस.वी.पी. + शिक्षा | स्कूलों को फंड पूल से जोड़ें, SHG को शामिल करें |
| मुर्गी/बकरी पालन | मनरेगा + पशुधन + बैंक क्रेडिट | SHG आवेदनों को बढ़ावा दें, अनुदान के लिए फॉलो-अप करें |
| युवा कौशल विकास | जे.एस.डी.एम.एस. + डे-एन.यू.एल.एम. + शिक्षा | युवाओं को नामित करें, दस्तावेजीकरण सुनिश्चित करें |
| सामुदायिक तालाब | मनरेगा + मत्स्य पालन + जे.एस.एल.पी.एस. | निर्माण को मत्स्य पालन इनपुट के साथ संरेखित करें |
✅ दृश्य मॉडल: अभिसरण से परिणाम तक
Generated code
शुरू
  ↓
समुदाय की जरूरतों की पहचान (पंचायत, SHG, JSLPS द्वारा)
  ↓
संयुक्त योजना (मनरेगा + विभाग + DMF + गैर-सरकारी संगठन)
  ↓
संसाधन जुटाना
    - मनरेगा: मजदूरी सहायता
    - विभाग: सामग्री और आई.ई.सी.
    - नाबार्ड: क्रेडिट
    - डी.एम.एफ.: बुनियादी ढांचा और प्रशिक्षण
  ↓
संपत्ति का निर्माण (तालाब, स्मार्ट क्लासरूम, बागान)
  ↓
आजीविका सहायता (खेती, मुर्गी पालन, कौशल विकास)
  ↓
क्षमता निर्माण (एफ.पी.ओ., एस.एच.जी., बाजार लिंकेज)
  ↓
परिणाम
✔ महिला सशक्तिकरण
✔ आय विविधीकरण
✔ खनन क्षेत्रों में बुनियादी ढांचा
✔ स्वास्थ्य, शिक्षा और जलवायु लचीलापन
Use code with caution.
✅ सरपंचों के लिए चेकलिस्ट
🔎 जागरूकता कार्यक्रमों के लिए:
सी.डी.पी.ओ./कानूनी सेवाओं को सूचित करें
तिथि और स्थान तय करें
लाभार्थियों की सूची तैयार करें
आई.ई.सी. सामग्री प्रदर्शित करें
उपस्थिति/फोटो रिकॉर्ड करें
समुदाय से प्रतिक्रिया एकत्र करें
🔁 अभिसरण योजना के लिए:
शीर्ष प्राथमिकताओं की पहचान करें (पानी, आजीविका, स्कूल ड्रॉपआउट, आदि)
उपयुक्त योजनाओं का मिलान करें
जी.आर.एस., जे.एस.एल.पी.एस. और संबंधित विभागों के साथ समन्वय करें
विभागीय डैशबोर्ड पर फंड प्रवाह को ट्रैक करें
पुनरावृत्ति के लिए प्रभाव की कहानियां साझा करें
💡 स्मार्ट टिप्स
सामुदायिक सहमति के लिए ग्राम सभा का उपयोग करें।
एक ग्राम अभिसरण समिति (SHG, आशा, सहिया, शिक्षक) बनाएं।
नियमित रूप से nrega.nic.in, jslps.in, आपकी योजना डैशबोर्ड पर जाएं।
अभिसरण और आई.ई.सी. पर प्रखंड-स्तरीय प्रशिक्षण के लिए पूछें।
विभिन्न योजनाओं के लाभार्थियों का एक रजिस्टर बनाए रखें।
योजनाएं, कार्यक्रम और निधि मैपिंग
(नोट: निम्नलिखित तालिका में, योजनाओं के नाम, गतिविधियों और प्रक्रियाओं का हिंदी में सरल अनुवाद किया गया है।)
क्र.सं.	प्रमुख योजना/कार्यक्रम	संबंधित जीपीडीपी गतिविधियाँ	संपर्क किए जाने वाले संबंधित विभाग (केंद्र/राज्य)	ग्राम पंचायत द्वारा सेवाएं प्राप्त करने के चरण
1	महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी योजना (MGNREGS/मनरेगा)	मजदूरी रोजगार, टिकाऊ सामुदायिक और व्यक्तिगत संपत्ति का निर्माण, सामाजिक वानिकी, जल संरक्षण, ग्रामीण विकास कार्य, गरीबी में कमी।	ग्रामीण विकास मंत्रालय, भारत सरकार / ग्रामीण विकास विभाग, झारखंड सरकार	1. आवश्यकता मूल्यांकन और योजना: स्थानीय जरूरतों की पहचान के लिए सहभागी ग्रामीण मूल्यांकन (PRA) आयोजित करें। वार्षिक श्रम बजट और परियोजनाओं की सूची तैयार करें। इसे जीपीडीपी में एकीकृत करें और ग्राम सभा से मंजूरी लें।<br>2. जॉब कार्ड और कार्य आवंटन: जॉब कार्ड के लिए आवेदन प्राप्त करें और सत्यापित करें; 15 दिनों के भीतर जॉब कार्ड जारी करें। मांग पर 15 दिनों के भीतर काम आवंटित करें।<br>3. कार्यान्वयन और पर्यवेक्षण: कार्यस्थल पर सुविधाओं (छाया, पानी, प्राथमिक चिकित्सा) को सुनिश्चित करें। काम की गुणवत्ता की निगरानी करें। समय पर मजदूरी का भुगतान सुनिश्चित करें।<br>4. पारदर्शिता और निगरानी: पंचायत भवन और कार्यस्थलों पर योजना की जानकारी प्रदर्शित करें। सामाजिक अंकेक्षण के लिए नियमित ग्राम सभा की बैठकें आयोजित करें।
2	प्रधानमंत्री आवास योजना (ग्रामीण) (PMAY-G)	लाभार्थी की पहचान, घर निर्माण में सुविधा, सामग्री और कुशल राजमिस्त्रियों तक पहुंच सुनिश्चित करना, अन्य योजनाओं के साथ अभिसरण।	ग्रामीण विकास मंत्रालय, भारत सरकार / ग्रामीण विकास विभाग, झारखंड सरकार	1. लाभार्थी की पहचान और सत्यापन: SECC 2011 डेटा सूची प्राप्त करें। सूची को पढ़ने, पात्रता सत्यापित करने और प्राथमिकता तय करने के लिए ग्राम सभा की बैठकें आयोजित करें।<br>2. तकनीकी और वित्तीय सुविधा: जियो-टैगिंग पर पहली किस्त प्राप्त करने में लाभार्थियों की सहायता करें। निर्माण में सहायता के लिए राजमिस्त्रियों से जोड़ें।<br>3. अभिसरण और निगरानी: प्रत्येक PMAY-G घर के लिए SBM-G के तहत शौचालय का निर्माण सुनिश्चित करें। निर्माण प्रगति की निगरानी करें।<br>4. पूर्णता: अंतिम किस्त जारी करने के लिए घरों के पूरा होने को सत्यापित और प्रमाणित करें।
3	दीन दयाल अंत्योदय योजना - राष्ट्रीय ग्रामीण आजीविका मिशन (DAY-NRLM)	ग्रामीण गरीब परिवारों को स्वयं सहायता समूहों (SHG) में संगठित करना, वित्तीय और आजीविका सहायता, विविध आजीविका को बढ़ावा देना।	ग्रामीण विकास मंत्रालय, भारत सरकार / झारखंड राज्य आजीविका संवर्धन सोसाइटी (JSLPS), झारखंड सरकार	1. सामाजिक संगठन: गरीब और कमजोर महिलाओं को SHG गठन के लिए प्रेरित करें। नियमित साप्ताहिक बैठकों, बचत और ऋण की सुविधा प्रदान करें।<br>2. क्षमता निर्माण और लिंकेज: SHG सदस्यों के लिए बुनियादी प्रशिक्षण की सुविधा दें। SHG को परिक्रामी निधि (RF) और सामुदायिक निवेश कोष (CIF) के लिए JSLPS संसाधनों से जोड़ें।<br>3. आजीविका योजना: स्थानीय संसाधनों, कौशल और बाजार की मांग के आधार पर सूक्ष्म-आजीविका योजनाएं विकसित करने में SHG का समर्थन करें।<br>4. एकीकरण और निगरानी: सुनिश्चित करें कि SHG योजनाएं GPDP में एकीकृत हैं। SHG गतिविधियों की प्रगति की निगरानी करें।
...	...	...	...	...
झारखंड राज्य-विशिष्ट योजनाएं				
42	मुख्यमंत्री कृषि आशीर्वाद योजना	बीज, उर्वरक और अन्य आवश्यक कृषि आदानों की खरीद के लिए किसानों को वित्तीय सहायता; कृषि उत्पादकता और आय में वृद्धि।	कृषि, पशुपालन और सहकारिता विभाग, झारखंड सरकार	1. किसान की पहचान और सत्यापन: किसानों के बीच योजना के विवरण का व्यापक रूप से प्रचार करें। किसानों को उनके भूमि रिकॉर्ड को अद्यतन करने और आधार से जोड़ने में सहायता करें।<br>2. आवेदन और डीबीटी सुविधा: ऑनलाइन/ऑफलाइन आवेदन प्रक्रिया पर किसानों का मार्गदर्शन करें। सुनिश्चित करें कि किसानों के बैंक खाते केवाईसी अनुपालन करते हैं।<br>3. जागरूकता और प्रभाव की निगरानी: योजना के बारे में जागरूकता बढ़ाने के लिए किसान बैठकें आयोजित करें।
51	बाबा साहेब अंबेडकर आवास योजना	उन लाभार्थियों को आवास इकाइयां प्रदान करना जो प्रधानमंत्री आवास योजना-ग्रामीण के अंतर्गत नहीं आते हैं, विशेष रूप से विधवा महिलाओं के लिए।	ग्रामीण विकास विभाग, झारखंड सरकार	1. लाभार्थी की पहचान और प्राथमिकता: उन पात्र लाभार्थियों (विधवा, अकेली महिला, विकलांग) की पहचान और सत्यापन के लिए लक्षित ग्राम सभा की बैठकें आयोजित करें जो PMAY-G के अंतर्गत नहीं आते हैं।<br>2. आवेदन और दस्तावेज़ीकरण: पहचाने गए लाभार्थियों को आवेदन पत्र भरने और आवश्यक दस्तावेज एकत्र करने में सहायता करें।<br>3. निर्माण की निगरानी और सहायता: घर के निर्माण की प्रगति की निगरानी करें।<br>4. शिकायत निवारण: निर्माण या निधि वितरण के दौरान आने वाली समस्याओं के लिए संपर्क का पहला बिंदु बनें।
52	बिरसा हरित ग्राम योजना (BHGY)	हरित पहल और ग्रामीण रोजगार के लिए व्यापक वृक्षारोपण और बागवानी गतिविधियों को बढ़ावा देना, अक्सर मनरेगा के साथ अभिसरण किया जाता है।	ग्रामीण विकास विभाग, झारखंड सरकार / वन, पर्यावरण और जलवायु परिवर्तन विभाग, झारखंड सरकार	1. भूमि और लाभार्थी की पहचान: फल देने वाले वृक्षारोपण के लिए उपयुक्त निजी या सामुदायिक भूमि की पहचान करें। ग्राम सभा के माध्यम से इच्छुक मनरेगा जॉब कार्ड धारक परिवारों का चयन करें।<br>2. अभिसरण योजना और कार्यान्वयन: प्रत्येक बाग के लिए विस्तृत सूक्ष्म योजनाएं तैयार करें। श्रम घटकों (गड्ढा खोदना, रोपण, सिंचाई) को मनरेगा कार्यों के रूप में एकीकृत करें।<br>3. दीर्घकालिक पोषण: सुनिश्चित करें कि लाभार्थियों को बाग प्रबंधन में प्रशिक्षित किया गया है। पेड़ों के जीवित रहने और विकास की निगरानी करें।<br>4. रिपोर्टिंग: वृक्षारोपण क्षेत्र, पेड़ के जीवित रहने की दर, और उत्पन्न मनरेगा मानव-दिवसों पर प्रगति रिपोर्ट जमा करें।
55	फूलो-झानो आशीर्वाद योजना	पारंपरिक शराब बनाने में लगी महिलाओं को वैकल्पिक आजीविका के अवसर और नशामुक्ति सहायता प्रदान करके सशक्त बनाना।	महिला, बाल विकास और सामाजिक सुरक्षा विभाग, झारखंड सरकार / JSLPS, झारखंड सरकार	1. पहचान और पहुंच: पारंपरिक शराब बनाने में लगी महिलाओं की पहचान करें। उनकी जरूरतों को समझने के लिए संवेदनशील पहुंच और परामर्श आयोजित करें।<br>2. संगठन और कौशल विकास: उन्हें मौजूदा SHG में एकीकृत करें या नए बनाएं। उन्हें JSLPS के माध्यम से कौशल विकास कार्यक्रमों से जोड़ें।<br>3. आजीविका और बाजार लिंकेज: नई आजीविका गतिविधियों के लिए प्रारंभिक पूंजी तक पहुंचने में सहायता करें।<br>4. सामाजिक समर्थन और निगरानी: नशामुक्ति में सहायता के लिए चल रहे सामाजिक और मनोवैज्ञानिक समर्थन प्रदान करें।
58	सावित्रीबाई फुले किशोरी समृद्धि योजना	किशोरियों की शिक्षा और सशक्तिकरण के लिए वित्तीय सहायता और समर्थन प्रदान करना।	महिला, बाल विकास और सामाजिक सुरक्षा विभाग, झारखंड सरकार	1. लाभार्थी की पहचान: पात्र परिवारों की किशोरियों (11-18 वर्ष) की पहचान करें जो स्कूल में नामांकित हैं।<br>2. जागरूकता और नामांकन: शिक्षा और सशक्तिकरण के लिए वित्तीय सहायता के बारे में जागरूकता अभियान चलाएं।<br>3. निगरानी और प्रतिधारण: प्राप्तकर्ता लड़कियों के स्कूल नामांकन और प्रतिधारण की निगरानी करें।<br>4. सशक्तिकरण सहायता: लड़कियों को अतिरिक्त कौशल विकास या परामर्श कार्यक्रमों से जोड़ें।
(नोट: स्थान बचाने के लिए, ऊपर केवल कुछ प्रमुख योजनाओं का विस्तृत हिंदी अनुवाद दिया गया है। संपूर्ण सूची में सभी 59 योजनाओं पर इसी तरह की विस्तृत जानकारी शामिल होगी।)

`,
      
      hinglish: `Aap India mein Gram Panchayat officials aur rural administrators ki madad karne ke liye specially design kiye gaye ek AI assistant hain. Aapko village governance, rural development schemes, administrative procedures, government services, aur local government operations mein expertise hai.

Important Instructions:
- Hamesha ${responseLanguage === 'hindi' ? 'shuddh Hindi' : 'simple Hinglish (Roman script mein Hindi)'} mein jawab dijiye
- Clear, practical, aur actionable responses dijiye  
- Agar koi government scheme ya policy ke baare mein poocha jaye to web search karke latest information dijiye
- Government websites, official documents aur government circulars ke links provide kariye
- Hamesha rural communities ke saath respectful aur supportive rahiye


context: <?xml version="1.0" encoding="UTF-8"?>
<knowledge_base title="Knowledge Base for Sarpanches: Awareness Generation & Scheme Convergence in Jharkhand">

    <!-- PART A: Awareness Generation in Government Schemes -->
    <awareness_generation>
        <title>Awareness Generation in Government Schemes</title>
        
        <section name="What is Awareness Generation?">
            <definition>
                Awareness Generation includes activities that inform citizens about their rights and entitlements, available government schemes, and how to access and benefit from them.
            </definition>
            <mobilization_methods>
                <method>Announcements in schools and Gram Sabhas</method>
                <method>Posters, wall paintings, street plays</method>
                <method>IEC (Information, Education, and Communication) vans</method>
                <method>Camps and rallies</method>
            </mobilization_methods>
        </section>

        <section name="Why Should Sarpanches Focus on Awareness?">
            <importance>
                <point>Increases scheme uptake, especially among women, youth, and vulnerable groups.</point>
                <point>Prevents exclusion due to lack of information.</point>
                <point>Builds community trust in Panchayat leadership.</point>
                <point>Positions Sarpanch as a local changemaker and informed facilitator.</point>
            </importance>
        </section>

        <section name="How Can Sarpanches Promote Awareness?">
            <how_to_guide>
                <step number="1">
                    <action>Understand Scheme Guidelines</action>
                    <details>Get circulars from Block Office or department portals.</details>
                </step>
                <step number="2">
                    <action>Mobilize the Community</action>
                    <details>Involve ASHAs, SHG leaders, teachers, Sahiyas, etc.</details>
                </step>
                <step number="3">
                    <action>Request IEC Support</action>
                    <details>Write to departments for banners, flyers, vans, etc.</details>
                </step>
                <step number="4">
                    <action>Organize Events</action>
                    <details>Set up camps with CDPOs, Legal Services, BDO support.</details>
                </step>
                <step number="5">
                    <action>Track and Report</action>
                    <details>Maintain attendance, photos, feedback; share with Block.</details>
                </step>
            </how_to_guide>
        </section>

        <section name="Scheme-wise Awareness Components">
            <scheme_awareness>
                <scheme name="Savitribai Phule Kishori Samriddhi Yojana (SPKSY)">
                    <objective>Promote education, delay child marriage.</objective>
                    <rationale>Empower adolescent girls.</rationale>
                    <sarpanch_role>Announce in schools, register girls.</sarpanch_role>
                </scheme>
                <scheme name="Beti Bachao Beti Padhao (BBBP)">
                    <objective>Gender equality, girl education.</objective>
                    <rationale>Improve sex ratio, education rates.</rationale>
                    <sarpanch_role>Use posters, plays, SHG events.</sarpanch_role>
                </scheme>
                <scheme name="Mukhyamantri Maiya Samman Yojana">
                    <objective>Menstrual hygiene, maternal care.</objective>
                    <rationale>Reduce dropouts, improve health.</rationale>
                    <sarpanch_role>Women's camps, Aadhaar seeding.</sarpanch_role>
                </scheme>
                <scheme name="JHALSA Legal Awareness Camps">
                    <objective>Legal rights, anti-witch hunting.</objective>
                    <rationale>Protect vulnerable women, children.</rationale>
                    <sarpanch_role>Host legal camps at Panchayat Bhawan.</sarpanch_role>
                </scheme>
                <scheme name="Swachh Vidyalaya Puraskar">
                    <objective>School sanitation.</objective>
                    <rationale>Improve WASH, reduce disease.</rationale>
                    <sarpanch_role>Motivate schools to apply, rally support.</sarpanch_role>
                </scheme>
                <scheme name="Aapki Sarkar – Aapke Dwar">
                    <objective>General scheme awareness.</objective>
                    <rationale>Maximize reach of services.</rationale>
                    <sarpanch_role>Host camps, guide community registrations.</sarpanch_role>
                </scheme>
                <scheme name="DAY-NULM & SHG Mobilization">
                    <objective>Women’s livelihoods.</objective>
                    <rationale>Strengthen rural economy.</rationale>
                    <sarpanch_role>Identify eligible women, link to ULB.</sarpanch_role>
                </scheme>
            </scheme_awareness>
        </section>
    </awareness_generation>

    <!-- PART B: Scheme Convergence for Impact -->
    <scheme_convergence>
        <title>Scheme Convergence for Impact</title>
        
        <section name="What is Convergence?">
            <definition>
                Convergence means combining multiple schemes and resources to solve local issues more effectively. It brings together funds, infrastructure, training, and manpower across departments.
            </definition>
        </section>

        <section name="Why is Convergence Important?">
            <importance>
                <point>It avoids duplication of efforts.</point>
                <point>Maximizes impact using limited resources.</point>
                <point>Builds integrated solutions for complex local problems.</point>
                <point>Enhances ownership through joint planning with community and departments.</point>
            </importance>
        </section>

        <section name="How Can Sarpanches Enable Convergence?">
            <how_to_guide>
                <step number="1">
                    <action>Hold a Convergence Planning Meeting</action>
                    <details>Involve JSLPS, GRS, BDOs, Education, Health, Agri officials.</details>
                </step>
                <step number="2">
                    <action>Identify Needs & Beneficiaries</action>
                    <details>Use Gram Sabha for inputs; shortlist SHGs, youth, farmers.</details>
                </step>
                <step number="3">
                    <action>Submit Joint Proposals</action>
                    <details>Submit integrated plan on MNREGA portal with help from GRS.</details>
                </step>
                <step number="4">
                    <action>Mobilize Resources</action>
                    <details>Request saplings, IEC kits, funds, etc. from line departments.</details>
                </step>
                <step number="5">
                    <action>Monitor Implementation</action>
                    <details>Visit sites, take photos, track progress.</details>
                </step>
                 <step number="6">
                    <action>Document Impact</action>
                    <details>Capture success stories, before-after evidence, submit to Block.</details>
                </step>
            </how_to_guide>
        </section>

        <section name="Convergence Examples in Health & Education">
            <convergence_examples category="Health & Education">
                <initiative name="Jan Arogya Samiti (JAS)">
                    <schemes_merged>PRI + Health Dept + GRAAM</schemes_merged>
                    <rationale>Local health committees.</rationale>
                    <sarpanch_role>Nominate members, host health days.</sarpanch_role>
                </initiative>
                <initiative name="Poshan Abhiyaan">
                    <schemes_merged>ICDS + Education + WCD</schemes_merged>
                    <rationale>Malnutrition, WASH.</rationale>
                    <sarpanch_role>Cooking demos, Ratri Chaupal, VHSND.</sarpanch_role>
                </initiative>
                <initiative name="Anti-Drug Campaign">
                    <schemes_merged>Health + Police + SWD</schemes_merged>
                    <rationale>Youth addiction crisis.</rationale>
                    <sarpanch_role>Link youth to online help, host rallies.</sarpanch_role>
                </initiative>
                <initiative name="Project Gyanodaya">
                    <schemes_merged>ICT + Education Dept</schemes_merged>
                    <rationale>Digital learning access.</rationale>
                    <sarpanch_role>Support smart class setup, increase attendance.</sarpanch_role>
                </initiative>
                <initiative name="Swachh Vidyalaya + MGNREGA">
                    <schemes_merged>Education + MNREGA + FC Grants</schemes_merged>
                    <rationale>School WASH infra.</rationale>
                    <sarpanch_role>Apply, supervise WASH activities.</sarpanch_role>
                </initiative>
            </convergence_examples>
        </section>

        <section name="Additional Livelihood & Infra Convergence Areas">
            <convergence_examples category="Livelihood & Infrastructure">
                <area name="Orchards/Natural Farming">
                    <schemes_combined>MGNREGA + Horticulture + NABARD</schemes_combined>
                    <sarpanch_role>Identify land, demand saplings, support worksite.</sarpanch_role>
                </area>
                <area name="WASH in Schools">
                    <schemes_combined>MGNREGA + SVP + Education</schemes_combined>
                    <sarpanch_role>Link schools to fund pool, engage SHGs.</sarpanch_role>
                </area>
                <area name="Poultry/Goatery">
                    <schemes_combined>MGNREGA + Livestock + Bank Credit</schemes_combined>
                    <sarpanch_role>Promote SHG applications, follow up for grants.</sarpanch_role>
                </area>
                <area name="Youth Skilling">
                    <schemes_combined>JSDMS + DAY-NULM + Education</schemes_combined>
                    <sarpanch_role>Nominate youth, ensure documentation.</sarpanch_role>
                </area>
                <area name="Community Ponds">
                    <schemes_combined>MGNREGA + Fisheries + JSLPS</schemes_combined>
                    <sarpanch_role>Align construction with fishery inputs.</sarpanch_role>
                </area>
            </convergence_examples>
        </section>
        
        <visual_model name="Convergence to Outcomes">
            <process>
                <stage name="Start">Community Needs Identified (by Panchayat, SHGs, JSLPS)</stage>
                <stage name="Planning">Joint Planning (MGNREGA + Depts + DMF + NGOs)</stage>
                <stage name="Mobilization">
                    <title>Resource Mobilization</title>
                    <resource from="MGNREGA">Wage Support</resource>
                    <resource from="Departments">Materials & IEC</resource>
                    <resource from="NABARD">Credit</resource>
                    <resource from="DMF">Infra & Training</resource>
                </stage>
                <stage name="Creation">Asset Creation (ponds, smart classrooms, orchards)</stage>
                <stage name="Support">Livelihood Support (farming, poultry, skilling)</stage>
                <stage name="Capacity">Capacity Building (FPOs, SHGs, market linkage)</stage>
                <stage name="Outcomes">
                    <outcome>Women Empowerment</outcome>
                    <outcome>Income Diversification</outcome>
                    <outcome>Infrastructure in Mining Areas</outcome>
                    <outcome>Health, Education & Climate Resilience</outcome>
                </stage>
            </process>
        </visual_model>

    </scheme_convergence>

    <tools_for_sarpanches>
        <checklists>
            <checklist for="Awareness Events">
                <item>Inform CDPO/Legal Services</item>
                <item>Fix date and venue</item>
                <item>Prepare list of beneficiaries</item>
                <item>Display IEC materials</item>
                <item>Record attendance/photos</item>
                <item>Collect community feedback</item>
            </checklist>
            <checklist for="Convergence Planning">
                <item>Identify top priorities (water, livelihoods, dropout, etc.)</item>
                <item>Match suitable schemes</item>
                <item>Coordinate with GRS, JSLPS, and line departments</item>
                <item>Track fund flows on department dashboards</item>
                <item>Share impact stories for replication</item>
            </checklist>
        </checklists>
        
        <smart_tips>
            <tip>Use Gram Sabha for community buy-in.</tip>
            <tip>Form a Village Convergence Committee (SHG, ASHA, Sahiya, teacher).</tip>
            <tip>Regularly visit nrega.nic.in, jslps.in, Aapki Yojana dashboards.</tip>
            <tip>Ask for Block-level training on convergence and IEC.</tip>
            <tip>Maintain a register of beneficiaries across schemes.</tip>
        </smart_tips>
    </tools_for_sarpanches>

    <!-- PART C: Schemes, Programmes, and Fund Mapping -->
    <scheme_catalogue>
        <title>Schemes, Programmes, and Fund Mapping</title>
        
        <!-- Section for Central/Flagship Schemes -->
        <central_schemes>
            <scheme id="1">
                <name>Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS)</name>
                <gpdp_activities>Wage employment, creation of durable community and individual assets, social forestry, water conservation, rural development works, poverty reduction.</gpdp_activities>
                <line_department>
                    <central>Ministry of Rural Development, GoI</central>
                    <state>Rural Development Department, GoJ</state>
                </line_department>
                <procedure_for_gp>
                    <step number="1"><title>Needs Assessment & Planning</title><description>Conduct Participatory Rural Appraisal (PRA) to identify local needs. Prepare Annual Labor Budget and shelf of projects (water conservation, irrigation, roads, land development) with estimated person-days. Integrate into GPDP and get Gram Sabha approval. Forward to Block Programme Officer (BPO) for administrative & technical sanction.</description></step>
                    <step number="2"><title>Job Card & Work Allotment</title><description>Receive and verify applications for job cards; issue job cards within 15 days. Maintain work demand register. Allot work within 15 days of demand, ensuring at least one-third women participation.</description></step>
                    <step number="3"><title>Implementation & Supervision</title><description>Ensure worksite facilities (shade, water, first aid). Oversee quality of work as per technical estimates. Facilitate timely measurement of work and prepare Muster Rolls/Wage Sheets. Ensure direct wage payment to bank/post office accounts.</description></step>
                    <step number="4"><title>Transparency & Monitoring</title><description>Display scheme information (sanctioned works, wages) at Panchayat Bhawan and worksites. Conduct regular Gram Sabha meetings for social audit, review muster rolls, and address worker grievances. Submit physical & financial progress reports.</description></step>
                </procedure_for_gp>
            </scheme>
            <scheme id="2">
                <name>Pradhan Mantri Awaas Yojana (Gramin) (PMAY-G)</name>
                <gpdp_activities>Beneficiary identification, facilitating house construction, ensuring access to materials and skilled masons, convergence with other schemes for beneficiaries.</gpdp_activities>
                <line_department>
                    <central>Ministry of Rural Development, GoI</central>
                    <state>Rural Development Department, GoJ</state>
                </line_department>
                <procedure_for_gp>
                    <step number="1"><title>Beneficiary Identification & Verification</title><description>Receive the SECC 2011 data list. Conduct multiple, well-publicized Gram Sabha meetings to read out the list, verify eligibility based on exclusion criteria, allow for inclusion of genuine missing households, and prioritize eligible beneficiaries. Ensure video recording of Gram Sabhas.</description></step>
                    <step number="2"><title>Technical & Financial Facilitation</title><description>Assist beneficiaries in accessing their first installment upon geo-tagging. Link beneficiaries to masons for training and support in construction. Facilitate access to construction materials.</description></step>
                    <step number="3"><title>Convergence & Monitoring</title><description>Ensure construction of IHHL (Individual Household Latrine) under SBM-G for each PMAY-G house. Monitor construction progress through stage-wise geo-tagging. Address grievances related to fund release or construction quality.</description></step>
                    <step number="4"><title>Completion</title><description>Verify and certify completion of houses for final installment release.</description></step>
                </procedure_for_gp>
            </scheme>
            <scheme id="3">
                <name>Deen Dayal Antyodaya Yojana - National Rural Livelihood Mission (DAY-NRLM)</name>
                <gpdp_activities>Mobilizing rural poor households into Self-Help Groups (SHGs) and their federations, financial and livelihood support, promoting diversified livelihoods, economic activities of SHGs.</gpdp_activities>
                <line_department>
                    <central>Ministry of Rural Development, GoI</central>
                    <state>Jharkhand State Livelihood Promotion Society (JSLPS) under Rural Development Dept., GoJ</state>
                </line_department>
                <procedure_for_gp>
                    <step number="1"><title>Social Mobilization</title><description>Identify and motivate poor and vulnerable women for SHG formation. Facilitate regular weekly meetings, thrift & credit, and record-keeping within SHGs. Support formation of Village Organizations (VOs) and Cluster Level Federations (CLFs).</description></step>
                    <step number="2"><title>Capacity Building & Linkages</title><description>Facilitate basic training for SHG members. Link SHGs to JSLPS resources for Revolving Fund (RF) and Community Investment Fund (CIF). Facilitate bank linkage for SHGs to access credit.</description></step>
                    <step number="3"><title>Livelihood Planning</title><description>Support SHGs in developing micro-livelihood plans based on local resources, skills, and market demand (e.g., agriculture, livestock, non-farm enterprises).</description></step>
                    <step number="4"><title>Integration & Monitoring</title><description>Ensure SHG plans are integrated into the GPDP. Monitor the progress of SHG livelihood activities and their contribution to household income. Ensure representation of SHG members in Gram Sabha.</description></step>
                </procedure_for_gp>
            </scheme>
            <!-- ... Other central schemes from 4 to 41 would be structured similarly ... -->
        </central_schemes>

        <!-- Section for Jharkhand State-Specific Schemes -->
        <state_schemes>
            <scheme id="42">
                <name>Mukhyamantri Krishi Ashirwad Yojana</name>
                <gpdp_activities>Financial assistance to farmers for purchasing seeds, fertilizers, and other essential agricultural inputs; enhancing agricultural productivity and income.</gpdp_activities>
                <line_department>
                    <state>Department of Agriculture, Animal Husbandry & Co-operative, GoJ</state>
                </line_department>
                <procedure_for_gp>
                    <step number="1"><title>Farmer Identification & Verification</title><description>Disseminate scheme details (eligibility, benefits) widely among farmers. Assist farmers in ensuring their land records are updated and linked with Aadhaar. Facilitate verification of eligible farmers through Gram Sabha or designated committees.</description></step>
                    <step number="2"><title>Application & DBT Facilitation</title><description>Guide farmers on the online/offline application process. Ensure farmers' bank accounts are KYC compliant and linked for Direct Benefit Transfer (DBT). Address initial queries or issues in application submission.</description></step>
                    <step number="3"><title>Awareness & Impact Monitoring</title><description>Organize farmer meetings to raise awareness about the scheme. Collect feedback from farmers on the impact of the assistance on their agricultural productivity and input procurement.</description></step>
                </procedure_for_gp>
            </scheme>
             <scheme id="52">
                <name>Birsa Harit Gram Yojana (BHGY)</name>
                <gpdp_activities>Promoting extensive tree plantation and horticulture activities, often converged with MGNREGS, for green initiatives and rural employment.</gpdp_activities>
                <line_department>
                    <state>Rural Development Department, GoJ / Department of Forests, Environment & Climate Change, GoJ</state>
                </line_department>
                <procedure_for_gp>
                    <step number="1"><title>Land & Beneficiary Identification</title><description>Identify suitable private land (owned by MGNREGS job card holders) or community land for fruit-bearing tree plantation. Select willing MGNREGS job card holding families through Gram Sabha.</description></step>
                    <step number="2"><title>Converged Planning & Implementation</title><description>Prepare detailed micro-plans for each orchard, specifying species and maintenance schedule. Integrate labor components (pit digging, planting, watering, weeding, fencing) as MGNREGS works. Coordinate with Forest/Horticulture Dept. for quality saplings.</description></step>
                    <step number="3"><title>Long-term Nurturing & Benefit Sharing</title><description>Ensure beneficiaries are trained in orchard management. Monitor tree survival and growth. Facilitate resolution of any issues regarding usufruct rights (fruit produce) for the beneficiary family.</description></step>
                    <step number="4"><title>Reporting</title><description>Submit progress reports on plantation area, tree survival rates, and MGNREGS person-days generated.</description></step>
                </procedure_for_gp>
            </scheme>
            <scheme id="55">
                <name>Phulo Jhano Aashirvad Yojna</name>
                <gpdp_activities>Empowering women, particularly those involved in traditional liquor making, by providing alternative livelihood opportunities and de-addiction support.</gpdp_activities>
                <line_department>
                    <state>Department of Women, Child Development & Social Security, GoJ / Jharkhand State Livelihood Promotion Society (JSLPS), GoJ</state>
                </line_department>
                <procedure_for_gp>
                    <step number="1"><title>Identification & Outreach</title><description>Identify women engaged in traditional liquor making through community engagement and local surveys. Conduct sensitive outreach and counseling to understand their needs and readiness for change.</description></step>
                    <step number="2"><title>Mobilization & Skill Development</title><description>Facilitate their integration into existing SHGs or form new ones. Link them with skill development programs (e.g., tailoring, mushroom cultivation, livestock rearing) through JSLPS.</description></step>
                    <step number="3"><title>Livelihood & Market Linkage</title><description>Assist in accessing initial capital (revolving fund, bank loans) for new livelihood activities. Help in connecting their new products to markets.</description></step>
                    <step number="4"><title>Social Support & Monitoring</title><description>Provide ongoing social and psychological support to aid de-addiction. Monitor their progress in new livelihoods and overall well-being.</description></step>
                </procedure_for_gp>
            </scheme>
            <!-- ... Other state schemes from 43 to 59 would be structured similarly ... -->
        </state_schemes>
    </scheme_catalogue>

</knowledge_base>

`
    };
    
    return prompts[language];
  }

  async sendMessage(message: string, language: Language, conversationHistory: OpenAIMessage[] = []): Promise<string> {
    try {
      // Detect the language of the input message
      const inputLanguage = this.detectLanguage(message);
      
      // Check if the message might need web search
      const needsWebSearch = this.shouldPerformWebSearch(message);
      
      let enhancedMessage = message;
      if (needsWebSearch) {
        const searchResults = await this.performWebSearch(message, inputLanguage);
        enhancedMessage = `${message}\n\nWeb search results:\n${searchResults}`;
      }

      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(language, inputLanguage)
        },
        ...conversationHistory,
        {
          role: 'user',
          content: enhancedMessage
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: ENV.DEFAULT_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return this.formatResponse(data.choices[0].message.content, inputLanguage);
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      
      // Return language-specific error messages
      const errorMessages = {
        hindi: "क्षमा करें, मैं अभी आपके अनुरोध को संसाधित नहीं कर सका। कृपया बाद में पुनः प्रयास करें या अपना इंटरनेट कनेक्शन जांचें।",
        hinglish: "Sorry, mai abhi aapka request process nahi kar paya. Kripya baad mein try kariye ya apna internet connection check kariye."
      };
      
      return errorMessages[language];
    }
  }

  private shouldPerformWebSearch(message: string): boolean {
    const searchKeywords = [
      // Hindi keywords
      'योजना', 'नीति', 'सरकारी', 'आवेदन', 'फॉर्म', 'दस्तावेज', 'परिपत्र', 'नियम',
      'केंद्र सरकार', 'राज्य सरकार', 'मुख्यमंत्री', 'प्रधानमंत्री', 'विभाग',
      // Hinglish keywords
      'scheme', 'policy', 'government', 'application', 'form', 'document', 'circular',
      'rules', 'center', 'state', 'ministry', 'department', 'pm', 'cm', 'latest',
      'new', 'update', 'current', 'website', 'portal', 'online'
    ];
    
    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  }

  private async performWebSearch(query: string, language: 'hindi' | 'hinglish'): Promise<string> {
    try {
      // Enhance search query for government-specific results
      const enhancedQuery = language === 'hindi' 
        ? `${query} site:gov.in OR site:nic.in सरकारी योजना`
        : `${query} site:gov.in OR site:nic.in government scheme`;

      // Using Brave Search API (free alternative) or you can use Google Custom Search
      const searchResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(enhancedQuery)}&count=5`, {
        headers: {
          'X-Subscription-Token': 'BSA_API_KEY' // You'll need to get this from Brave Search API
        }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        return this.formatSearchResults(searchData.web?.results || [], language);
      }
    } catch (error) {
      console.error('Web search error:', error);
    }

    // Fallback: provide common government websites
    return this.getFallbackGovernmentLinks(language);
  }

  private formatSearchResults(results: any[], language: 'hindi' | 'hinglish'): string {
    if (!results.length) return this.getFallbackGovernmentLinks(language);

    const formattedResults = results.slice(0, 3).map((result, index) => {
      return `${index + 1}. ${result.title}\n   ${result.url}\n   ${result.description || ''}`;
    }).join('\n\n');

    const header = language === 'hindi' 
      ? 'संबंधित वेब खोज परिणाम:' 
      : 'Related web search results:';
    
    return `${header}\n\n${formattedResults}`;
  }

  private getFallbackGovernmentLinks(language: 'hindi' | 'hinglish'): string {
    const links = language === 'hindi' ? {
      header: 'उपयोगी सरकारी वेबसाइट्स:',
      sites: [
        '1. भारत सरकार पोर्टल: https://www.india.gov.in',
        '2. डिजिटल इंडिया: https://digitalindia.gov.in',
        '3. ई-गवर्नेंस पोर्टल: https://www.egovonline.net',
        '4. प्रधानमंत्री योजनाएं: https://www.pmindiaschemes.com',
        '5. राष्ट्रीय सूचना विज्ञान केंद्र: https://www.nic.in'
      ]
    } : {
      header: 'Useful Government Websites:',
      sites: [
        '1. Government of India Portal: https://www.india.gov.in',
        '2. Digital India: https://digitalindia.gov.in',
        '3. E-Governance Portal: https://www.egovonline.net',
        '4. PM India Schemes: https://www.pmindiaschemes.com',
        '5. National Informatics Centre: https://www.nic.in'
      ]
    };

    return `${links.header}\n\n${links.sites.join('\n')}`;
  }

  private formatResponse(response: string, inputLanguage: 'hindi' | 'hinglish'): string {
    // Format the response with better spacing and structure
    return response
      .replace(/\n\n+/g, '\n\n')  // Remove excessive line breaks
      .replace(/\*\*(.*?)\*\*/g, '**$1**')  // Ensure bold formatting
      .trim();
  }
}

export const openAIService = new OpenAIService(); 