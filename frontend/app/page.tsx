"use client";

import { useEffect, useState } from "react";

interface HelloResponse {
  message: string;
}

export default function Home() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    
    fetch(`${apiBaseUrl}/api/hello`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: HelloResponse) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Lax Medic - Phase 1
        </h1>
        
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl w-full max-w-md text-center">
          <h2 className="text-xl mb-4 text-slate-400 italic">Backend Response</h2>
          
          {loading && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to Go API...</span>
            </div>
          )}

          {error && (
            <div className="text-red-400 p-4 bg-red-400/10 rounded-lg border border-red-400/20">
              <p className="font-bold">Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {data && (
            <div className="text-2xl font-semibold text-emerald-400 animate-in fade-in zoom-in duration-500">
              {data.message}
            </div>
          )}
        </div>

        <div className="flex gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Frontend: 3000</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Backend: 8080</span>
          </div>
        </div>
      </div>
    </main>
  );
}
