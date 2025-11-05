
import React, { useState, useCallback, useMemo } from 'react';
import { generateModelImage, fileToGenerativePart } from './services/geminiService';
import type { Part } from '@google/genai';

// --- Icon Components ---
const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.718c-1.126 0-2.037.954-2.037 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const Spinner: React.FC<{}> = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
    </div>
);

// --- Child Components ---
interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, previewUrl, onClear }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
    }
  };

  if (previewUrl) {
    return (
      <div className="relative w-full max-w-sm mx-auto group">
        <img src={previewUrl} alt="មើលផលិតផលជាមុន" className="w-full h-auto object-contain rounded-lg shadow-lg border-2 border-slate-600"/>
        <button 
          onClick={onClear} 
          className="absolute top-2 right-2 p-2 bg-slate-900/70 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-all opacity-0 group-hover:opacity-100"
          aria-label="លុបរូបភាព"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <label 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative block w-full max-w-lg mx-auto p-8 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer hover:border-cyan-400 hover:bg-slate-800/50 transition-colors duration-300"
    >
        <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" />
        <span className="mt-2 block text-sm font-semibold text-slate-300">
            អូសនិងទម្លាក់រូបភាពផលិតផលនៅទីនេះ
        </span>
        <span className="mt-1 block text-xs text-slate-500">
            ឬចុចដើម្បីជ្រើសរើសឯកសារ
        </span>
        <input type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
    </label>
  );
};


// --- Main App Component ---
export default function App() {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('studio');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(() => [
    { id: 'studio', name: 'ស្ទូឌីយោ' },
    { id: 'outdoor', name: 'ខាងក្រៅ' },
    { id: 'lobby', name: 'ឡប់ប៊ីប្រណិត' },
  ], []);

  const productPreviewUrl = useMemo(() => {
    if (productFile) {
      return URL.createObjectURL(productFile);
    }
    return null;
  }, [productFile]);
  
  const handleImageSelect = (file: File) => {
    setProductFile(file);
    setGeneratedImages([]);
    setError(null);
  };

  const handleClear = () => {
    setProductFile(null);
    setGeneratedImages([]);
    setError(null);
    if(productPreviewUrl) {
      URL.revokeObjectURL(productPreviewUrl);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!productFile) {
      setError("សូមជ្រើសរើសរូបភាពផលិតផលជាមុនសិន។");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
        const imagePart = await fileToGenerativePart(productFile);
        
        const imagePromises = Array(2).fill(null).map(() => generateModelImage(imagePart, selectedStyle));
        const results = await Promise.all(imagePromises);
        
        setGeneratedImages(results);

    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("មានកំហុសមិនស្គាល់មួយបានកើតឡើង។");
        }
    } finally {
        setIsLoading(false);
    }
  }, [productFile, selectedStyle]);

  const handleDownload = (imgData: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${imgData}`;
    link.download = `product-model-${selectedStyle}-${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
            AI បង្កើតតារាម៉ូដែលផលិតផល
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
            បំប្លែងរូបភាពផលិតផលរបស់អ្នកទៅជារូបថតផ្សាយពាណិជ្ជកម្មប្រកបដោយវិជ្ជាជីវៈដោយគ្រាន់តែចុចមួយដង។
          </p>
        </header>

        <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-2xl shadow-black/20 p-6 md:p-10 border border-slate-700">
            <div className="flex flex-col items-center gap-8">
                <ImageUpload onImageSelect={handleImageSelect} previewUrl={productPreviewUrl} onClear={handleClear} />
                
                {productFile && (
                    <>
                        <div className="flex justify-center gap-2 md:gap-4 my-4 flex-wrap">
                            <p className="w-full text-center text-slate-400 text-sm mb-2">ជ្រើសរើសផ្ទៃខាងក្រោយ៖</p>
                            {styles.map((style) => (
                                <button
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 border-2 ${
                                    selectedStyle === style.id
                                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                                }`}
                                >
                                {style.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 w-full max-w-xs px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-lg shadow-lg hover:from-cyan-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    <span>កំពុងដំណើរការ...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>បង្កើតរូបភាពតារាម៉ូដែល</span>
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            {error && (
                <div className="mt-8 p-4 text-center bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                    <p>{error}</p>
                </div>
            )}
            
            {isLoading && !error && (
                 <div className="mt-8 text-center text-slate-400">
                    <p>AI កំពុងធ្វើការ... ដំណើរការនេះអាចចំណាយពេលបន្តិច។</p>
                </div>
            )}
            
            {generatedImages.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">លទ្ធផលរបស់អ្នក</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {generatedImages.map((imgData, index) => (
                            <div key={index} className="group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500/20">
                                <img 
                                    src={`data:image/jpeg;base64,${imgData}`} 
                                    alt={`រូបភាពតារាម៉ូដែលបង្កើតដោយ AI ${index + 1}`} 
                                    className="w-full h-auto object-cover aspect-square"
                                />
                                <button
                                    onClick={() => handleDownload(imgData, index)}
                                    className="absolute bottom-3 right-3 p-3 bg-slate-900/70 text-white rounded-full hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all opacity-0 group-hover:opacity-100"
                                    aria-label="ទាញយករូបភាព"
                                >
                                    <DownloadIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <footer className="text-center mt-16 text-slate-500 text-sm">
          <p>ដំណើរការដោយ Google Gemini API</p>
        </footer>
      </main>
    </div>
  );
}
