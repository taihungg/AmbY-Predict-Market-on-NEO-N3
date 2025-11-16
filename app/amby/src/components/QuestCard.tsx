import { useState, useEffect } from "react";
import Header from "./Header";
import { getYesPoint, getNoPoint } from "../handler/readContract";
import { createMarket, voteOnQuest } from "../handler/writeContract";
import { CONTRACT_HASH } from "../utils/address";

type Props = {
  connected: boolean;
  onConnect: (c: boolean) => void;
  darkMode?: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
};

export default function QuestCard({ connected, onConnect, darkMode = false, onDarkModeChange }: Props) {
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
  const [amount, setAmount] = useState<number>(1);
  const [isDark, setIsDark] = useState<boolean>(darkMode);
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);
  const [gasBalance, setGasBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [yesAmount, setYesAmount] = useState<string>("0");
  const [noAmount, setNoAmount] = useState<string>("0");
  const [isLoadingAmounts, setIsLoadingAmounts] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [neolineN3Instance, setNeolineN3Instance] = useState<any>(null);

  const marketId = 1;

  // Initialize NeoLine once on component mount
  useEffect(() => {
    const initializeNeoLine = async () => {
      try {
        const NEOLineN3 = (window as any).NEOLineN3;
        if (NEOLineN3) {
          const instance = new NEOLineN3.Init();
          setNeolineN3Instance(instance);
        }
      } catch (error) {
        console.error("Failed to initialize NeoLine:", error);
      }
    };

    // Check if already loaded
    if ((window as any).NEOLineN3) {
      initializeNeoLine();
    } else {
      // Listen for the ready event
      const handleReady = () => {
        initializeNeoLine();
      };
      window.addEventListener("NEOLine.N3.EVENT.READY", handleReady);
      return () => {
        window.removeEventListener("NEOLine.N3.EVENT.READY", handleReady);
      };
    }
  }, []);

  const handleBalanceUpdate = (balance: string) => {
    // Format the balance for display
    const formattedBalance = parseFloat(balance).toLocaleString("en-US", {
      maximumFractionDigits: 4,
    });
    setGasBalance(formattedBalance);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoadingBalance(loading);
  };

  const getNumericBalance = () => {
    return parseFloat(gasBalance.replace(/,/g, "")) || 0;
  };

  useEffect(() => {
    const fetchAmounts = async () => {
      if (!connected || !neolineN3Instance) {
        setIsLoadingAmounts(false);
        return;
      }

      try {
        setIsLoadingAmounts(true);

        const userAddress = await neolineN3Instance.getAccount();

        const yesPointResult = await getYesPoint(
          neolineN3Instance,
          CONTRACT_HASH,
          userAddress.address,
          marketId
        );
        const noPointResult = await getNoPoint(
          neolineN3Instance,
          CONTRACT_HASH,
          userAddress.address,
          marketId
        );

        if (yesPointResult && Array.isArray(yesPointResult) && yesPointResult.length > 0) {
          setYesAmount(yesPointResult[0].value || "0");
        }
        if (noPointResult && Array.isArray(noPointResult) && noPointResult.length > 0) {
          setNoAmount(noPointResult[0].value || "0");
        }
      } catch (error) {
        console.error("Failed to fetch amounts:", error);
        setYesAmount("0");
        setNoAmount("0");
      } finally {
        setIsLoadingAmounts(false);
      }
    };

    fetchAmounts();
  }, [connected, neolineN3Instance]);

  const exceedsBalance = amount > getNumericBalance();

  const handleDarkModeChange = (newValue: boolean) => {
    setIsDark(newValue);
    onDarkModeChange?.(newValue);
  };

  const handleVote = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedOutcome) {
      alert("Please select an outcome (Yes or No)");
      return;
    }

    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (exceedsBalance) {
      alert("Insufficient balance");
      return;
    }

    if (!neolineN3Instance) {
      alert("NeoLine wallet not initialized");
      return;
    }

    try {
      setIsVoting(true);
      const userAddress = await neolineN3Instance.getAccount();
      
      const txid = await voteOnQuest(
        neolineN3Instance,
        CONTRACT_HASH,
        userAddress.address,
        marketId,
        selectedOutcome as "Yes" | "No",
        amount.toString()
      );

      // const txid = await createMarket(
      //   neolineN3Instance,
      //   CONTRACT_HASH,
      //   userAddress.address,
      // );

      alert(`Vote successful! Transaction ID: ${txid}`);
      // Reset form
      setSelectedOutcome("");
      setAmount(1);
    } catch (error) {
      console.error("Vote failed:", error);
      alert("Vote failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-black"
      }`}
    >
      <Header 
        darkMode={isDark} 
        onDarkModeChange={handleDarkModeChange}
        onBalanceUpdate={handleBalanceUpdate}
        onLoadingChange={handleLoadingChange}
        connected={connected}
        onConnectionChange={onConnect}
      />

      {/* Top Section */}
      <div
        className={`flex gap-8 p-8 border-b ${
          isDark ? "border-gray-800" : "border-gray-600"
        }`}
      >
        {/* Left: Image Card */}
        <div className="w-80 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center flex-shrink-0">
          <img src="https://ethereum.org/images/assets/svgs/eth-diamond-purple.svg" />
        </div>

        {/* Right: Content */}
        <div className="flex-1 flex flex-col">
          <span className="text-green-500 text-sm font-medium mb-3">Open</span>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Ethereum — Will it surpass $5,000 by December 31, 2025?
          </h1>

          <div
            className={`${
              isDark ? "text-gray-400" : "text-gray-700"
            } text-base leading-relaxed`}
          >
            <p className="mb-1">
              This quest will be resolved as "Yes" if the highest price (High)
              on the Binance ETH/USDT 1-minute candlestick chart reaches $5,000
              or above by{" "}
              <span
                className={`${
                  isDark ? "text-white" : "text-black"
                } font-semibold`}
              >
                11:59 PM ET on Wednesday, December 31, 2025
              </span>
              . Otherwise, it will be resolved as "No".
            </p>

            {showFullDescription && (
              <>
                <p className="mb-1">
                  The quest uses{" "}
                  <span
                    className={`${
                      isDark ? "text-white" : "text-black"
                    } font-semibold`}
                  >
                    only the Binance ETH/USDT trading pair
                  </span>
                  . You can check reference prices here:{" "}
                  <a
                    href="https://www.binance.com/en/trade/ETH_USDT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:underline"
                  >
                    https://www.binance.com/en/trade/ETH_USDT
                  </a>
                </p>
                <p className="mb-1">
                  When checking, make sure to select the{" "}
                  <span
                    className={`${
                      isDark ? "text-white" : "text-black"
                    } font-semibold`}
                  >
                    "1m (1-minute)"
                  </span>{" "}
                  chart and verify the{" "}
                  <span
                    className={`${
                      isDark ? "text-white" : "text-black"
                    } font-semibold`}
                  >
                    High
                  </span>{" "}
                  value. Prices from other exchanges or data sources are not
                  considered—only Binance ETH/USDT data is valid. If the price
                  reaches $5,000{" "}
                  <span
                    className={`${
                      isDark ? "text-white" : "text-black"
                    } font-semibold`}
                  >
                    before
                  </span>{" "}
                  the voting deadline, the quest will be immediately canceled.
                </p>
              </>
            )}

            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-green-500 text-sm hover:underline"
            >
              {showFullDescription ? "show less" : "view more"}
            </button>
          </div>
          <p className="mb-1">
            Start time:{" "}
            <span
              className={`${
                isDark ? "text-white" : "text-black"
              } font-semibold text-lg`}
            >
              November 15th, 2025
            </span>
          </p>
          <p className="mb-1">
            End time:{" "}
            <span
              className={`${
                isDark ? "text-white" : "text-black"
              } font-semibold text-lg`}
            >
              November 30th, 2025
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className={`flex items-center border-b ${
          isDark ? "border-gray-800" : "border-gray-900"
        }`}
      >
        {/* Left Sidebar: User Info */}
        <div
          className={`w-80 border-r ${
            isDark ? "border-gray-800" : "border-gray-900"
          } p-8`}
        >
          <div className="text-lg font-bold text-center mb-4">TVL</div>
          <div className="flex justify-center items-center gap-3 mb-2">
            <img
              src="/GAS_512_512.svg"
              alt="GAS"
              className="w-12 h-12 rounded-full"
            />
            <div>
              {isLoadingBalance ? (
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span
                    className={`text-lg font-normal ${
                      isDark ? "text-gray-400" : "text-black"
                    }`}
                  >
                    Loading...
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {gasBalance}{" "}
                  <span
                    className={`text-lg font-normal ${
                      isDark ? "text-gray-400" : "text-black"
                    }`}
                  >
                    GAS
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Form */}
        <div className="flex-1 p-8 flex items-end">
          {/* Amount */}
          <div className="flex-1 flex justify-center">
            <div className="w-64">
              <div className="flex items-center justify-center gap-2 mb-3">
                <label
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Amount (GAS)
                </label>
                {exceedsBalance && (
                  <span className="text-red-500 text-xs font-medium">
                    Exceeds balance
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className={`w-full text-center rounded-lg px-3 py-3 pr-16 font-medium focus:outline-none focus:ring-2 ${
                    exceedsBalance
                      ? "bg-red-50 border-2 border-red-500 text-red-700 focus:ring-red-500"
                      : "bg-white text-black focus:ring-gray-600"
                  }`}
                />
                <button
                  onClick={() =>
                    setAmount(parseFloat(gasBalance.replace(/,/g, "")))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Potential rewards & Vote button */}
          <div className="flex-1 flex justify-center">
            <div className="w-64">
              <div
                className={`text-lg block mb-3 text-center font-bold ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                Potential rewards <span className="text-red-500">0 (+0%)</span>
              </div>
              <button 
                onClick={handleVote}
                disabled={isVoting}
                className={`w-full font-semibold py-3 rounded-lg transition ${
                  isVoting
                    ? "bg-gray-600 text-white cursor-not-allowed opacity-50"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isVoting ? "Voting..." : "Vote"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Outcomes List */}
      <div className="px-8 py-6 flex gap-4">
        <div
          onClick={() => setSelectedOutcome("Yes")}
          className={`flex-1 flex items-center justify-between p-4 rounded-lg cursor-pointer transition ${
            selectedOutcome === "Yes"
              ? "bg-white text-black"
              : isDark
              ? "text-white hover:bg-gray-600"
              : "text-black hover:bg-gray-400"
          }`}
        >
          <span className="text-lg">1. Yes</span>
          <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium">
            {isLoadingAmounts ? "Loading..." : `${yesAmount}`}
          </span>
        </div>

        <div
          onClick={() => setSelectedOutcome("No")}
          className={`flex-1 flex items-center justify-between p-4 rounded-lg cursor-pointer transition ${
            selectedOutcome === "No"
              ? "bg-white text-black"
              : isDark
              ? "text-white hover:bg-gray-600"
              : "text-black hover:bg-gray-400"
          }`}
        >
          <span className="text-lg">2. No</span>
          <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium">
            {isLoadingAmounts ? "Loading..." : `${noAmount}`}
          </span>
        </div>
      </div>
    </div>
  );
}
