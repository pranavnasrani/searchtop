
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Laptop, Weights, Filters, Scores } from './types';
import { fetchLaptops, addLaptop, updateLaptop, deleteLaptop, LaptopData } from './services/firebaseService';
import { getPreferenceWeights } from './services/geminiService';
import Header from './components/Header';
import PreferenceInput from './components/PreferenceInput';
import FilterPanel from './components/FilterPanel';
import LaptopCard from './components/LaptopCard';
import LaptopDetailModal from './components/LaptopDetailModal';
import Spinner from './components/Spinner';
import WeightagePanel from './components/WeightagePanel';
import { useAuth } from './contexts/AuthContext';
import LaptopFormModal from './components/LaptopFormModal';
import AdminPanel from './components/AdminPanel';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentlyEditingLaptop, setCurrentlyEditingLaptop] = useState<Laptop | null>(null);
  
  const { isAdmin } = useAuth();
  
  const [weights, setWeights] = useState<Weights>({
    performance: 5, battery: 5, build_quality: 5, display: 5, audio: 5, portability: 5, price: 5,
  });
  
  const [initialPriceRange, setInitialPriceRange] = useState({ min: 0, max: 5000 });

  const [filters, setFilters] = useState<Filters>({
    price: { min: 0, max: 5000 },
    brands: [],
    displaySizes: [],
    gpus: [],
  });

  const loadLaptops = useCallback(async () => {
    setIsLoading(true);
    try {
      const laptopsData = await fetchLaptops();
      setAllLaptops(laptopsData);
      
      if(laptopsData.length > 0) {
        const prices = laptopsData.map(l => l.price);
        const minPrice = Math.floor(Math.min(...prices) / 100) * 100;
        const maxPrice = Math.ceil(Math.max(...prices) / 100) * 100;
        const priceRange = { min: minPrice, max: maxPrice };
        setInitialPriceRange(priceRange);
        setFilters(prev => ({...prev, price: priceRange}));
      }

    } catch (error) {
      console.error("Failed to fetch laptops:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLaptops();
  }, [loadLaptops]);

  const handlePreferenceSubmit = async (text: string) => {
    setIsAnalyzing(true);
    const preferenceData = await getPreferenceWeights(text);
    setWeights(preferenceData.weights);
    if (preferenceData.priceRange) {
        const newMin = Math.max(initialPriceRange.min, preferenceData.priceRange.min);
        const newMax = Math.min(initialPriceRange.max, preferenceData.priceRange.max);

        if (newMin <= newMax) {
             setFilters(prev => ({ ...prev, price: { min: newMin, max: newMax } }));
        }
    }
    setIsAnalyzing(false);
  };

  const handleWeightsChange = (newWeights: Weights) => {
    setWeights(newWeights);
  };

  const handleOpenAddModal = () => {
    setCurrentlyEditingLaptop(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (laptop: Laptop) => {
    setCurrentlyEditingLaptop(laptop);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentlyEditingLaptop(null);
  };
  
  const handleSaveLaptop = async (laptopData: LaptopData) => {
    try {
      if (currentlyEditingLaptop) {
        await updateLaptop(currentlyEditingLaptop.id, laptopData);
      } else {
        await addLaptop(laptopData);
      }
      handleCloseFormModal();
      await loadLaptops();
    } catch(e) {
      console.error("Failed to save laptop", e);
      alert("Error: Could not save laptop.");
    }
  };

  const handleDeleteLaptop = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this laptop?")) {
        try {
            await deleteLaptop(id);
            await loadLaptops();
        } catch(e) {
            console.error("Failed to delete laptop", e);
            alert("Error: Could not delete laptop.");
        }
    }
  };

  const scoredAndFilteredLaptops = useMemo(() => {
    if (allLaptops.length === 0) return [];

    const prices = allLaptops.map(l => l.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const scored = allLaptops.map(laptop => {
      const priceScore = maxPrice === minPrice ? 10 : 10 - ((laptop.price - minPrice) / (maxPrice - minPrice)) * 10;
      
      const totalScore =
        laptop.scores.performance * weights.performance +
        laptop.scores.battery * weights.battery +
        laptop.scores.build_quality * weights.build_quality +
        laptop.scores.display * weights.display +
        laptop.scores.audio * weights.audio +
        laptop.scores.portability * weights.portability +
        priceScore * weights.price;

      const totalWeight = (Object.keys(weights) as Array<keyof Weights>).reduce((sum, key) => sum + weights[key], 0);
      const weightedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
      
      return { ...laptop, weightedScore };
    });

    const filtered = scored.filter(laptop => {
      if (laptop.price < filters.price.min || laptop.price > filters.price.max) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(laptop.brand)) return false;
      const displaySize = parseFloat(laptop.display);
      if (filters.displaySizes.length > 0 && !filters.displaySizes.some(size => displaySize >= size && displaySize < size + 1)) return false;
      if (filters.gpus.length > 0 && !filters.gpus.some(gpuFilter => laptop.gpu.toLowerCase().includes(gpuFilter.toLowerCase()))) return false;
      
      return true;
    });

    return filtered.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0));
  }, [allLaptops, weights, filters]);
  
  const uniqueBrands = useMemo(() => [...new Set(allLaptops.map(l => l.brand))].sort(), [allLaptops]);
  const uniqueGpus = useMemo(() => {
    const gpuSet = new Set<string>();
    if (allLaptops.some(l => l.gpu.includes('RTX 40'))) gpuSet.add('RTX 40-series');
    if (allLaptops.some(l => l.gpu.includes('RTX 30'))) gpuSet.add('RTX 30-series');
    if (allLaptops.some(l => l.gpu.includes('Iris Xe') || l.gpu.includes('Radeon'))) gpuSet.add('Integrated');
    return Array.from(gpuSet);
  }, [allLaptops]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onRefresh={loadLaptops} isLoading={isLoading} />
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">

          <aside className="lg:w-1/4 xl:w-1/5 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pr-4">
              {isAdmin && <AdminPanel />}
              <PreferenceInput onSubmit={handlePreferenceSubmit} isLoading={isAnalyzing} />
              <WeightagePanel weights={weights} onWeightsChange={handleWeightsChange} />
              <FilterPanel 
                  filters={filters} 
                  onFilterChange={setFilters} 
                  allBrands={uniqueBrands} 
                  allGpus={uniqueGpus}
                  priceRange={initialPriceRange} 
              />
            </div>
          </aside>
          
          <main className="lg:w-3/4 xl:w-4/5">
            {isAdmin && (
              <div className="mb-6 flex justify-end">
                <button 
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-primary/90"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add New Laptop
                </button>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center h-96"><Spinner /></div>
            ) : scoredAndFilteredLaptops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {scoredAndFilteredLaptops.map(laptop => (
                  <LaptopCard 
                    key={laptop.id} 
                    laptop={laptop} 
                    onSelect={setSelectedLaptop} 
                    isAdmin={isAdmin}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteLaptop}
                  />
                ))}
              </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                    <h3 className="text-xl font-semibold">No Laptops Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or preferences.</p>
                </div>
            )}
          </main>
        </div>
      </div>

      {selectedLaptop && <LaptopDetailModal laptop={selectedLaptop} onClose={() => setSelectedLaptop(null)} />}
      {isFormModalOpen && <LaptopFormModal laptop={currentlyEditingLaptop} onClose={handleCloseFormModal} onSave={handleSaveLaptop} />}
    </div>
  );
};

export default App;