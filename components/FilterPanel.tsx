import React from 'react';
import { Filters } from '../types';

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  allBrands: string[];
  allGpus: string[];
  priceRange: { min: number; max: number };
}

const displaySizeOptions = [13, 14, 15, 16, 17];

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, allBrands, allGpus, priceRange }) => {

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, price: { ...filters.price, max: Number(e.target.value) } });
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };
  
  const handleDisplaySizeChange = (size: number) => {
    const newSizes = filters.displaySizes.includes(size)
      ? filters.displaySizes.filter(s => s !== size)
      : [...filters.displaySizes, size];
    onFilterChange({ ...filters, displaySizes: newSizes });
  };
  
  const handleGpuChange = (gpu: string) => {
    const newGpus = filters.gpus.includes(gpu)
      ? filters.gpus.filter(g => g !== gpu)
      : [...filters.gpus, gpu];
    onFilterChange({ ...filters, gpus: newGpus });
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-card-foreground">Filters</h2>
      
      <div className="mb-6">
        <label htmlFor="price" className="block text-sm font-medium text-muted-foreground mb-2">Max Price: ${filters.price.max}</label>
        <input
          type="range"
          id="price"
          min={priceRange.min}
          max={priceRange.max}
          value={filters.price.max}
          onChange={handlePriceChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>${priceRange.min}</span>
          <span>${priceRange.max}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Brand</h3>
        <div className="grid grid-cols-2 gap-2">
          {allBrands.map(brand => (
            <div key={brand} className="flex items-center">
              <input
                type="checkbox"
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-foreground">{brand}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Display Size (inches)</h3>
        <div className="grid grid-cols-2 gap-2">
          {displaySizeOptions.map(size => (
            <div key={size} className="flex items-center">
              <input
                type="checkbox"
                id={`size-${size}`}
                checked={filters.displaySizes.includes(size)}
                onChange={() => handleDisplaySizeChange(size)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor={`size-${size}`} className="ml-2 text-sm text-foreground">{size}" - {size}.9"</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">GPU Series</h3>
        <div className="space-y-2">
          {allGpus.map(gpu => (
            <div key={gpu} className="flex items-center">
              <input
                type="checkbox"
                id={`gpu-${gpu}`}
                checked={filters.gpus.includes(gpu)}
                onChange={() => handleGpuChange(gpu)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor={`gpu-${gpu}`} className="ml-2 text-sm text-foreground">{gpu}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
