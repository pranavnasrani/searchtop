import React, { useState } from 'react';
import { getWebRecommendations } from '../services/geminiService';
import { GroundingChunk } from '../types';
import Spinner from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface AiWebSearchCardProps {
  userQuery: string;
  priceRange: { min: number; max: number };
}

const AiWebSearchCard: React.FC<AiWebSearchCardProps> = ({ userQuery, priceRange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ recommendations: string; sources: GroundingChunk[] } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await getWebRecommendations(userQuery, priceRange);
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Need More Ideas?</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-prose">
            Get AI-powered recommendations from across the web based on your query and budget.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex-shrink-0"
        >
          <SparklesIcon className="w-5 h-5" />
          {isLoading ? 'Searching...' : 'Ask AI'}
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 pt-4 border-t border-border">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-md text-foreground mb-2">AI Recommendations:</h4>
          <p className="text-sm text-foreground whitespace-pre-wrap">{result.recommendations}</p>

          {result.sources.length > 0 && (
            <>
              <h5 className="font-semibold text-sm text-muted-foreground mt-4 mb-2">Sources:</h5>
              <ul className="list-disc list-inside space-y-1">
                {result.sources.map((source, index) => (
                  <li key={index} className="text-xs truncate">
                    <a
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      title={source.web.title}
                    >
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AiWebSearchCard;