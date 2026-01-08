
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button'; // Adjust based on actual button path
import { cn } from '../../lib/utils';

export const LanguageSwitcher = ({ className }: { className?: string }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const currentLang = i18n.language.split('-')[0];
        const newLang = currentLang === 'en' ? 'pt' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className={cn("text-xs font-semibold gap-2", className)}
        >
            <span className={i18n.language.startsWith('en') ? "font-bold" : "opacity-50"}>EN</span>
            <span className="opacity-30">|</span>
            <span className={i18n.language.startsWith('pt') ? "font-bold" : "opacity-50"}>PT</span>
        </Button>
    );
};
