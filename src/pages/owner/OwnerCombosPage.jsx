import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Check, X, Sparkles, Package, AlertTriangle } from 'lucide-react';
import { useCombos } from '../../contexts/ComboContext';
import { useMenu } from '../../contexts/MenuContext';
import { formatCurrency } from '../../utils/formatters';

const OWNER_CANTEEN_ID = 'canteen-1';

const EMPTY_FORM = {
  name: '',
  description: '',
  image: '',
  price: '',
  quantities: {} // { [itemId]: qty }
};

/**
 * Owner management for Combo Meals.
 * Combos bundle real menu items at a single (lower) price. Availability is
 * derived automatically: a combo is unavailable if any component item is sold
 * out. No demo combos are seeded — owners create them here.
 */
export default function OwnerCombosPage() {
  const { getCombos, loadCombos, addCombo, updateCombo, deleteCombo, toggleComboAvailability, getComboPricing, getComboAvailability } = useCombos();
  const { getMenuItems, getItemById, loadMenuItems } = useMenu();

  const combos = getCombos(OWNER_CANTEEN_ID);
  const items = getMenuItems(OWNER_CANTEEN_ID);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    Promise.all([
      loadMenuItems(OWNER_CANTEEN_ID),
      loadCombos(OWNER_CANTEEN_ID)
    ]).catch(error => setActionError(error.message));
  }, [loadCombos, loadMenuItems]);

  // Live preview pricing for the item selection in the form
  const selectedLines = Object.entries(form.quantities)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, quantity]) => ({ itemId, quantity }));
  const originalPrice = selectedLines.reduce((sum, line) => {
    const item = getItemById(line.itemId);
    return sum + (item ? item.price * line.quantity : 0);
  }, 0);
  const previewPrice = parseFloat(form.price) || 0;
  const previewSavings = Math.max(0, originalPrice - previewPrice);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (combo) => {
    const quantities = {};
    (combo.items || []).forEach(line => {
      quantities[line.itemId] = line.quantity;
    });
    setEditingId(combo.id);
    setForm({
      name: combo.name,
      description: combo.description || '',
      image: combo.image || '',
      price: String(combo.price),
      quantities
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleQtyChange = (itemId, delta) => {
    setForm(prev => {
      const next = Math.max(0, (prev.quantities[itemId] || 0) + delta);
      return { ...prev, quantities: { ...prev.quantities, [itemId]: next } };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Please enter a combo name.');
      return;
    }
    if (selectedLines.length < 2) {
      setFormError('A combo must include at least 2 different items.');
      return;
    }
    if (previewPrice <= 0) {
      setFormError('Please enter a valid combo price.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      price: previewPrice,
      items: selectedLines
    };

    try {
      if (editingId) {
        await updateCombo(editingId, payload);
      } else {
        await addCombo({ canteenId: OWNER_CANTEEN_ID, ...payload });
      }
      setActionError('');
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleDelete = async comboId => {
    if (confirm('Delete this combo meal? Students will no longer see it.')) {
      try {
        await deleteCombo(comboId);
        setActionError('');
      } catch (error) {
        setActionError(error.message);
      }
    }
  };

  const handleToggleAvailability = async comboId => {
    try {
      await toggleComboAvailability(comboId);
      setActionError('');
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-softOrange-500 stroke-[2.2]" />
            Combo Meals
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Bundle items into a value combo. Availability follows the live stock of each item.
          </p>
        </div>
        {actionError && (
          <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{actionError}</p>
        )}
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-2 shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          <span>Create Combo</span>
        </button>
      </div>

      {combos.length === 0 ? (
        <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-dashed border-brandBorder-light dark:border-brandBorder-dark p-10 text-center">
          <Package className="w-10 h-10 mx-auto text-brandText-secondary mb-3" />
          <p className="text-sm font-semibold text-brandText-primary dark:text-cream">No combos yet</p>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Create your first combo to offer students a discounted meal bundle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map(combo => {
            const { originalPrice: full, savings, discountPct } = getComboPricing(combo);
            const { available, unavailableItems } = getComboAvailability(combo);
            return (
              <div key={combo.id} className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle overflow-hidden flex flex-col">
                <div className="relative h-32 bg-cream-200 dark:bg-brandBorder-dark">
                  {combo.image ? (
                    <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-brandText-secondary">
                      <Package className="w-7 h-7" />
                    </div>
                  )}
                  {discountPct > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-softOrange-500 text-white text-2xs font-bold">
                      Save {discountPct}%
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">{combo.name}</h3>
                    <button
                      onClick={() => handleToggleAvailability(combo.id)}
                      className={`shrink-0 px-2 py-0.5 rounded-lg text-2xs font-bold ${
                        combo.available
                          ? 'bg-sage/20 text-forest dark:text-sage'
                          : 'bg-cream-200 dark:bg-brandBorder-dark/50 text-brandText-secondary'
                      }`}
                    >
                      {combo.available ? 'Listed' : 'Hidden'}
                    </button>
                  </div>

                  <ul className="space-y-0.5">
                    {(combo.items || []).map((line, i) => {
                      const item = getItemById(line.itemId);
                      const soldOut = !item || !item.available;
                      return (
                        <li key={i} className={`text-2xs ${soldOut ? 'text-rose-600 dark:text-rose-400' : 'text-brandText-secondary dark:text-brandText-darkSecondary'}`}>
                          {line.quantity}× {item ? item.name : 'Removed item'}{soldOut ? ' (sold out)' : ''}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-bold text-forest dark:text-sage-300">{formatCurrency(combo.price)}</span>
                    {full > combo.price && (
                      <span className="text-2xs text-brandText-secondary line-through">{formatCurrency(full)}</span>
                    )}
                  </div>

                  {!available && (
                    <p className="text-2xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {combo.available
                        ? `Unavailable: ${unavailableItems.join(', ')}`
                        : 'Hidden from students'}
                    </p>
                  )}

                  <div className="mt-auto pt-2 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(combo)}
                      className="flex-1 px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-2xs font-semibold text-brandText-primary dark:text-cream hover:bg-cream-100 dark:hover:bg-brandBorder-dark/40 transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(combo.id)}
                      className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-brandCard-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-brandBorder-light dark:border-brandBorder-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brandText-primary dark:text-cream">
                {editingId ? 'Edit Combo Meal' : 'Create Combo Meal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brandText-secondary hover:text-brandText-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Combo name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Chai + Samosa Combo"
                    className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Combo price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="99"
                    className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description students will see"
                  className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                />
              </div>

              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-1">Image URL (optional)</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
                />
              </div>

              {/* Item picker */}
              <div>
                <label className="block font-medium text-brandText-secondary dark:text-brandText-darkSecondary mb-2">
                  Included items (pick at least 2)
                </label>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-brandBorder-light dark:border-brandBorder-dark divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
                  {items.map(item => {
                    const qty = form.quantities[item.id] || 0;
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-2.5">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-brandText-primary dark:text-cream truncate">{item.name}</p>
                          <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
                            {formatCurrency(item.price)}{!item.available ? ' • sold out' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleQtyChange(item.id, -1)} className="w-7 h-7 rounded-lg border border-brandBorder-light dark:border-brandBorder-dark grid place-items-center font-bold">−</button>
                          <span className="w-5 text-center font-bold text-brandText-primary dark:text-cream">{qty}</span>
                          <button type="button" onClick={() => handleQtyChange(item.id, 1)} className="w-7 h-7 rounded-lg border border-brandBorder-light dark:border-brandBorder-dark grid place-items-center font-bold">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live pricing preview */}
              <div className="rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark p-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-brandText-secondary dark:text-brandText-darkSecondary">
                  Items total: <strong className="text-brandText-primary dark:text-cream">{formatCurrency(originalPrice)}</strong>
                </span>
                <span className="text-brandText-secondary dark:text-brandText-darkSecondary">
                  Combo: <strong className="text-forest dark:text-sage-300">{formatCurrency(previewPrice)}</strong>
                </span>
                <span className="text-brandText-secondary dark:text-brandText-darkSecondary">
                  Student saves: <strong className="text-softOrange-600 dark:text-softOrange-300">{formatCurrency(previewSavings)}</strong>
                </span>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-forest/90 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Save Changes' : 'Create Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
