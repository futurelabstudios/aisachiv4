import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Language } from "@/types";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const getTitle = () => {
    switch (language) {
      case 'hindi':
        return 'एआई सचिव';
      case 'hinglish':
        return 'AI Sachiv';
      default:
        return 'AI Sachiv';
    }
  };

  const languages = [
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'हिंदी' },
    { id: 'hinglish', label: 'Hinglish' }
  ];

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-sachiv-primary/10 to-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-sachiv-primary">
          {getTitle()}
        </h1>
        <span className="text-sm text-sachiv-gray">
          {language === 'english' ? 'Your Gram Panchayat Assistant' : 
           language === 'hindi' ? 'आपका ग्राम पंचायत सहायक' : 
           'Aapka Gram Panchayat Sahayak'}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            className="px-4 py-2 rounded-lg border border-sachiv-primary text-sachiv-primary hover:bg-sachiv-primary/10 flex items-center gap-2 transition-colors duration-200"
          >
            <span className="hidden sm:inline">
              {language === 'english' ? 'Language' : language === 'hindi' ? 'भाषा' : 'Bhasha'}
            </span>
            <span className="sm:hidden">
              {language === 'english' ? 'EN' : language === 'hindi' ? 'हिं' : 'HI'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.id}
              onClick={() => onLanguageChange(lang.id as Language)}
              className={`cursor-pointer flex items-center gap-2 ${
                language === lang.id ? 'bg-sachiv-primary/10 text-sachiv-primary' : ''
              }`}
            >
              <span className="text-sm">{lang.label}</span>
              {language === lang.id && (
                <span className="ml-auto text-xs text-sachiv-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
