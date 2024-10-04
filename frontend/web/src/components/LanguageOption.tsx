'use client'

import { FC, useState } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LanguageOption: FC = () => {
  // Initialize the default language
  const [language, setLanguage] = useState('English');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);  // Update the state based on selection
  };

  return (
    <Select onValueChange={handleLanguageChange} value={language}>
      <SelectTrigger className="w-auto">
        <div className="flex justify-center items-center h-full gap-2">
          <Image
            src={language === 'English' ? '/images/flag-en.png' : '/images/flag-mr.png'}
            alt={language}
            width={17}
            height={17}
          />
          <span className="text-sm">{language}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="English">
          <div className="flex justify-center items-center h-full gap-2">
            <Image src="/images/flag-en.png" alt="English" width={17} height={17} />
            <span className="text-sm">English</span>
          </div>
        </SelectItem>
        <SelectItem value="Maori">
          <div className="flex justify-center items-center h-full gap-2">
            <Image src="/images/flag-mr.png" alt="Maori" width={17} height={17} />
            <span className="text-sm">Maori</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageOption;