import React from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { Button } from "./Button";
import { APP_NAME, APP_TAGLINE } from "../constants";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/fuel", label: "Fuel Tracker" },
  { to: "/groceries", label: "Grocery Tracker" },
  { to: "/student-deals", label: "Student Deals" },
  { to: "/budget", label: "Budget Calculator" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-base font-bold tracking-tight text-black">
              {APP_NAME}
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      isActive
                        ? "bg-neutral-100 text-black font-semibold"
                        : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="text-xs"
                >
                  Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-xs"
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs"
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="text-xs"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-neutral-100 px-4 py-2 flex space-x-2 overflow-x-auto text-xs">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-2.5 py-1 whitespace-nowrap rounded ${
                  isActive
                    ? "bg-neutral-100 text-black font-semibold"
                    : "text-neutral-600 hover:text-black"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-neutral-800">{APP_NAME}</span> &mdash;{" "}
            {APP_TAGLINE} Hyperlocal financial savings platform for Fiji.
          </div>
          <div>&copy; {new Date().getFullYear()} SaveMore Fiji. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
