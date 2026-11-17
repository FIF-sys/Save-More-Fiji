import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";

export function AdminPage() {
  const { push } = useToast();
  const [submissions, setSubmissions] = useState({ fuel_prices: [], grocery_prices: [] });
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/submissions");
      setSubmissions(data);
    } catch (err) {
      push({ title: "Admin data error", description: err.message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (type, id) => {
    try {
      await apiFetch(`/api/admin/submissions/${type}/${id}/approve`, { method: "POST" });
      push({ title: "Approved", description: `${type} price was verified and published.`, tone: "success" });
      fetchSubmissions();
    } catch (err) {
      push({ title: "Action failed", description: err.message, tone: "error" });
    }
  };

  const handleReject = async (type, id) => {
    try {
      await apiFetch(`/api/admin/submissions/${type}/${id}/reject`, { method: "POST" });
      push({ title: "Rejected", description: `${type} submission has been removed.`, tone: "info" });
      fetchSubmissions();
    } catch (err) {
      push({ title: "Action failed", description: err.message, tone: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-black">Admin Moderation Console</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Review, approve, or reject user-submitted prices before public listing.
        </p>
      </div>

      {/* Fuel Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pending Fuel Price Updates ({submissions.fuel_prices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.fuel_prices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold uppercase">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Station ID</th>
                    <th className="py-2.5 px-3">Petrol</th>
                    <th className="py-2.5 px-3">Diesel</th>
                    <th className="py-2.5 px-3">Premium</th>
                    <th className="py-2.5 px-3">Submitted By</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {submissions.fuel_prices.map((fp) => (
                    <tr key={fp.id}>
                      <td className="py-2.5 px-3 font-mono text-neutral-500">{fp.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-black">Station #{fp.station_id}</td>
                      <td className="py-2.5 px-3 font-bold text-black">${fp.petrol_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3">${fp.diesel_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        {fp.premium_price ? `$${fp.premium_price.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">User #{fp.submitted_by}</td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove("fuel", fp.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject("fuel", fp.id)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-500">
              {loading ? "Checking submissions..." : "No fuel prices awaiting moderation."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grocery Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pending Grocery Price Updates ({submissions.grocery_prices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.grocery_prices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold uppercase">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Item ID</th>
                    <th className="py-2.5 px-3">Store ID</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Sale</th>
                    <th className="py-2.5 px-3">Submitted By</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {submissions.grocery_prices.map((gp) => (
                    <tr key={gp.id}>
                      <td className="py-2.5 px-3 font-mono text-neutral-500">{gp.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-black">Item #{gp.item_id}</td>
                      <td className="py-2.5 px-3 text-neutral-700">Store #{gp.store_id}</td>
                      <td className="py-2.5 px-3 font-bold text-black">${gp.price.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        {gp.is_on_sale ? (
                          <span className="border border-neutral-400 px-1 py-0.5 rounded text-[10px] font-bold">
                            Sale (${gp.original_price?.toFixed(2) || "—"})
                          </span>
                        ) : (
                          "Standard"
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">User #{gp.submitted_by}</td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove("grocery", gp.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject("grocery", gp.id)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-500">
              {loading ? "Checking submissions..." : "No grocery prices awaiting moderation."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
