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
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in group"
      onClick={() => onSelect(laptop)}
    >
      <div className="relative">
        <img src={laptop.image_urls[0]} alt={laptop.name} className="w-full h-48 object-cover" />
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          {score}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase">{laptop.brand}</p>
        <h3 className="font-bold text-lg text-card-foreground truncate group-hover:text-primary transition-colors">{laptop.name}</h3>
        
        <p className="text-xl font-semibold text-muted-foreground my-2">${laptop.price.toLocaleString()}</p>
        
        <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t border-border">
          <p><span className="font-semibold text-foreground/80">CPU:</span> {laptop.cpu}</p>
          <p><span className="font-semibold text-foreground/80">GPU:</span> {laptop.gpu}</p>
          <p><span className="font-semibold text-foreground/80">RAM:</span> {laptop.ram}</p>
        </div>
      </div>
    </div>
  );
};

export default LaptopCard;
