import React from 'react';

const AdminPanel: React.FC = () => {
  
  const handleAiSearch = () => {
    alert("Feature in development: This will use AI to search for newly released laptops and suggest them for addition to the database.");
  };

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
          onClick={handleAiSearch}
          className="w-full bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-secondary/80"
        >
          Find New Laptops (AI)
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
