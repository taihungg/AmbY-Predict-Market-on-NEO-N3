import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WalletConnect from "./WalletConnect";

type Props = {
  darkMode?: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
  onBalanceUpdate?: (balance: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  connected?: boolean;
  onConnectionChange?: (connected: boolean) => void;
};

export default function Header({ 
  darkMode = false, 
  onDarkModeChange, 
  onBalanceUpdate, 
  onLoadingChange,
  connected = false,
  onConnectionChange
}: Props) {
  const [isDark, setIsDark] = useState(darkMode);
  const navigate = useNavigate();

  useEffect(() => {
    setIsDark(darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    onDarkModeChange?.(newValue);
    localStorage.setItem("darkMode", JSON.stringify(newValue));
  };

  return (
    <div
      className={`flex items-center justify-between px-8 py-4 border-b ${
        isDark ? "border-gray-800" : "border-gray-600"
      }`}
    >
      {/* Left: Logo and Branding */}
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <img
          src="/amby-logo-icon.svg"
          alt="AmbY"
          className="h-12 w-auto"
        />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-black"
          }`}
        >
          {isDark ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </>
          )}
        </button>
        <WalletConnect 
          connected={connected} 
          onConnect={(isConnected) => {
            onConnectionChange?.(isConnected);
          }}
          onBalanceUpdate={onBalanceUpdate}
          onLoadingChange={onLoadingChange}
        />
      </div>
    </div>
  );
}
