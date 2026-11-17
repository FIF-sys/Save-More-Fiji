import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ToastProvider } from "./components/Toast";

import { HomePage } from "./pages/HomePage";
import { FuelPage } from "./pages/FuelPage";
import { GroceryPage } from "./pages/GroceryPage";
import { StudentDealsPage } from "./pages/StudentDealsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/groceries" element={<GroceryPage />} />
          <Route path="/student-deals" element={<StudentDealsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
