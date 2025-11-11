import React from 'react';
import { Laptop } from '../types';

interface LaptopCardProps {
  laptop: Laptop;
  onSelect: (laptop: Laptop) => void;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, onSelect }) => {
  const score = laptop.weightedScore?.toFixed(1) || 'N/A';

  return (
    <div 
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in group flex flex-col justify-between"
      onClick={() => onSelect(laptop)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">{laptop.brand}</p>
                <h3 className="font-bold text-lg text-card-foreground truncate group-hover:text-primary transition-colors" title={laptop.name}>{laptop.name}</h3>
            </div>
            <div className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg flex-shrink-0">
              {score}
            </div>
        </div>
        
        <p className="text-xl font-semibold text-muted-foreground my-2">${laptop.price.toLocaleString()}</p>
        
        <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t border-border">
          <p><span className="font-semibold text-foreground/80">CPU:</span> {laptop.cpu}</p>
          <p><span className="font-semibold text-foreground/80">GPU:</span> {laptop.gpu}</p>
          <p><span className="font-semibold text-foreground/80">RAM:</span> {laptop.ram}</p>
          <p><span className="font-semibold text-foreground/80">Storage:</span> {laptop.storage}</p>
        </div>
      </div>
    </div>
  );
};

export default LaptopCard;