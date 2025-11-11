import React from 'react';
import { Weights } from '../types';

interface WeightagePanelProps {
  weights: Weights;
  onWeightsChange: (newWeights: Weights) => void;
}

const WeightagePanel: React.FC<WeightagePanelProps> = ({ weights, onWeightsChange }) => {
  const handleSliderChange = (key: keyof Weights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm animate-fade-in">
      <h2 className="text-lg font-semibold mb-2 text-card-foreground">Your Priorities</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AI has set these based on your description. Feel free to adjust them.
      </p>
      <div className="space-y-4">
        {(Object.keys(weights) as Array<keyof Weights>).map((key) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={key} className="text-sm font-medium text-foreground">
                {formatLabel(key)}
              </label>
              <span className="text-sm font-bold text-primary w-8 text-center bg-secondary rounded-md px-2 py-0.5">{weights[key]}</span>
            </div>
            <input
              type="range"
              id={key}
              min="0"
              max="10"
              step="1"
              value={weights[key]}
              onChange={(e) => handleSliderChange(key, parseInt(e.target.value, 10))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightagePanel;
