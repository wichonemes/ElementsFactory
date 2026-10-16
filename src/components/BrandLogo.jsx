import React from 'react';

/**
 * BrandLogo — Logotipo Oficial Vectorial de Artesano Digital
 * Utiliza los trazos e identidad oficial (.svg) con soporte para fondos claros y oscuros.
 */
export default function BrandLogo({ 
  className = '', 
  showTagline = false, 
  light = false,
  iconOnly = false 
}) {
  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/brand/artesano_isotipo_transparente.png"
          alt="Artesano Digital"
          className="h-9 w-auto object-contain drop-shadow-sm"
          loading="eager"
        />
      </div>
    );
  }

  const logoSrc = light
    ? '/brand/artesano_digital_color_whitetext.svg'
    : '/brand/artesano_digital_color_darktext.svg';

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center">
        <img
          src={logoSrc}
          alt="Artesano Digital"
          className="h-8 sm:h-9 w-auto object-contain max-w-[210px]"
          loading="eager"
        />
      </div>
      {showTagline && (
        <span 
          className={`text-[9.5px] sm:text-[10px] tracking-wider font-semibold pl-0.5 mt-0.5 transition-colors ${
            light ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Si lo piensas, se hace.
        </span>
      )}
    </div>
  );
}
