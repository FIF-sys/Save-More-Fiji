import React, { useState, useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Input } from "../components/Input";
import { useToast } from "../components/Toast";

// High-contrast clean neutral palette suitable for professional UI
const PIE_COLORS = ["#171717", "#525252", "#737373", "#a3a3a3", "#d4d4d4", "#262626", "#404040", "#000000"];

export function BudgetPage() {
  const { user } = useAuth();
  const { push } = useToast();

  const [income, setIncome] = useState(2500);
  const [fuel, setFuel] = useState(250);
  const [groceries, setGroceries] = useState(650);
  const [rent, setRent] = useState(900);
  const [bills, setBills] = useState(220);
  const [transport, setTransport] = useState(120);
  const [entertainment, setEntertainment] = useState(100);
  const [other, setOther] = useState(90);
  const [savingsGoal, setSavingsGoal] = useState(250);
  const [savingToServer, setSavingToServer] = useState(false);

  const totalExpenses = useMemo(() => {
    return fuel + groceries + rent + bills + transport + entertainment + other;
  }, [fuel, groceries, rent, bills, transport, entertainment, other]);

  const netBalance = useMemo(() => {
    return income - totalExpenses - savingsGoal;
  }, [income, totalExpenses, savingsGoal]);

  const chartData = useMemo(() => {
    return [
      { name: "Fuel", value: fuel },
      { name: "Groceries", value: groceries },
      { name: "Rent & Housing", value: rent },
      { name: "Utilities & Bills", value: bills },
      { name: "Transport", value: transport },
      { name: "Entertainment", value: entertainment },
      { name: "Other", value: other },
      { name: "Savings Goal", value: savingsGoal },
    ].filter((item) => item.value > 0);
  }, [fuel, groceries, rent, bills, transport, entertainment, other, savingsGoal]);

  const handleSaveBudget = async () => {
    if (!user) {
      push({
        title: "Sign in required",
        description: "Please log in to save this budget breakdown to your profile.",
        tone: "info",
      });
      return;
    }

    setSavingToServer(true);
    try {
      await apiFetch("/api/budget", {
        method: "POST",
        body: JSON.stringify({
          income,
          fuel,
          groceries,
          rent,
          bills,
          transport,
          entertainment,
          other,
          savings_goal: savingsGoal,
        }),
      });
      push({
        title: "Budget saved",
        description: "Your monthly plan is stored in your personal account.",
        tone: "success",
      });
    } catch (err) {
      push({ title: "Failed to save budget", description: err.message, tone: "error" });
    } finally {
      setSavingToServer(false);
    }
  };

  const setTenPercentSavings = () => {
    setSavingsGoal(Math.round(income * 0.1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Fiji Monthly Budget Calculator</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Plan your personal cash flow based on local fuel, grocery, and living costs in Fijian Dollars (FJD).
          </p>
        </div>
        {user && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveBudget}
            disabled={savingToServer}
          >
            {savingToServer ? "Saving..." : "Save Budget to Profile"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form Column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Figures (FJD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                label="Monthly Income"
                type="number"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
              />

              <div className="border-t border-neutral-100 pt-3">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                  Essential Living Costs
                </span>
                <div className="space-y-3">
                  <Input
                    label="Rent & Housing"
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Input
                    label="Groceries"
                    type="number"
                    value={groceries}
                    onChange={(e) => setGroceries(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Input
                    label="Fuel"
                    type="number"
                    value={fuel}
                    onChange={(e) => setFuel(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Input
                    label="Public Transport"
                    type="number"
                    value={transport}
                    onChange={(e) => setTransport(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Input
                    label="Electricity & Bills"
                    type="number"
                    value={bills}
                    onChange={(e) => setBills(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                  Discretionary & Goals
                </span>
                <div className="space-y-3">
                  <Input
                    label="Entertainment & Leisure"
                    type="number"
                    value={entertainment}
                    onChange={(e) => setEntertainment(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Input
                    label="Other Expenses"
                    type="number"
                    value={other}
                    onChange={(e) => setOther(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Input
                    label="Savings Target"
                    type="number"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={setTenPercentSavings}
                    className="w-full text-xs"
                  >
                    Set savings target to 10% of income (${Math.round(income * 0.1)})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown and Analytics Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Total Expenses
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                ${totalExpenses.toFixed(2)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {income > 0 ? `${((totalExpenses / income) * 100).toFixed(0)}% of income` : "—"}
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Savings Allocation
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                ${savingsGoal.toFixed(2)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {income > 0 ? `${((savingsGoal / income) * 100).toFixed(0)}% of income` : "—"}
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Net Discretionary
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  netBalance < 0 ? "text-red-700" : "text-black"
                }`}
              >
                ${netBalance.toFixed(2)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {netBalance < 0 ? "Deficit" : "Remaining buffer"}
              </div>
            </Card>
          </div>

          {/* Allocation Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={55}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `$${Number(val).toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-neutral-100 justify-center text-xs">
                {chartData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center space-x-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-neutral-700">{entry.name}:</span>
                    <span className="font-semibold text-black">${entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Practical Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Local Cost Optimization Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-neutral-700 space-y-2 list-disc pl-4">
                {groceries > income * 0.3 && (
                  <li>
                    Grocery spending represents more than 30% of total income. Review the{" "}
                    <strong>Grocery Tracker</strong> to align with weekly promotional deals at MHCC or RB Patel.
                  </li>
                )}
                {fuel > income * 0.15 && (
                  <li>
                    Fuel costs exceed 15% of your income. Consider route batching or comparing prices on the{" "}
                    <strong>Fuel Tracker</strong>.
                  </li>
                )}
                {netBalance < 0 && (
                  <li className="text-red-700 font-medium">
                    Your monthly expenses and savings target currently exceed your net income by $
                    {Math.abs(netBalance).toFixed(2)}. Adjust discretionary categories or rebalance savings.
                  </li>
                )}
                {netBalance >= 200 && (
                  <li>
                    You maintain a healthy cash surplus of ${netBalance.toFixed(2)}. You can allocate a portion into high-interest term deposits or emergency reserves.
                  </li>
                )}
                <li>
                  Budget calculations are processed in your browser and comply with local Fiji FJD spending benchmarks.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
