import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PreferenceInput from './components/PreferenceInput';
import FilterPanel from './components/FilterPanel';
import LaptopCard from './components/LaptopCard';
import Spinner from './components/Spinner';
import LaptopDetailModal from './components/LaptopDetailModal';
import { Laptop, Filters, Weights } from './types';
import { fetchLaptops, addLaptop, updateLaptop, deleteLaptop, LaptopData } from './services/firebaseService';
import { getWeightsFromQuery } from './services/geminiService';
import WeightagePanel from './components/WeightagePanel';
import { useAuth } from './contexts/AuthContext';
import LaptopFormModal from './components/LaptopFormModal';
import { PlusIcon } from './components/icons/PlusIcon';
import AdminPanel from './components/AdminPanel';
import AiWebSearchCard from './components/AiWebSearchCard';

const App: React.FC = () => {
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  const [preferenceQuery, setPreferenceQuery] = useState('');

  const { isAdmin } = useAuth();

  const defaultWeights: Weights = { performance: 5, battery: 5, build_quality: 5, display: 5, audio: 5, portability: 5 };
  const [weights, setWeights] = useState<Weights>(defaultWeights);

  const [filters, setFilters] = useState<Filters>({
    price: { min: 0, max: 5000 },
    brands: [],
    displaySizes: [],
    gpus: [],
  });
  
  const loadLaptops = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const laptops = await fetchLaptops();
      setAllLaptops(laptops);
    } catch (e) {
      setError("Failed to load laptops. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLaptops();
  }, []);
  
  const handlePreferenceSubmit = async (query: string) => {
    setPreferenceQuery(query);
    setIsGeminiLoading(true);
    const { weights: newWeights, priceRange } = await getWeightsFromQuery(query);
    setWeights(newWeights);

    if (priceRange) {
        setFilters(prev => ({
            ...prev,
            price: {
                min: priceRange.min_price ?? prev.price.min,
                max: priceRange.max_price ?? prev.price.max,
            }
        }));
    }

    setIsGeminiLoading(false);
  };

  const calculateWeightedScore = (laptop: Laptop, currentWeights: Weights): number => {
    const totalWeight = Object.values(currentWeights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return 0;

    let totalScore = 0;
    for (const key of Object.keys(currentWeights) as Array<keyof Weights>) {
      totalScore += (laptop.scores[key] / 10) * (currentWeights[key] / totalWeight);
    }
    return totalScore * 10;
  };
  
  const { filteredAndSortedLaptops, uniqueBrands, uniqueGpus, priceRange } = useMemo(() => {
    const scoredLaptops = allLaptops.map(laptop => ({
      ...laptop,
      weightedScore: calculateWeightedScore(laptop, weights),
    }));

    const filtered = scoredLaptops.filter(laptop => {
      const { price, brands, displaySizes, gpus } = filters;
      if (laptop.price < price.min || laptop.price > price.max) return false;
      if (brands.length > 0 && !brands.includes(laptop.brand)) return false;
      if (gpus.length > 0 && !gpus.some(gpuFilter => laptop.gpu.includes(gpuFilter))) return false;
      if (displaySizes.length > 0) {
        const size = parseFloat(laptop.display);
        if (isNaN(size) || !displaySizes.some(s => size >= s && size < s + 1)) return false;
      }
      return true;
    });

    const sorted = filtered.sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0));

    const allBrands = [...new Set(allLaptops.map(l => l.brand))].sort();
    const allGpus = [...new Set(allLaptops.map(l => l.gpu.split(' ')[0]))].filter(Boolean).sort();
    const prices = allLaptops.map(l => l.price);
    const pRange = { min: prices.length > 0 ? Math.min(...prices) : 0, max: prices.length > 0 ? Math.max(...prices) : 5000 };

    return { filteredAndSortedLaptops: sorted, uniqueBrands: allBrands, uniqueGpus: allGpus, priceRange: pRange };
  }, [allLaptops, filters, weights]);

  useEffect(() => {
    if(allLaptops.length > 0) {
      setFilters(prev => ({ ...prev, price: { min: priceRange.min, max: priceRange.max } }));
    }
  }, [priceRange.min, priceRange.max, allLaptops.length]);

  const handleSaveLaptop = async (laptopData: LaptopData) => {
    try {
      if (editingLaptop) {
        await updateLaptop(editingLaptop.id, laptopData);
      } else {
        await addLaptop(laptopData);
      }
      setIsFormModalOpen(false);
      setEditingLaptop(null);
      loadLaptops();
    } catch (error) {
      console.error("Failed to save laptop:", error);
      setError("Failed to save laptop. Please try again.");
    }
  };

  const handleDeleteLaptop = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this laptop?")) {
      try {
        await deleteLaptop(id);
        loadLaptops();
      } catch (error) {
        console.error("Failed to delete laptop:", error);
        setError("Failed to delete laptop. Please try again.");
      }
    }
  };

  const openAddModal = () => {
    setEditingLaptop(null);
    setIsFormModalOpen(true);
  };
  
  const openEditModal = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    setIsFormModalOpen(true);
  };
  
  return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      <Header onRefresh={loadLaptops} isLoading={isLoading} />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6 lg:sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <PreferenceInput onSubmit={handlePreferenceSubmit} isLoading={isGeminiLoading} />
            {weights !== defaultWeights && <WeightagePanel weights={weights} onWeightsChange={setWeights} />}
            <FilterPanel 
                filters={filters} 
                onFilterChange={setFilters} 
                allBrands={uniqueBrands}
                allGpus={uniqueGpus}
                priceRange={priceRange}
            />
            {isAdmin && <AdminPanel />}
          </aside>

          <div className="lg:col-span-3">
            {preferenceQuery && <AiWebSearchCard userQuery={preferenceQuery} priceRange={filters.price} />}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedLaptops.map(laptop => (
                  <LaptopCard 
                    key={laptop.id} 
                    laptop={laptop} 
                    onSelect={setSelectedLaptop}
                    onEdit={openEditModal}
                    onDelete={handleDeleteLaptop}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
             {isAdmin && (
                <button 
                    onClick={openAddModal} 
                    className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                    aria-label="Add new laptop"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            )}
          </div>
        </div>
      </main>
      {selectedLaptop && <LaptopDetailModal laptop={selectedLaptop} onClose={() => setSelectedLaptop(null)} />}
      {isFormModalOpen && (
        <LaptopFormModal 
          laptop={editingLaptop} 
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingLaptop(null);
          }} 
          onSave={handleSaveLaptop}
        />
      )}
    </div>
  );
};

export default App;