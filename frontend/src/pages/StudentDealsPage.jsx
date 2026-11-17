import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Input } from "../components/Input";
import { useToast } from "../components/Toast";

const categories = [
  { key: "", label: "All Categories" },
  { key: "food", label: "Food & Dining" },
  { key: "transport", label: "Transport" },
  { key: "tech", label: "Technology" },
  { key: "books", label: "Books & Study" },
  { key: "phone", label: "Mobile & Data" },
  { key: "other", label: "Other" },
];

export function StudentDealsPage() {
  const [deals, setDeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Submission state
  const { user } = useAuth();
  const { push } = useToast();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealCategory, setDealCategory] = useState("food");
  const [dealDescription, setDealDescription] = useState("");
  const [dealDiscount, setDealDiscount] = useState("");
  const [dealProvider, setDealProvider] = useState("");
  const [dealLocation, setDealLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const catParam = selectedCategory ? `&category=${selectedCategory}` : "";
      const qParam = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
      const res = await apiFetch(`/api/deals?${catParam}${qParam}`);
      setDeals(res.deals || []);
    } catch (err) {
      console.error("Error loading deals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDeals();
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!dealTitle || !dealDiscount) {
      push({ title: "Incomplete deal", description: "Title and discount are required.", tone: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/deals", {
        method: "POST",
        body: JSON.stringify({
          title: dealTitle,
          category: dealCategory,
          description: dealDescription,
          discount: dealDiscount,
          provider: dealProvider,
          location: dealLocation,
        }),
      });
      push({
        title: "Deal shared",
        description: "Your student deal has been published.",
        tone: "success",
      });
      setShowSubmitModal(false);
      setDealTitle("");
      setDealDescription("");
      setDealDiscount("");
      setDealProvider("");
      setDealLocation("");
      fetchDeals();
    } catch (err) {
      push({ title: "Error submitting deal", description: err.message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Student Discounts in Fiji</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified student savings across USP, FNU, UniFiji, bus passes, and campus retailers.
          </p>
        </div>
        {user && (
          <Button variant="secondary" size="sm" onClick={() => setShowSubmitModal(!showSubmitModal)}>
            {showSubmitModal ? "Cancel Submission" : "Share a Student Deal"}
          </Button>
        )}
      </div>

      {/* Submission Form */}
      {showSubmitModal && (
        <Card className="border-black">
          <CardHeader>
            <CardTitle>Post a Student Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Deal Title"
                  placeholder="e.g. 10% Off Bus Card Top-Up"
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={dealCategory}
                    onChange={(e) => setDealCategory(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm bg-white text-neutral-900 focus:outline-none focus:border-black"
                  >
                    {categories.filter((c) => c.key).map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Discount Offered"
                  placeholder="e.g. Save $2.00 / 15% off"
                  value={dealDiscount}
                  onChange={(e) => setDealDiscount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Provider / Business Name"
                  placeholder="e.g. Campus Cafeteria, Vodafone, Post Fiji"
                  value={dealProvider}
                  onChange={(e) => setDealProvider(e.target.value)}
                />
                <Input
                  label="Location"
                  placeholder="e.g. Laucala Campus, Suva, Nadi"
                  value={dealLocation}
                  onChange={(e) => setDealLocation(e.target.value)}
                />
              </div>

              <Input
                label="Conditions or Instructions"
                placeholder="e.g. Valid student ID required upon payment."
                value={dealDescription}
                onChange={(e) => setDealDescription(e.target.value)}
              />

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
                  {submitting ? "Publishing..." : "Publish Deal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <Input
            placeholder="Search deals, providers, or locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                selectedCategory === cat.key
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <Card key={deal.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wide font-medium text-neutral-500">
                    {deal.category}
                  </span>
                  {deal.is_verified ? (
                    <span className="text-[10px] uppercase font-bold border border-neutral-400 px-1 py-0.5 rounded text-neutral-800">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase border border-neutral-200 px-1 py-0.5 rounded text-neutral-500">
                      Community
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-black mb-1.5">{deal.title}</h3>
                <p className="text-xs text-neutral-600 mb-3">{deal.description}</p>
              </div>

              <div className="border-t border-neutral-100 pt-3 mt-2">
                <div className="text-sm font-bold text-neutral-900">{deal.discount}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {deal.provider && <span>{deal.provider} &bull; </span>}
                  {deal.location}
                </div>
                {deal.expiry_date && (
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Valid until {new Date(deal.expiry_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center text-xs text-neutral-500 border border-neutral-200 rounded p-6 bg-white">
            {loading ? "Loading student deals..." : "No deals match your search criteria."}
          </div>
        )}
      </div>
    </div>
  );
}
