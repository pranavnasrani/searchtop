import React from 'react';
import { Laptop } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface LaptopDetailModalProps {
  laptop: Laptop;
  onClose: () => void;
}

const SpecItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border">
    <span className="font-semibold text-muted-foreground">{label}</span>
    <span className="text-right text-foreground">{value}</span>
  </div>
);

const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{score}/10</span>
    </div>
    <div className="w-full bg-secondary rounded-full h-2">
      <div className="bg-primary h-2 rounded-full" style={{ width: `${score * 10}%` }}></div>
    </div>
  </div>
);


const LaptopDetailModal: React.FC<LaptopDetailModalProps> = ({ laptop, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/80 backdrop-blur-sm p-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-card-foreground">{laptop.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img src={laptop.image_urls[0]} alt={laptop.name} className="w-full rounded-lg object-cover mb-6" />
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Scores</h3>
            <div className="space-y-3">
              <ScoreBar label="Performance" score={laptop.scores.performance} />
              <ScoreBar label="Battery" score={laptop.scores.battery} />
              <ScoreBar label="Build Quality" score={laptop.scores.build_quality} />
              <ScoreBar label="Display" score={laptop.scores.display} />
              <ScoreBar label="Audio" score={laptop.scores.audio} />
              <ScoreBar label="Portability" score={laptop.scores.portability} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Specifications</h3>
            <div className="text-sm space-y-2">
              <SpecItem label="Price" value={`$${laptop.price.toLocaleString()}`} />
              <SpecItem label="Brand" value={laptop.brand} />
              <SpecItem label="CPU" value={laptop.cpu} />
              <SpecItem label="GPU" value={laptop.gpu} />
              <SpecItem label="RAM" value={laptop.ram} />
              <SpecItem label="Storage" value={laptop.storage} />
              <SpecItem label="Display" value={laptop.display} />
              <SpecItem label="Battery" value={laptop.battery} />
              <SpecItem label="Build" value={laptop.build} />
              <SpecItem label="Audio" value={laptop.audio} />
              <SpecItem label="Ports" value={laptop.ports} />
              <SpecItem label="Release Date" value={laptop.release_date} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopDetailModal;
