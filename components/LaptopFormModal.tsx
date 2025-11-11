import React, { useState, useEffect, FormEvent } from 'react';
import { Laptop, Scores } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { LaptopData } from '../services/firebaseService';

interface LaptopFormModalProps {
  laptop: Laptop | null;
  onClose: () => void;
  onSave: (laptopData: LaptopData) => void;
}

const defaultScores: Scores = { performance: 5, battery: 5, build_quality: 5, display: 5, audio: 5, portability: 5 };
const defaultLaptopData: LaptopData = {
  name: '', brand: '', price: 1000, release_date: new Date().toISOString().split('T')[0], image_urls: [],
  cpu: '', gpu: '', ram: '', storage: '', display: '', battery: '', build: '', audio: '', ports: '', scores: defaultScores
};

const LaptopFormModal: React.FC<LaptopFormModalProps> = ({ laptop, onClose, onSave }) => {
  const [formData, setFormData] = useState<LaptopData>(defaultLaptopData);

  useEffect(() => {
    if (laptop) {
      const { id, last_updated, weightedScore, ...editableData } = laptop;
      setFormData(editableData);
    } else {
      setFormData(defaultLaptopData);
    }
  }, [laptop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };
  
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [name]: parseInt(value, 10) }
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] border border-border flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card/80 backdrop-blur-sm p-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-card-foreground">{laptop ? 'Edit Laptop' : 'Add New Laptop'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name" name="name" value={formData.name} onChange={handleChange} required />
            <InputField label="Brand" name="brand" value={formData.brand} onChange={handleChange} required />
            <InputField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            <InputField label="Release Date" name="release_date" type="date" value={formData.release_date} onChange={handleChange} required />
            <InputField label="CPU" name="cpu" value={formData.cpu} onChange={handleChange} />
            <InputField label="GPU" name="gpu" value={formData.gpu} onChange={handleChange} />
            <InputField label="RAM" name="ram" value={formData.ram} onChange={handleChange} />
            <InputField label="Storage" name="storage" value={formData.storage} onChange={handleChange} />
            <InputField label="Display" name="display" value={formData.display} onChange={handleChange} />
            <InputField label="Battery" name="battery" value={formData.battery} onChange={handleChange} />
            <InputField label="Build" name="build" value={formData.build} onChange={handleChange} />
            <InputField label="Audio" name="audio" value={formData.audio} onChange={handleChange} />
            <InputField label="Ports" name="ports" value={formData.ports} onChange={handleChange} />
          </div>
          
          <h3 className="text-lg font-semibold pt-4 border-t border-border">Scores (0-10)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.keys(defaultScores) as Array<keyof Scores>).map(key => (
               <ScoreField key={key} label={key.replace('_', ' ')} name={key} value={formData.scores[key]} onChange={handleScoreChange} />
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-md hover:bg-primary/90 transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper components for the form fields
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <input id={props.name} {...props} className="w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition" />
  </div>
);

const ScoreField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
      <label htmlFor={props.name} className="block text-sm font-medium text-muted-foreground mb-1 capitalize">{label}</label>
      <input id={props.name} {...props} type="number" min="0" max="10" step="1" className="w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition" />
    </div>
);


export default LaptopFormModal;