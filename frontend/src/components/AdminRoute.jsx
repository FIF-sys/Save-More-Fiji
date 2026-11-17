import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { ProtectedRoute } from "./ProtectedRoute";

export function AdminRoute({ children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user && user.role === "admin" ? (
        children
      ) : (
        <div className="max-w-xl mx-auto py-12 text-center">
          <div className="border border-neutral-200 bg-white p-6 rounded">
            <h2 className="text-base font-semibold mb-2">Admin Access Required</h2>
            <p className="text-sm text-neutral-600 mb-4">
              Your account does not have permission to view this page.
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
