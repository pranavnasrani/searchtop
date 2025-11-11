import React, { useState } from 'react';

interface PreferenceInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const PreferenceInput: React.FC<PreferenceInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-card-foreground">Describe Your Perfect Laptop</h2>
      <p className="text-sm text-muted-foreground mb-4">
        e.g., "I need a powerful laptop for video editing with a great screen, but battery life is not a big deal."
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition"
          placeholder="I'm a student who needs a lightweight laptop with long battery life..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="mt-4 w-full bg-primary text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Find My Laptop'}
        </button>
      </form>
    </div>
  );
};

export default PreferenceInput;
