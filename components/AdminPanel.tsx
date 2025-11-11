import React from 'react';

interface AdminPanelProps {
  onFindNewLaptops: () => void;
  isFinding: boolean;
  onScrapeLaptops: () => void;
  isScraping: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onFindNewLaptops, isFinding, onScrapeLaptops, isScraping }) => {
  
  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm animate-fade-in">
      <h2 className="text-lg font-semibold mb-2 text-card-foreground">Admin Tools</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Access special administrative actions.
      </p>
      <div className="space-y-3">
        <button
          onClick={onFindNewLaptops}
          disabled={isFinding || isScraping}
          className="w-full bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-wait"
        >
          {isFinding ? 'Searching...' : 'Find New Laptops (AI)'}
        </button>
        <button
          onClick={onScrapeLaptops}
          disabled={isScraping || isFinding}
          className="w-full bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-wait"
        >
          {isScraping ? 'Scraping Web...' : 'Scrape for Laptops'}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;