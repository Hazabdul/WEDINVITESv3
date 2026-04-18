import React from 'react';
import { ClassicTemplate, FloralTemplate, ModernTemplate, ArabicTemplate, TraditionalTemplate } from '../templates/AllTemplates';
import { cn } from '../../utils/cn';

const templates = {
  classic: ClassicTemplate,
  floral: FloralTemplate,
  modern: ModernTemplate,
  minimal: ModernTemplate,
  arabic: ArabicTemplate,
  traditional: TraditionalTemplate,
};

export function TemplateRenderer({ type, data, className = "" }) {
  if (!data) return null;
  const SelectedTemplate = templates[type] || ClassicTemplate;
  const { theme } = data;
  
  const bgClass = theme.backgroundStyle === 'pattern' 
    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]' 
    : theme.backgroundStyle === 'solid' ? 'bg-white' : '';

  return (
    <div 
      className={cn("overflow-hidden w-full transition-all duration-500", bgClass, className)}
      style={{ 
        fontFamily: theme.font || 'serif',
      }}
    >
      <SelectedTemplate data={data} />
    </div>
  );
}
