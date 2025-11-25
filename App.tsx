import React, { useState, useCallback, useEffect } from 'react';
import { ANIMALS, TEXT_MODELS, IMAGE_MODELS } from './constants';
import { Animal, SimulationResult, VisionPerspective, AppSettings } from './types';
import { AnimalSelector } from './components/AnimalSelector';
import { ResultCard } from './components/ResultCard';
import { SettingsModal } from './components/SettingsModal';
import { getScientificVisionDetails, generatePOVImage } from './services/gemini';
import { Sparkles, ArrowRightLeft, Info, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [animalA, setAnimalA] = useState<Animal>(ANIMALS[1]); // Default Dog
  const [animalB, setAnimalB] = useState<Animal>(ANIMALS[4]); // Default Fly
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    textModel: TEXT_MODELS[0].id,
    imageModel: IMAGE_MODELS[0].id
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('biovision_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('biovision_settings', JSON.stringify(newSettings));
  };

  const handleSimulate = async () => {
    if (animalA.id === animalB.id) {
      setError("Please select two different animals for comparison.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    const config = {
      apiKey: settings.apiKey,
      model: settings.textModel
    };
    
    const imageConfig = {
      apiKey: settings.apiKey,
      model: settings.imageModel
    };

    try {
      // Step 1: Get Descriptions and Prompts
      const details = await getScientificVisionDetails(animalA.name, animalB.name, config);

      // Initialize result structure with loading state for images
      const initialPerspectiveA: VisionPerspective = {
        ...details.perspectiveA,
        isLoadingImage: true
      };
      
      const initialPerspectiveB: VisionPerspective = {
        ...details.perspectiveB,
        isLoadingImage: true
      };

      setResult({
        animalA,
        animalB,
        perspectiveA: initialPerspectiveA,
        perspectiveB: initialPerspectiveB
      });

      // Step 2: Generate Images in parallel
      const p1 = generatePOVImage(details.perspectiveA.imagePrompt, imageConfig)
        .then(url => {
          setResult(prev => prev ? ({
            ...prev,
            perspectiveA: { ...prev.perspectiveA, imageUrl: url, isLoadingImage: false }
          }) : null);
        })
        .catch((err) => {
             console.error("Image A generation failed", err);
             setResult(prev => prev ? ({
            ...prev,
            perspectiveA: { ...prev.perspectiveA, isLoadingImage: false }
          }) : null);
        });

      const p2 = generatePOVImage(details.perspectiveB.imagePrompt, imageConfig)
        .then(url => {
          setResult(prev => prev ? ({
            ...prev,
            perspectiveB: { ...prev.perspectiveB, imageUrl: url, isLoadingImage: false }
          }) : null);
        })
        .catch((err) => {
            console.error("Image B generation failed", err);
            setResult(prev => prev ? ({
            ...prev,
            perspectiveB: { ...prev.perspectiveB, isLoadingImage: false }
          }) : null);
        });

      await Promise.allSettled([p1, p2]);

    } catch (e: any) {
      setError(e.message || "Failed to generate simulation. Check your API key or network connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwap = () => {
    const temp = animalA;
    setAnimalA(animalB);
    setAnimalB(temp);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <EyeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Bio<span className="text-indigo-400">Vision</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
               title="Settings"
             >
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Controls Section */}
        <section className="bg-slate-800/30 rounded-3xl p-6 border border-white/5 shadow-xl">
           <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
              <div className="flex-1 w-full">
                <AnimalSelector 
                  label="Observer A" 
                  selectedAnimal={animalA} 
                  animals={ANIMALS} 
                  onSelect={setAnimalA} 
                  disabled={isGenerating}
                />
              </div>
              
              <button 
                onClick={handleSwap}
                className="mb-3 p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors text-slate-400 hover:text-white"
                title="Swap Animals"
                disabled={isGenerating}
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 w-full">
                <AnimalSelector 
                  label="Observer B" 
                  selectedAnimal={animalB} 
                  animals={ANIMALS} 
                  onSelect={setAnimalB}
                  disabled={isGenerating}
                />
              </div>

              <div className="w-full md:w-auto">
                 <button
                    onClick={handleSimulate}
                    disabled={isGenerating}
                    className={`w-full md:w-auto h-[74px] px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-indigo-500/20 ${
                      isGenerating 
                        ? 'bg-slate-700 text-slate-400 cursor-wait' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                    }`}
                 >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Simulate Vision
                      </>
                    )}
                 </button>
              </div>
           </div>
           {error && (
             <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               <Info className="w-4 h-4" />
               {error}
             </div>
           )}
        </section>

        {/* Results Section */}
        {result ? (
          <section className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="h-full">
                <ResultCard 
                  observer={result.animalA}
                  subject={result.animalB}
                  perspective={result.perspectiveA}
                />
             </div>
             <div className="h-full">
                <ResultCard 
                  observer={result.animalB}
                  subject={result.animalA}
                  perspective={result.perspectiveB}
                />
             </div>
          </section>
        ) : (
          /* Empty State / Welcome */
          <section className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500 min-h-[400px]">
             <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                <EyeIcon className="w-12 h-12 opacity-50" />
             </div>
             <h2 className="text-2xl font-bold text-slate-300 mb-2">Ready to Visualize</h2>
             <p className="max-w-md mx-auto">Select two animals above to generate a scientifically accurate simulation of how they see each other.</p>
             
             <div className="mt-8 grid grid-cols-3 gap-4 text-xs opacity-60">
                <div className="flex flex-col items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-indigo-500" />
                   <span>Color Spectrum</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-indigo-500" />
                   <span>Motion Blur</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-indigo-500" />
                   <span>Field of View</span>
                </div>
             </div>
          </section>
        )}
      </main>

      <footer className="py-6 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} BioVision Simulator. Generated images are AI approximations.</p>
      </footer>
    </div>
  );
};

// Simple internal Icon component to avoid import issues if lucide-react has specific export quirks, 
// though we use imports above. This is just for the Logo usage in the component.
const EyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default App;