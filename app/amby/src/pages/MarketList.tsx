import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

interface Market {
  id: string;
  name: string;
  description: string;
  status: "active" | "closed" | "pending";
}

type Props = {
  darkMode?: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
};

export default function MarketList({ darkMode = false, onDarkModeChange }: Props) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(darkMode);
  const [markets, setMarkets] = useState<Market[]>([
    {
      id: "1",
      name: "Ethereum — Will it surpass $5,000 by December 31, 2025?",
      description: "This quest will be resolved as Yes if the highest price (High) on the Binance ETH/USDT 1-minute candlestick chart reaches $5,000 or above by 11:59 PM ET on Wednesday, December 31, 2025. Otherwise, it will be resolved as No",
      status: "active",
    },
  ]);

  const handleMarketClick = (marketId: string) => {
    navigate(`/market/${marketId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return isDark
          ? "bg-green-900 text-green-300"
          : "bg-green-100 text-green-800";
      case "closed":
        return isDark ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800";
      case "pending":
        return isDark
          ? "bg-yellow-900 text-yellow-300"
          : "bg-yellow-100 text-yellow-800";
      default:
        return isDark
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-black"
      }`}
    >
      <Header darkMode={isDark} onDarkModeChange={(value) => {
        setIsDark(value);
        onDarkModeChange?.(value);
      }} />

      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Total Volume */}
          <div
            className={`rounded-2xl p-6 border ${
              isDark
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-100 border-slate-400"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3
                className={`text-lg font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Total Volume
              </h3>
              <span className="text-2xl">💵</span>
            </div>
            <div
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              $124,532
            </div>
            <div className="text-green-500 text-sm font-medium">↗ 12.5%</div>
          </div>

          {/* Active Traders */}
          <div
            className={`rounded-2xl p-6 border ${
              isDark
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-100 border-slate-400"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3
                className={`text-lg font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Active Traders
              </h3>
              <span className="text-2xl">👥</span>
            </div>
            <div
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              1,247
            </div>
            <div className="text-blue-400 text-sm font-medium">↗ 8.2%</div>
          </div>
        </div>

        {/* Opening Markets */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Opening Markets</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market) => (
            <div
              key={market.id}
              className={`rounded-2xl p-8 border transition-all flex flex-col ${
                isDark
                  ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                  : "bg-white border-slate-400 hover:border-slate-500"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <h3
                  className={`text-lg font-bold flex-1 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {market.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    market.status === "active"
                      ? "text-green-400 border border-green-400"
                      : market.status === "closed"
                      ? "text-red-400 border border-red-400"
                      : "text-yellow-400 border border-yellow-400"
                  }`}
                >
                  {market.status.charAt(0).toUpperCase() +
                    market.status.slice(1)}
                </span>
              </div>
              <p
                className={`text-sm line-clamp-3 mb-3 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {market.description}
              </p>
              <button
                onClick={() => handleMarketClick(market.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors w-full text-sm"
              >
                Enter Market
              </button>
            </div>
          ))}
        </div>

        {markets.length === 0 && (
          <div className="text-center py-12">
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No markets available at the moment
            </p>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* How It Works */}
            <div
              className={`rounded-2xl p-8 border ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-400"
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>How It Works</h3>
              <p className={`text-base mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Buy shares that represent your prediction. If you're correct, you win!
              </p>
              <a
                href="#"
                className="text-green-400 font-medium hover:text-green-300 transition-colors"
              >
                Learn more →
              </a>
            </div>

            {/* Market Rules */}
            <div
              className={`rounded-2xl p-8 border ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-400"
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>Market Rules</h3>
              <p className={`text-base mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Resolution based on CoinMarketCap data at the specified time.
              </p>
              <a
                href="#"
                className="text-green-400 font-medium hover:text-green-300 transition-colors"
              >
                Read rules →
              </a>
            </div>

            {/* Need Help */}
            <div
              className={`rounded-2xl p-8 border ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-400"
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>Need Help?</h3>
              <p className={`text-base mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Join our community or contact support for assistance.
              </p>
              <a
                href="#"
                className="text-green-400 font-medium hover:text-green-300 transition-colors"
              >
                Get support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
