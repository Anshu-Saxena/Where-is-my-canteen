import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Check, ArrowRight } from 'lucide-react';

export default function OwnerCategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Beverages', itemsCount: 3, description: 'Coffees, shakes, iced frappes & teas' },
    { id: 'cat-2', name: 'Snacks', itemsCount: 2, description: 'Quick bites, sandwiches, samosas & rolls' },
    { id: 'cat-3', name: 'Fast Food', itemsCount: 1, description: 'Maggi, burgers, fries & street specials' },
    { id: 'cat-4', name: 'Breakfast', itemsCount: 1, description: 'Morning combos & parathas' },
    { id: 'cat-5', name: 'Lunch', itemsCount: 0, description: 'Thalis, rice bowls & curries' },
    { id: 'cat-6', name: 'Stationery', itemsCount: 2, description: 'Notebooks, pens, exam boards & supplies' },
    { id: 'cat-7', name: 'Daily Essentials', itemsCount: 2, description: 'Sanitizers, energy bars & campus necessities' },
    { id: 'cat-8', name: 'Other', itemsCount: 1, description: 'Desserts, waffles & seasonal items' }
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories([
      ...categories,
      {
        id: `cat-${Date.now()}`,
        name: newCatName.trim(),
        itemsCount: 0,
        description: newCatDesc.trim() || 'Menu category'
      }
    ]);
    setNewCatName('');
    setNewCatDesc('');
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Organize food, stationery and daily essential items into customer-facing filters
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-2 shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle space-y-3 text-xs">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Desserts)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
            />
            <input
              type="text"
              placeholder="Short Description"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary dark:hover:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-forest/90"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-forest/10 dark:bg-forest/30 flex items-center justify-center text-forest dark:text-sage font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-brandText-primary dark:text-cream">
                    {cat.name}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cream-100 dark:bg-brandBorder-dark/40 text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark">
                  {cat.itemsCount} dishes
                </span>
              </div>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-between items-center text-xs">
              <span className="text-brandText-secondary dark:text-brandText-darkSecondary text-[11px]">Active in Menu</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
