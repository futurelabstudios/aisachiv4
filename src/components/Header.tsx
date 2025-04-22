
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Language } from "@/types";

interface HeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-sachiv-primary">
          {language === 'english' ? 'AI Sachiv' : 'एआई सचिव'}
        </h1>
      </div>
      <div>
        <Button 
          onClick={() => onLanguageChange(language === 'english' ? 'hindi' : 'english')}
          variant="outline"
          className="px-4 py-2 rounded-lg border border-sachiv-primary text-sachiv-primary hover:bg-sachiv-primary/10"
        >
          {language === 'english' ? 'हिंदी' : 'English'}
        </Button>
      </div>
    </header>
  );
}
