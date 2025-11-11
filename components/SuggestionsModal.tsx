import React, { useState } from 'react';
// FIX: Changed LaptopData import from firebaseService to types.
import { LaptopData } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface SuggestionsModalProps {
  laptops: LaptopData[];
  onClose: () => void;
  onAdd: (laptop: LaptopData) => Promise<void>;
  error: string | null;
  onRetry: () => void;
}

const SuggestionCard: React.FC<{ laptop: LaptopData, onAdd: (laptop: LaptopData) => Promise<void> }> = ({ laptop, onAdd }) => {
    const [isAdding, setIsAdding] = useState(false);
    
    const handleAdd = async () => {
        setIsAdding(true);
        await onAdd(laptop);
        // The card will disappear from the list, so no need to setIsAdding(false)
    };

    return (
        <div className="bg-secondary/50 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-bold text-card-foreground">{laptop.name}</p>
                <p className="text-sm text-muted-foreground">{laptop.brand} - Est. ${laptop.price.toLocaleString()}</p>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p><span className="font-semibold text-foreground/80">CPU:</span> {laptop.cpu}</p>
                    <p><span className="font-semibold text-foreground/80">GPU:</span> {laptop.gpu}</p>
                </div>
            </div>
            <button 
                onClick={handleAdd}
                disabled={isAdding}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full md:w-auto disabled:opacity-60 disabled:cursor-wait"
            >
                <PlusIcon className="w-4 h-4" />
                {isAdding ? 'Adding...' : 'Add to Database'}
            </button>
        </div>
    );
};


const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ laptops, onClose, onAdd, error, onRetry }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/80 backdrop-blur-sm p-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-card-foreground">AI Laptop Suggestions</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
            {error ? (
                <div className="text-center p-6 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <p className="text-red-600 dark:text-red-300 font-semibold mb-4">{error}</p>
                    <button 
                        onClick={() => { onClose(); onRetry(); }}
                        className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-primary/90"
                    >
                        <RefreshIcon className="w-5 h-5"/>
                        Try Again
                    </button>
                </div>
            ) : laptops.length > 0 ? (
                laptops.map(laptop => <SuggestionCard key={laptop.name} laptop={laptop} onAdd={onAdd} />)
            ) : (
                <div className="text-center p-6 text-muted-foreground">
                    <p className="font-semibold">No new laptops found.</p>
                    <p className="text-sm mt-1">The AI couldn't find any recently released laptops that aren't already in your database.</p>
                </div>
            )}
        </div>
        
        {laptops.length > 0 && (
            <div className="p-4 border-t border-border mt-auto">
                 <p className="text-xs text-muted-foreground text-center">
                    Found {laptops.length} new laptop{laptops.length > 1 ? 's' : ''}. Add them to your database.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsModal;