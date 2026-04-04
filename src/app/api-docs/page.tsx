"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then(setSpec);
  }, []);

  if (!spec) return <div style={{ padding: 32, fontFamily: "sans-serif" }}>Loading...</div>;

  return (
    <div style={{ margin: 0, padding: 0, colorScheme: "light" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}
