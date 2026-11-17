import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <Card>
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-neutral-600">
            The page you requested does not exist or may have been relocated.
          </p>
          <Link to="/">
            <Button variant="primary" size="sm">
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
