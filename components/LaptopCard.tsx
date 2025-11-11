import React from 'react';
import { Laptop } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface LaptopCardProps {
  laptop: Laptop;
  onSelect: (laptop: Laptop) => void;
  onEdit: (laptop: Laptop) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, onSelect, onEdit, onDelete, isAdmin }) => {
  const score = laptop.weightedScore?.toFixed(1) || 'N/A';

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(laptop);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(laptop.id);
  };

  return (
    <div 
      className="relative bg-card border border-border rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in group flex flex-col justify-between"
      onClick={() => onSelect(laptop)}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={handleEditClick} className="p-1.5 bg-secondary/80 hover:bg-secondary rounded-full text-secondary-foreground" aria-label="Edit laptop"><EditIcon className="w-4 h-4" /></button>
          <button onClick={handleDeleteClick} className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white" aria-label="Delete laptop"><TrashIcon className="w-4 h-4" /></button>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div className="pr-12">
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