import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Input } from "../components/Input";
import { useToast } from "../components/Toast";

export function GroceryPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("sale");
  const [prices, setPrices] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission state
  const { user } = useAuth();
  const { push } = useToast();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [originalPriceInput, setOriginalPriceInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchGroceryPrices = async () => {
    setLoading(true);
    try {
      const qParam = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
      const res = await apiFetch(`/api/groceries/prices?sort=${sort}${qParam}`);
      setPrices(res.prices || []);
    } catch (err) {
      console.error("Error fetching grocery prices:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [storesRes, itemsRes] = await Promise.all([
        apiFetch("/api/groceries/stores"),
        apiFetch("/api/groceries/items"),
      ]);
      setStores(storesRes.stores || []);
      setItems(itemsRes.items || []);
      if (storesRes.stores?.length > 0) setSelectedStoreId(storesRes.stores[0].id.toString());
      if (itemsRes.items?.length > 0) setSelectedItemId(itemsRes.items[0].id.toString());
    } catch (err) {
      console.error("Error fetching grocery metadata:", err);
    }
  };

  useEffect(() => {
    fetchGroceryPrices();
  }, [sort]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroceryPrices();
  };

  const cheapestBasket = useMemo(() => {
    const byItem = new Map();
    for (const p of prices) {
      if (!p.item) continue;
      const key = p.item.id;
      const current = byItem.get(key);
      if (current === undefined || p.price < current) {
        byItem.set(key, p.price);
      }
    }
    return Array.from(byItem.values()).reduce((sum, v) => sum + v, 0);
  }, [prices]);

  const handleSubmitPrice = async (e) => {
    e.preventDefault();
    if (!priceInput) {
      push({ title: "Incomplete details", description: "Price is required.", tone: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/groceries/prices", {
        method: "POST",
        body: JSON.stringify({
          item_id: parseInt(selectedItemId, 10),
          store_id: parseInt(selectedStoreId, 10),
          price: parseFloat(priceInput),
          is_on_sale: isOnSale,
          original_price: originalPriceInput ? parseFloat(originalPriceInput) : null,
        }),
      });
      push({
        title: "Price submitted",
        description: "Your grocery price was submitted for moderation.",
        tone: "success",
      });
      setShowSubmitModal(false);
      setPriceInput("");
      setOriginalPriceInput("");
      setIsOnSale(false);
    } catch (err) {
      push({ title: "Submission failed", description: err.message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Fiji Grocery Tracker</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Compare essential grocery items, calculate basket totals, and find sales in supermarkets.
          </p>
        </div>
        {user && (
          <Button variant="secondary" size="sm" onClick={() => setShowSubmitModal(!showSubmitModal)}>
            {showSubmitModal ? "Cancel Submission" : "Submit Grocery Price"}
          </Button>
        )}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <Card className="border-black">
          <CardHeader>
            <CardTitle>Submit Supermarket Price</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPrice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-neutral-700 mb-1">
                    Item
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm bg-white text-neutral-900 focus:outline-none focus:border-black"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-neutral-700 mb-1">
                    Store
                  </label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm bg-white text-neutral-900 focus:outline-none focus:border-black"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Price (FJD)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 24.50"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  required
                />

                <Input
                  label="Original Price (if on sale)"
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={originalPriceInput}
                  onChange={(e) => setOriginalPriceInput(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOnSaleCheckbox"
                  checked={isOnSale}
                  onChange={(e) => setIsOnSale(e.target.checked)}
                  className="rounded border-neutral-300 text-black focus:ring-black"
                />
                <label htmlFor="isOnSaleCheckbox" className="text-xs text-neutral-700">
                  Item is on promotional discount / sale
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? "Submitting..." : "Send Price for Approval"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Basket Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-neutral-300">
          <CardHeader>
            <CardTitle>Cheapest Combined Basket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-1">
              ${cheapestBasket.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-500">
              Total when picking each item at its lowest available price across all stores.
            </p>
          </CardContent>
        </Card>

        {/* Filter and Search Bar */}
        <div className="md:col-span-2 flex flex-col justify-end space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
              <Input
                placeholder="Search items, categories, or stores..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary" size="sm">
                Search
              </Button>
            </form>

            <div className="flex items-center space-x-1 border border-neutral-200 rounded p-0.5 bg-neutral-50 self-start sm:self-auto">
              <span className="text-[11px] font-medium text-neutral-500 px-2">Sort:</span>
              <button
                type="button"
                onClick={() => setSort("sale")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  sort === "sale" ? "bg-black text-white" : "text-neutral-700 hover:text-black"
                }`}
              >
                Weekly Deals
              </button>
              <button
                type="button"
                onClick={() => setSort("cheapest")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  sort === "cheapest" ? "bg-black text-white" : "text-neutral-700 hover:text-black"
                }`}
              >
                Cheapest
              </button>
              <button
                type="button"
                onClick={() => setSort("store")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  sort === "store" ? "bg-black text-white" : "text-neutral-700 hover:text-black"
                }`}
              >
                By Store
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Groceries Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Item & Unit</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Deal Status</th>
                  <th className="py-3 px-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {prices.length > 0 ? (
                  prices.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{p.item?.name}</div>
                        <div className="text-[11px] text-neutral-400">{p.item?.unit}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-neutral-600">
                        {p.item?.category}
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-800">
                        {p.store?.name}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{p.store?.location}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-black">${p.price.toFixed(2)}</div>
                        {p.original_price && (
                          <div className="text-[10px] text-neutral-400 line-through">
                            ${p.original_price.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.is_on_sale ? (
                          <span className="border border-neutral-400 text-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            On Sale
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-400">
                        {p.submitted_at
                          ? new Date(p.submitted_at).toLocaleDateString()
                          : "Recently"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-neutral-500">
                      {loading ? "Loading grocery prices..." : "No items match your criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
