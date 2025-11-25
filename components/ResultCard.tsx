import React from 'react';
import { VisionPerspective, Animal } from '../types';
import { Eye, Activity, RefreshCw, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface ResultCardProps {
  observer: Animal;
  subject: Animal;
  perspective: VisionPerspective;
  onRetryImage?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  observer,
  subject,
  perspective,
  onRetryImage
}) => {
  const [imageError, setImageError] = React.useState(false);

  // If the image URL updates, reset error state
  React.useEffect(() => {
    if (perspective.imageUrl) {
      setImageError(false);
    }
  }, [perspective.imageUrl]);

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-full shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
        <div className="flex -space-x-2">
          <span className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-slate-800 z-10" title={`Observer: ${observer.name}`}>
            {observer.emoji}
          </span>
          <span className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-slate-800 z-0 grayscale opacity-70" title={`Subject: ${subject.name}`}>
            {subject.emoji}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {observer.name}'s POV
          </h3>
          <p className="text-xs text-indigo-400 font-medium">Observing {subject.name}</p>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative aspect-video bg-black/40 w-full group">
        {perspective.isLoadingImage ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-indigo-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium animate-pulse">Simulating Visual Cortex...</span>
          </div>
        ) : perspective.imageUrl && !imageError ? (
          <img
            src={perspective.imageUrl}
            alt={`${observer.name} view of ${subject.name}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-slate-500 p-6 text-center">
            {imageError ? (
              <>
                 <AlertTriangle className="w-10 h-10 text-amber-500" />
                 <p className="text-sm">Could not generate visualization due to safety filters or network error.</p>
                 {onRetryImage && (
                    <button onClick={onRetryImage} className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                      Try Again
                    </button>
                 )}
              </>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 opacity-50" />
                <p className="text-sm">Image pending generation...</p>
              </>
            )}
          </div>
        )}
        
        {/* Overlay Badges - Hidden on mobile */}
        <div className="absolute bottom-3 left-3 hidden sm:flex flex-wrap gap-2">
           {perspective.visualFeatures.slice(0, 3).map((feat, i) => (
             <span key={i} className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wide border border-white/10">
               {feat}
             </span>
           ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Scientific Basis</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {perspective.scientificDescription}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-700/50">
           <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Visual Features</span>
          </div>
          <div className="flex flex-wrap gap-2">
             {perspective.visualFeatures.map((feat, i) => (
               <span key={i} className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                 {feat}
               </span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};