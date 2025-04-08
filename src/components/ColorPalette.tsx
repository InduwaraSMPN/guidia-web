import React from 'react';

interface ColorSwatchProps {
  colorClass: string;
  label: string;
  textClass?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ colorClass, label, textClass = 'text-white' }) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-16 h-16 rounded-md shadow-md ${colorClass} flex items-center justify-center mb-2`}
      >
        <span className={`text-xs font-medium ${textClass}`}>{label}</span>
      </div>
    </div>
  );
};

export const ColorPalette: React.FC = () => {
  return (
    <div className="p-6 bg-background text-foreground">
      <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
      
      <div className="space-y-8">
        {/* Brand Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Brand Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <ColorSwatch colorClass="bg-brand" label="Brand" />
            <ColorSwatch colorClass="bg-brand-light" label="Light" />
            <ColorSwatch colorClass="bg-brand-lighter" label="Lighter" />
            <ColorSwatch colorClass="bg-brand-dark" label="Dark" />
            <ColorSwatch colorClass="bg-brand-darker" label="Darker" />
          </div>
        </div>
        
        {/* Secondary Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Secondary Colors (Teal)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <ColorSwatch colorClass="bg-teal" label="Teal" />
            <ColorSwatch colorClass="bg-teal-light" label="Light" />
            <ColorSwatch colorClass="bg-teal-lighter" label="Lighter" />
            <ColorSwatch colorClass="bg-teal-dark" label="Dark" />
            <ColorSwatch colorClass="bg-teal-darker" label="Darker" />
          </div>
        </div>
        
        {/* Neutral Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Neutral Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-4">
            <ColorSwatch colorClass="bg-neutral-50" label="50" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-neutral-100" label="100" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-neutral-200" label="200" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-neutral-300" label="300" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-neutral-400" label="400" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-neutral-500" label="500" />
            <ColorSwatch colorClass="bg-neutral-600" label="600" />
            <ColorSwatch colorClass="bg-neutral-700" label="700" />
            <ColorSwatch colorClass="bg-neutral-800" label="800" />
            <ColorSwatch colorClass="bg-neutral-900" label="900" />
          </div>
        </div>
        
        {/* Accent Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Accent Colors</h3>
          <div className="grid grid-cols-3 gap-4">
            <ColorSwatch colorClass="bg-gold" label="Gold" />
            <ColorSwatch colorClass="bg-indigo" label="Indigo" />
            <ColorSwatch colorClass="bg-purple" label="Purple" />
          </div>
        </div>
        
        {/* Functional Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Functional Colors</h3>
          <div className="grid grid-cols-4 gap-4">
            <ColorSwatch colorClass="bg-success" label="Success" />
            <ColorSwatch colorClass="bg-warning" label="Warning" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-error" label="Error" />
            <ColorSwatch colorClass="bg-info" label="Info" />
          </div>
        </div>
        
        {/* Chart Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Chart Colors</h3>
          <div className="grid grid-cols-5 gap-4">
            <ColorSwatch colorClass="bg-chart-1" label="Chart 1" />
            <ColorSwatch colorClass="bg-chart-2" label="Chart 2" />
            <ColorSwatch colorClass="bg-chart-3" label="Chart 3" />
            <ColorSwatch colorClass="bg-chart-4" label="Chart 4" textClass="text-neutral-900" />
            <ColorSwatch colorClass="bg-chart-5" label="Chart 5" textClass="text-neutral-900" />
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-card rounded-lg border border-border">
        <h3 className="text-xl font-semibold mb-4">Usage Examples</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <button className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-light">
                Primary Button
              </button>
              <button className="bg-teal text-white px-4 py-2 rounded-md hover:bg-teal-light">
                Secondary Button
              </button>
              <button className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-md hover:bg-neutral-300">
                Neutral Button
              </button>
              <button className="border border-brand text-brand px-4 py-2 rounded-md hover:bg-brand hover:text-white">
                Outline Button
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Alerts</h4>
            <div className="space-y-2">
              <div className="bg-success/20 text-success p-3 rounded-md border border-success/30">
                Success message
              </div>
              <div className="bg-warning/20 text-warning p-3 rounded-md border border-warning/30">
                Warning message
              </div>
              <div className="bg-error/20 text-error p-3 rounded-md border border-error/30">
                Error message
              </div>
              <div className="bg-info/20 text-info p-3 rounded-md border border-info/30">
                Info message
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Text</h4>
            <div className="space-y-1">
              <p className="text-brand font-semibold">Brand colored text</p>
              <p className="text-teal font-semibold">Secondary colored text</p>
              <p className="text-neutral-500">Muted text using neutral-500</p>
              <p className="text-neutral-700">Default text using neutral-700</p>
              <p className="text-neutral-900 font-bold">Bold text using neutral-900</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
