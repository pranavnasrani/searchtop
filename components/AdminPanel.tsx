import React from 'react';

interface AdminPanelProps {
  onFindNewLaptops: () => void;
  isFinding: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onFindNewLaptops, isFinding }) => {
  
  const handleWebScrape = () => {
    alert("Feature in development: This would trigger a backend process to scrape specified websites for new laptop data.");
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm animate-fade-in">
      <h2 className="text-lg font-semibold mb-2 text-card-foreground">Admin Tools</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Access special administrative actions.
      </p>
      <div className="space-y-3">
        <button
          onClick={onFindNewLaptops}
          disabled={isFinding}
          className="w-full bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-wait"
        >
          {isFinding ? 'Searching...' : 'Find New Laptops (AI)'}
        </button>
        <button
          onClick={handleWebScrape}
          className="w-full bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-secondary/80"
        >
          Scrape for Laptops
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;