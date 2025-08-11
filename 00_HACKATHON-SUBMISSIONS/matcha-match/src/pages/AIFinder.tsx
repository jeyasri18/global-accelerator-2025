import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AIFinder() {
  const [bestSpot, setBestSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function findBestSpot() {
      setLoading(true);
      // Simulate AI-powered loading delay
      await new Promise((r) => setTimeout(r, 1800));
      setBestSpot({
        name: "Matcha Blossom Café",
        address: "42 Green Tea Lane",
        rating: 4.9,
        description:
          "Sip, relax, repeat 🍵 — the coziest nook with the creamiest matcha magic!",
      });
      setLoading(false);
    }
    findBestSpot();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 p-4">
        <p className="text-green-700 text-xl font-semibold animate-pulse">
          🍵 Brewing your perfect matcha spot...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8 text-center">
        <h2 className="text-4xl font-extrabold text-green-800 mb-4 tracking-wide">
          Your Matcha Match is Here!
        </h2>
        <h3 className="text-2xl font-semibold text-green-700 mb-2">
          {bestSpot.name}
        </h3>
        <p className="text-green-600 mb-1 italic">{bestSpot.description}</p>
        <p className="text-green-700 font-medium mt-3">
          📍 {bestSpot.address}
        </p>
        <p className="text-green-700 font-medium mb-6">
          ⭐ {bestSpot.rating} — Highly Rated!
        </p>

        <button
          onClick={() => navigate("/home")}
          className="bg-green-600 hover:bg-green-700 transition text-white font-bold py-3 px-8 rounded-full shadow-lg"
        >
          View All Matcha Spots
        </button>
      </div>
      <p className="mt-8 text-green-700 font-light text-sm">
        Powered by your vibe & a sprinkle of AI magic ✨
      </p>
    </div>
  );
}
