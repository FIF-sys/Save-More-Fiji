import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Input } from "../components/Input";
import { useToast } from "../components/Toast";

export function FuelPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("cheapest");
  const [prices, setPrices] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission form state
  const { user } = useAuth();
  const { push } = useToast();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState("");
  const [petrolInput, setPetrolInput] = useState("");
  const [dieselInput, setDieselInput] = useState("");
  const [premiumInput, setPremiumInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFuelPrices = async () => {
    setLoading(true);
    try {
      const qParam = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
      const res = await apiFetch(`/api/fuel/prices?sort=${sort}${qParam}`);
      setPrices(res.prices || []);
    } catch (err) {
      console.error("Error fetching fuel prices:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await apiFetch("/api/fuel/stations");
      setStations(res.stations || []);
      if (res.stations?.length > 0) {
        setSelectedStationId(res.stations[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
    }
  };

  useEffect(() => {
    fetchFuelPrices();
  }, [sort]);

  useEffect(() => {
    fetchStations();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
    fetchFuelPrices();
  };

  const handleSubmitPrice = async (e) => {
    e.preventDefault();
    if (!petrolInput || !dieselInput) {
      push({ title: "Incomplete details", description: "Petrol and Diesel prices are required.", tone: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/fuel/prices", {
        method: "POST",
        body: JSON.stringify({
          station_id: parseInt(selectedStationId, 10),
          petrol_price: parseFloat(petrolInput),
          diesel_price: parseFloat(dieselInput),
          premium_price: premiumInput ? parseFloat(premiumInput) : null,
        }),
      });
      push({
        title: "Price submitted",
        description: "Your update has been submitted for admin verification.",
        tone: "success",
      });
      setShowSubmitModal(false);
      setPetrolInput("");
      setDieselInput("");
      setPremiumInput("");
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
          <h1 className="text-xl font-bold tracking-tight text-black">Fiji Fuel Price Tracker</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Compare regulated and retail fuel rates across service stations in Fiji.
          </p>
        </div>
        {user && (
          <Button variant="secondary" size="sm" onClick={() => setShowSubmitModal(!showSubmitModal)}>
            {showSubmitModal ? "Cancel Submission" : "Submit Price Update"}
          </Button>
        )}
      </div>

      {/* Submission Panel */}
      {showSubmitModal && (
        <Card className="border-black">
          <CardHeader>
            <CardTitle>Submit Station Price Update</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPrice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-neutral-700 mb-1">
                    Select Station
                  </label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm bg-white text-neutral-900 focus:outline-none focus:border-black"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Petrol Price ($/L)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2.89"
                  value={petrolInput}
                  onChange={(e) => setPetrolInput(e.target.value)}
                  required
                />
                <Input
                  label="Diesel Price ($/L)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2.65"
                  value={dieselInput}
                  onChange={(e) => setDieselInput(e.target.value)}
                  required
                />
                <Input
                  label="Premium Price ($/L)"
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={premiumInput}
                  onChange={(e) => setPremiumInput(e.target.value)}
                />
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
                  {submitting ? "Submitting..." : "Send for Review"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <Input
            placeholder="Search by station or area..."
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
            onClick={() => setSort("cheapest")}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              sort === "cheapest" ? "bg-black text-white" : "text-neutral-700 hover:text-black"
            }`}
          >
            Cheapest
          </button>
          <button
            type="button"
            onClick={() => setSort("highest")}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              sort === "highest" ? "bg-black text-white" : "text-neutral-700 hover:text-black"
            }`}
          >
            Highest
          </button>
          <button
            type="button"
            onClick={() => setSort("rating")}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              sort === "rating" ? "bg-black text-white" : "text-neutral-700 hover:text-black"
            }`}
          >
            Rating
          </button>
        </div>
      </div>

      {/* Prices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Petrol (FJD)</th>
                  <th className="py-3 px-4">Diesel (FJD)</th>
                  <th className="py-3 px-4">Premium (FJD)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {prices.length > 0 ? (
                  prices.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{item.station?.name}</div>
                        <div className="text-[11px] text-neutral-400">{item.station?.address}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-700">
                        {item.station?.location}
                      </td>
                      <td className="py-3 px-4 font-bold text-black">
                        ${item.petrol_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-800">
                        ${item.diesel_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {item.premium_price ? `$${item.premium_price.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {item.station?.is_verified ? (
                          <span className="border border-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-semibold text-neutral-700">
                            Verified
                          </span>
                        ) : (
                          <span className="border border-neutral-200 px-1.5 py-0.5 rounded text-[10px] text-neutral-500">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-400">
                        {item.submitted_at
                          ? new Date(item.submitted_at).toLocaleDateString()
                          : "Recently"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-neutral-500">
                      {loading ? "Loading fuel prices..." : "No fuel price records match your criteria."}
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
