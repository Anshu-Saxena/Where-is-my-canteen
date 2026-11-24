import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Upload,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { formatCurrency } from '../../utils/formatters';

export default function OwnerMenuPage() {
  const { getMenuItems, loadMenuItems, toggleAvailability: toggleItemAvailability, addItem, updateItem, deleteItem } = useMenu();
  const items = getMenuItems('canteen-1');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadMenuItems('canteen-1').catch(error => setActionError(error.message));
  }, [loadMenuItems]);

  // New item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Beverages');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
  );

  const toggleAvailability = async itemId => {
    try {
      await toggleItemAvailability(itemId);
      setActionError('');
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDelete = async itemId => {
    if (confirm('Are you sure you want to remove this dish from today\'s menu?')) {
      try {
        await deleteItem(itemId);
        setActionError('');
      } catch (error) {
        setActionError(error.message);
      }
    }
  };

  const handleSaveNewItem = async e => {
    e.preventDefault();
    const created = {
      id: `item-${Date.now()}`,
      canteenId: 'canteen-1',
      name: newItemName,
      price: parseFloat(newItemPrice) || 50,
      category: newItemCategory,
      isVeg: newItemIsVeg,
      description: newItemDesc || 'Freshly prepared on campus counter.',
      image: newItemImage,
      available: true,
      rating: 4.8,
      customizations: []
    };

    try {
      await addItem(created);
      setActionError('');
      setIsAddModalOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDesc('');
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleSaveEdit = async e => {
    e.preventDefault();
    try {
      await updateItem(editingItem.id, editingItem);
      setActionError('');
      setEditingItem(null);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const filteredItems = items.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    it.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
            Food Menu & Availability
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Manage your daily specials, prices, and live stock availability
          </p>
        </div>
        {actionError && (
          <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{actionError}</p>
        )}

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-2 shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3 w-4 h-4 text-brandText-secondary dark:text-brandText-darkSecondary" />
        <input
          type="text"
          placeholder="Search items by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs text-brandText-primary dark:text-cream placeholder:text-brandText-secondary dark:placeholder:text-brandText-darkSecondary focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>

      {/* Menu Table / Cards */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brandText-primary dark:text-cream">
            <thead className="bg-cream-100 dark:bg-brandBorder-dark/40 text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider text-[11px] font-semibold border-b border-brandBorder-light dark:border-brandBorder-dark">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-cream-100/50 dark:hover:bg-brandBorder-dark/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-brandBorder-light dark:border-brandBorder-dark"
                      />
                      <div>
                        <p className="font-semibold text-brandText-primary dark:text-cream">{item.name}</p>
                        <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary line-clamp-1 max-w-xs">{item.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-medium text-brandText-secondary dark:text-brandText-darkSecondary">
                    {item.category}
                  </td>

                  <td className="p-4 font-bold text-brandText-primary dark:text-cream">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isVeg
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                        item.available
                          ? 'bg-sage/20 text-forest dark:text-sage border border-sage/40'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200'
                      }`}
                    >
                      <span>{item.available ? 'In Stock' : 'Sold Out'}</span>
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg text-brandText-secondary dark:text-brandText-darkSecondary hover:text-forest dark:hover:text-sage transition"
                        title="Edit Dish"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-brandText-secondary dark:text-brandText-darkSecondary hover:text-red-500 transition"
                        title="Remove Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-brandCard-dark rounded-2xl max-w-md w-full p-6 shadow-xl border border-brandBorder-light dark:border-brandBorder-dark">
            <h3 className="text-lg font-bold text-brandText-primary dark:text-cream mb-4">
              Add Food Item to Counter Menu
            </h3>

            <form onSubmit={handleSaveNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa or Cold Coffee"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="60"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Daily Essentials">Daily Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Dietary Type</label>
                <div className="flex gap-4 text-brandText-primary dark:text-cream">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={newItemIsVeg}
                      onChange={() => setNewItemIsVeg(true)}
                      className="accent-forest"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={!newItemIsVeg}
                      onChange={() => setNewItemIsVeg(false)}
                      className="accent-forest"
                    />
                    <span>Non-Vegetarian</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Ingredients, preparation style..."
                  className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary dark:hover:text-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-forest/90 transition"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-brandCard-dark rounded-2xl max-w-md w-full p-6 shadow-xl border border-brandBorder-light dark:border-brandBorder-dark">
            <h3 className="text-lg font-bold text-brandText-primary dark:text-cream mb-4">
              Edit Dish Details
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Daily Essentials">Daily Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary dark:hover:text-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-forest/90 transition"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
