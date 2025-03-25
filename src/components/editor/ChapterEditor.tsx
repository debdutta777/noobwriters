'use client';

import { useState, useEffect } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SimpleEditor({ value, onChange, placeholder, className }: EditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`min-h-[400px] border p-3 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="border-b border-gray-200 pb-2 mb-2 flex gap-2">
        <button 
          onClick={() => onChange(value + '<h1>Heading 1</h1>')}
          className="px-2 py-1 border rounded hover:bg-gray-100"
          type="button"
        >
          H1
        </button>
        <button 
          onClick={() => onChange(value + '<h2>Heading 2</h2>')}
          className="px-2 py-1 border rounded hover:bg-gray-100"
          type="button"
        >
          H2
        </button>
        <button 
          onClick={() => onChange(value + '<strong>Bold text</strong>')}
          className="px-2 py-1 border rounded hover:bg-gray-100 font-bold"
          type="button"
        >
          B
        </button>
        <button 
          onClick={() => onChange(value + '<em>Italic text</em>')}
          className="px-2 py-1 border rounded hover:bg-gray-100 italic"
          type="button"
        >
          I
        </button>
        <button 
          onClick={() => onChange(value + '<ul><li>List item</li></ul>')}
          className="px-2 py-1 border rounded hover:bg-gray-100"
          type="button"
        >
          List
        </button>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Write your content here..."}
        className="w-full min-h-[400px] p-3 border-0 focus:ring-0 focus:outline-none"
      />
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Preview:</h3>
        <div 
          className="p-3 border rounded bg-gray-50"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    </div>
  );
} 