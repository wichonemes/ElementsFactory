import React from 'react';
import { Filter, X, Box, Flame, Layers, Wand2, Sparkles, SlidersHorizontal, Printer } from 'lucide-react';

export default function FiltersBar({
  activeWorld,
  onSelectWorld,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedTechnique,
  onSelectTechnique,
  totalResults,
  onResetFilters,
  viewMode = 'catalog',
  onToggleViewMode,
  promosCount = 0
}) {
  const techniques = [
    { id: 'all', label: 'Todas las técnicas' },
    { id: '3d', label: 'Impresión 3D', icon: Box },
    { id: 'laser', label: 'Corte Láser', icon: Flame },
    { id: 'sublimation', label: 'Sublimación', icon: Layers },
    { id: 'vinyl', label: 'Vinil & Textil', icon: Wand2 },
    { id: 'print', label: 'Impresión & Papelería', icon: Printer },
    { id: 'nfc', label: 'Soluciones NFC', icon: Sparkles }
  ];

  // Filter categories by active world if one is selected
  const visibleCategories = categories.filter(c => {
    if (activeWorld === 'all') return true;
    return c.worldId === activeWorld;
  });

  const hasActiveFilters = activeWorld !== 'all' || selectedCategory !== 'all' || selectedTechnique !== 'all';

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#E8E4DA] sticky top-[56px] md:top-[116px] z-30 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        
        {/* Row 1: Technique Filter Chips & Mode Switcher */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          
          {/* Techniques */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Técnica:
            </span>
            {techniques.map(tech => {
              const isSelected = selectedTechnique === tech.id;
              const Icon = tech.icon;
              return (
                <button
                  key={tech.id}
                  onClick={() => onSelectTechnique(tech.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2D4F3E] text-white shadow-xs'
                      : 'bg-[#F4F0E8] text-gray-700 hover:bg-[#EBE5D9]'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{tech.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: Results Count & Reset */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <span className="text-xs text-gray-500 font-medium">
              {totalResults} {totalResults === 1 ? 'producto' : 'productos'}
            </span>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs text-[#D82B6E] hover:underline font-semibold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
          </div>

        </div>

        {/* Row 2: Subcategories (when available for current scope) */}
        {visibleCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium shrink-0 mr-1">
              Subcategorías:
            </span>
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {visibleCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#2D4F3E] text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                  {cat.productCount > 0 && (
                    <span className="ml-1 opacity-70 text-[10px]">({cat.productCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
