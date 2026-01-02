import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  darkMode?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onChange, 
  label = "Classification Tags",
  placeholder = "ADD TAG...",
  darkMode = false
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTag.trim();
    if (!cleanTag) return;
    if (tags.includes(cleanTag)) return;
    onChange([...tags, cleanTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Tag size={10} /> {t}
            <button onClick={() => removeTag(t)} type="button" className="hover:text-red-500">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={handleAddTag} className="flex gap-2">
        <input 
          type="text" 
          placeholder={placeholder}
          className={`flex-1 p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest outline-none transition-all ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
        />
        <button type="submit" className="px-6 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest">
          Add
        </button>
      </form>
    </div>
  );
};
