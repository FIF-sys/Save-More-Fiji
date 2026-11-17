import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";

export function DashboardPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedBudgets() {
      try {
        const res = await apiFetch("/api/budget");
        setBudgets(res.budgets || []);
      } catch (err) {
        console.error("Error loading budgets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSavedBudgets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">
            Welcome, {user?.display_name || "User"}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Member account &bull; {user?.email} &bull; Role:{" "}
            <span className="capitalize font-semibold text-neutral-700">{user?.role}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/budget">
            <Button variant="primary" size="sm">
              New Budget
            </Button>
          </Link>
          <Link to="/fuel">
            <Button variant="secondary" size="sm">
              Check Fuel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saved Budgets Column */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Monthly Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {budgets.map((b) => {
                    const totalExpenses =
                      b.fuel +
                      b.groceries +
                      b.rent +
                      b.bills +
                      b.transport +
                      b.entertainment +
                      b.other;
                    const remaining = b.income - totalExpenses - b.savings_goal;

                    return (
                      <div key={b.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-black">
                            Recorded on {new Date(b.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-neutral-500">
                            Income: <strong className="text-black">${b.income.toFixed(2)}</strong>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-neutral-50 p-2.5 rounded border border-neutral-200">
                          <div>
                            <span className="text-neutral-400 block">Housing:</span>
                            <span className="font-medium text-neutral-800">${b.rent.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block">Groceries:</span>
                            <span className="font-medium text-neutral-800">${b.groceries.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block">Fuel:</span>
                            <span className="font-medium text-neutral-800">${b.fuel.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block">Savings:</span>
                            <span className="font-medium text-neutral-800">${b.savings_goal.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-neutral-500">
                            Total Outflow: ${totalExpenses.toFixed(2)}
                          </span>
                          <span
                            className={`font-semibold ${
                              remaining < 0 ? "text-red-700" : "text-neutral-800"
                            }`}
                          >
                            Buffer: ${remaining.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500">
                  {loading
                    ? "Loading your budgets..."
                    : "You haven't saved any budget plans yet. Head over to the Budget Tool to create one."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile & Quick Navigation Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block">Display Name:</span>
                <span className="font-medium text-black">{user?.display_name}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Email:</span>
                <span className="font-medium text-black">{user?.email}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Joined:</span>
                <span className="font-medium text-neutral-700">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Current Session"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-neutral-600 mb-2">
                Help fellow Fiji residents keep track of rising prices by submitting updates.
              </p>
              <Link to="/fuel" className="block">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Submit Fuel Station Rate
                </Button>
              </Link>
              <Link to="/groceries" className="block">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Submit Supermarket Price
                </Button>
              </Link>
              <Link to="/student-deals" className="block">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Share a Student Deal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
