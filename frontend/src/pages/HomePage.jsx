import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Input } from "../components/Input";

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cheapestFuel, setCheapestFuel] = useState(null);
  const [topGroceryDeals, setTopGroceryDeals] = useState([]);
  const [studentDeals, setStudentDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [fuelRes, groceryRes, dealsRes] = await Promise.allSettled([
          apiFetch("/api/fuel/prices?sort=cheapest"),
          apiFetch("/api/groceries/prices?sort=sale"),
          apiFetch("/api/deals"),
        ]);

        if (fuelRes.status === "fulfilled" && fuelRes.value?.prices?.length > 0) {
          setCheapestFuel(fuelRes.value.prices[0]);
        }
        if (groceryRes.status === "fulfilled" && groceryRes.value?.prices?.length > 0) {
          setTopGroceryDeals(groceryRes.value.prices.slice(0, 3));
        }
        if (dealsRes.status === "fulfilled" && dealsRes.value?.deals?.length > 0) {
          setStudentDeals(dealsRes.value.deals.slice(0, 2));
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/fuel?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-white border border-neutral-200 rounded p-6 md:p-10">
        <div className="max-w-2xl">
          <span className="inline-block border border-neutral-300 text-neutral-800 text-xs px-2.5 py-0.5 rounded font-medium mb-3">
            Fiji Local Price Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black mb-3">
            Track prices. Compare locally. Save money across Fiji.
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            Real-time monitoring of fuel stations, supermarket grocery prices, and verified student discounts in Suva, Nausori, Nadi, and Lautoka.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mb-4">
            <Input
              placeholder="Search fuel station or area (e.g. Suva, Mobil, Nadi)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/fuel">
              <Button variant="secondary" size="sm">Fuel Tracker</Button>
            </Link>
            <Link to="/groceries">
              <Button variant="secondary" size="sm">Grocery Tracker</Button>
            </Link>
            <Link to="/student-deals">
              <Button variant="secondary" size="sm">Student Deals</Button>
            </Link>
            <Link to="/budget">
              <Button variant="secondary" size="sm">Budget Tool</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cheapest Petrol */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Cheapest Petrol</CardTitle>
            </CardHeader>
            <CardContent>
              {cheapestFuel ? (
                <div>
                  <div className="text-2xl font-bold text-black mb-1">
                    ${cheapestFuel.petrol_price.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-neutral-500">/ litre</span>
                  </div>
                  <div className="text-sm font-semibold text-neutral-800">
                    {cheapestFuel.station?.name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {cheapestFuel.station?.location} &bull; {cheapestFuel.station?.address}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  {loading ? "Loading fuel data..." : "No fuel price records currently available."}
                </div>
              )}
            </CardContent>
          </div>
          <div className="p-5 pt-0">
            <Link to="/fuel">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all fuel stations &rarr;
              </Button>
            </Link>
          </div>
        </Card>

        {/* Featured Grocery Items */}
        <Card className="md:col-span-2 flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Featured Supermarket Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topGroceryDeals.length > 0 ? (
                  topGroceryDeals.map((deal) => (
                    <div key={deal.id} className="border border-neutral-200 rounded p-3 bg-white">
                      <div className="text-xs font-semibold text-neutral-900 truncate">
                        {deal.item?.name}
                      </div>
                      <div className="text-xs text-neutral-500 mb-2 truncate">
                        {deal.store?.name}
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-bold text-black">
                          ${deal.price.toFixed(2)}
                        </span>
                        {deal.original_price && (
                          <span className="text-xs text-neutral-400 line-through">
                            ${deal.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {deal.is_on_sale && (
                        <span className="inline-block mt-2 border border-neutral-300 text-neutral-700 text-[10px] px-1.5 py-0.2 rounded font-medium">
                          Sale
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-xs text-neutral-500">
                    {loading ? "Loading grocery prices..." : "No supermarket deals recorded."}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
          <div className="p-5 pt-0">
            <Link to="/groceries">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View full grocery comparison &rarr;
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Student Discounts & Budget Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Student Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studentDeals.length > 0 ? (
                studentDeals.map((deal) => (
                  <div key={deal.id} className="border border-neutral-200 rounded p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-neutral-900">{deal.title}</span>
                      {deal.is_verified ? (
                        <span className="text-[10px] uppercase font-bold border border-neutral-400 px-1 py-0.5 rounded text-neutral-700 shrink-0">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-medium border border-neutral-200 px-1 py-0.5 rounded text-neutral-500 shrink-0">
                          Community
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">{deal.description}</p>
                    <div className="text-xs font-semibold text-black">{deal.discount}</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {deal.provider} &bull; {deal.location}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-neutral-500">
                  {loading ? "Loading deals..." : "No student deals available."}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link to="/student-deals">
                <Button variant="secondary" size="sm">Browse all student deals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Budget Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                Calculate your monthly expenses including fuel, groceries, housing, and utilities against your income in Fijian Dollars.
              </p>
              <div className="border border-neutral-200 rounded p-3 bg-neutral-50 text-xs space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Average Grocery Basket:</span>
                  <span className="font-semibold text-black">$39.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target Savings Ratio:</span>
                  <span className="font-semibold text-black">10% - 20%</span>
                </div>
              </div>
            </CardContent>
          </div>
          <div className="p-5 pt-0">
            <Link to="/budget">
              <Button variant="primary" size="sm" className="w-full">
                Open Budget Tool
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Informational Section */}
      <section className="border border-neutral-200 rounded p-6 bg-white">
        <h2 className="text-sm font-semibold text-black mb-3">Community-Sourced Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600">
          <div>
            <span className="font-medium text-neutral-900 block mb-1">Coverage Areas</span>
            Prices and deals are tracked across Greater Suva, Nausori corridor, Nadi International area, and Lautoka City.
          </div>
          <div>
            <span className="font-medium text-neutral-900 block mb-1">Verification System</span>
            User-submitted updates undergo review to maintain accurate fuel rates and current supermarket specials.
          </div>
          <div>
            <span className="font-medium text-neutral-900 block mb-1">Financial Privacy</span>
            Budget calculations run locally in your browser. Personal finances are never transmitted without explicit account saving.
          </div>
        </div>
      </section>
    </div>
  );
}
