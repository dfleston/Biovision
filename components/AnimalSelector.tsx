import React from 'react';
import { Animal } from '../types';
import { Check, ChevronDown } from 'lucide-react';

interface AnimalSelectorProps {
  label: string;
  selectedAnimal: Animal;
  animals: Animal[];
  onSelect: (animal: Animal) => void;
  disabled?: boolean;
}

export const AnimalSelector: React.FC<AnimalSelectorProps> = ({
  label,
  selectedAnimal,
  animals,
  onSelect,
  disabled
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedAnimal.emoji}</span>
          <div className="text-left">
            <div className="font-semibold text-white">{selectedAnimal.name}</div>
            <div className="text-xs text-slate-400 italic">{selectedAnimal.scientificName}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 ring-1 ring-black/5">
          <div className="p-2 grid grid-cols-1 gap-1">
            {animals.map((animal) => (
              <button
                key={animal.id}
                onClick={() => {
                  onSelect(animal);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  selectedAnimal.id === animal.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{animal.emoji}</span>
                  <span className="font-medium">{animal.name}</span>
                </div>
                {selectedAnimal.id === animal.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};