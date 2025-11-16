# 🔮 AmbY - The Next-Gen Prediction Market on Neo N3

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Neo%20N3-green)
![Language](https://img.shields.io/badge/language-Java%2017-orange)
![Framework](https://img.shields.io/badge/framework-neow3j-blue)

**AmbY** is a decentralized, time-weighted parimutuel prediction market built natively on the **Neo N3 Blockchain**. It reinvents the betting experience by rewarding early believers with a unique leverage mechanism, built directly on top of the NeoVM's powerful architecture.

> **"Predict early, win bigger."**

---

## 🌟 Key Features

* **⚡ Native GAS Integration:** Seamless betting experience. Users bet directly by transferring system **GAS** tokens to the contract. No wrapped tokens, no complex approvals.
* **⏳ Time-Weighted Leverage:** Unlike traditional binary markets, AmbY rewards conviction. The earlier you place a bet relative to the event duration, the higher your **"Points"** multiplier (Leverage).
* **📊 Parimutuel Model:** Liquidity is consolidated into a single shared pool per market. Winners split the total pool pro-rata based on their accumulated Points.
* **⛽ Gas-Optimized Architecture:** Utilizes a **Column-Based Storage** design pattern to minimize storage fees, ensuring the contract remains scalable and cheap to use even with high transaction volumes.
* **🛡️ Atomic Transactions:** Betting logic is executed inside the `OnNEP17Payment` hook, ensuring that payment and bet recording happen atomically. Invalid bets (e.g., after deadline) are automatically rejected and refunded.

---

## 🏗️ Technical Architecture

### 1. Column-Based Storage Strategy
To optimize NeoVM GAS consumption, AmbY avoids serializing large objects for mutable data. Instead, it splits data into separate `StorageMaps`:

* **Static Data (Read-Once):** Title, Description, Creator are stored in `m_info`.
* **Mutable Data (Read-Write):** Pool amounts are stored in `m_poolYes` and `m_poolNo`.
* **User Data:** User bets and points use composite keys for O(1) access.

### 2. The Time-Weighted Algorithm
Your share of the winning pool is not determined by your raw Amount, but by your **Points**.

$$
\text{Leverage} = \left\lceil \frac{\text{TimeRemaining} \times 36}{\text{TotalDuration}} \right\rceil
$$

$$
\text{UserPoints} = \text{Amount} \times \text{Leverage}
$$

* **Scenario:** A user betting in the first minute of a 24-hour market gets significantly higher leverage (up to 36x) compared to a user betting in the final minute (1x).

---
## 🤖 AmbY AI Event Agent (Powered by Spoon AI & SpoonOS SCDF)

AmbY integrates a powerful AI-driven agent built on **Spoon AI**, part of the **SpoonOS Core Developer Framework (SCDF)**.  
This agent automates the discovery of hot Web3 events and dynamically generates prediction markets on the **Neo N3 Blockchain**, allowing AmbY to remain continuously up-to-date with trending topics and populate the platform with engaging markets.

---

## 🧩 How Spoon AI is Used

### 1️⃣ Hot Event Discovery

The agent leverages Spoon AI’s ChatBot framework using the **gemini-2.5-pro** model to query, understand, and generate a list of trending Web3 and blockchain events.

**Input**: A keyword string (e.g., `"web3"`)

**Processing**: Spoon AI parses the keyword and identifies trending topics, extracting the relevant context.

**Output**: Structured JSON list of event objects:

```json
[
  {
    "title": "Bitcoin to Smash $150k?",
    "description": "Will the price of one Bitcoin (BTC) surpass $150,000 USD on major exchanges like Coinbase or Binance?",
    "endTime": 1735689599000
  },
  {
    "title": "Spot ETH ETF Trading Begins",
    "description": "Will a spot Ethereum ETF officially begin trading on a major US stock exchange like NYSE or NASDAQ?",
    "endTime": 1727740799000
  },
  {
    "title": "LayerZero (ZRO) Token Launch",
    "description": "Will the highly anticipated LayerZero protocol launch its native token (ZRO) and initiate its airdrop claim process?",
    "endTime": 1722470399000
  }
]
```
This structured output allows AmbY to automatically identify events worth creating markets for, without manual curation.

---

## 2️⃣ Autonomous Market Creation

The agent uses Spoon AI tools to convert discovered events into actionable market creation requests on **Neo N3**.

**Tool Used**: `CreateMarketTool`  
**Function**: Interacts with Neo N3 RPC to invoke:  
`createMarket(title, description, endTime)` on the smart contract.

### **Flow**
- Spoon AI receives a JSON list of events.  
- Each event is converted into a market creation transaction with proper validation.  
- Transactions are submitted to Neo N3, creating markets **autonomously**.

**Input**: `title`, `description`, `endTime` (milliseconds timestamp)  
**Output**: Transaction response from the Neo N3 blockchain.

---

## 🎯 Benefits of Using Spoon AI & SpoonOS

- **Automated Market Generation**: Spoon AI continuously discovers trending events and generates markets automatically.  
- **Context-Aware Predictions**: The Gemini LLM ensures events are relevant, timely, and based on community interest.  
- **Seamless Neo N3 Integration**: Outputs are directly compatible with AmbY’s smart contract, enabling fast and reliable market creation.  
- **Extensible & Modular**: Tools can be extended or customized for new event sources or prediction types.  
- **ReAct Agent Architecture**: SpoonOS SCDF allows reasoning + action loops for agents to sense, plan, and execute autonomously.

---

## ⚡ Why SpoonOS?

SpoonOS Core Developer Framework (SCDF) is the foundation for building **sentient, Web3-aware AI agents**.

- **Agentic**: Each agent can perceive (understand events), reason (prioritize hot topics), and act (create markets).  
- **Composable**: Integrates multiple tools (e.g., `GeminiEventSearchTool`, `CreateMarketTool`) seamlessly.  
- **Interoperable**: Designed to interact with Web3 infrastructure such as Neo N3 RPC, smart contracts, and external APIs.  
- **Rapid Hackathon Development**: Minimal setup, modular components, and standardized agent framework.  
- **Future-Ready**: Easily extendable for additional chains, LLMs, or prediction workflows.

---

## 🚀 Recommended Usage

**Backend Integration**  
Run the agent on a server or cloud environment to generate markets **in real-time**.

**API Layer**  
Expose Spoon AI outputs via REST or WebSocket APIs for front-end dashboards.

### **Environment Requirements**
- Spoon AI / SpoonOS installed  
- Gemini API key configured (if required)  
- Neo N3 RPC endpoint  
- Smart contract hash  
- Wallet credentials  

---

## 📌 Summary

Spoon AI, powered by **SpoonOS SCDF**, is the core intelligence behind AmbY’s predictive market automation.  
It combines language understanding, event discovery, and blockchain interaction to offer **real-time, AI-driven markets** reflecting the hottest trends in the Web3 ecosystem.

By using Spoon AI, AmbY agents can **autonomously discover, validate, and act** on events — turning insights into on-chain prediction markets dynamically.

---

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
* **Java JDK 17** (Strictly required for `neow3j` compatibility).
* **Docker Desktop** (For running Neo Express Private Net).
* **Visual Studio Code** (With *Neo Blockchain Toolkit* extension).
* **Gradle 7.x+**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/taihungg/AmbY-Predict-Market-on-NEO-N3
    cd AmbY-Prediction-Market
    ```

2.  **Configure Java Toolchain:**
    Ensure your `build.gradle` is set to use Java 17 toolchain but target Java 8 compatibility (NeoVM requirement).

3.  **Build the Smart Contract:**
    Compile the Java source code into NeoVM Bytecode (`.nef`).
    ```bash
    ./gradlew clean neow3jCompile
    ```
    *Artifacts location: `build/neow3j/AmbYContract.nef`*

---

## 📖 Usage Guide

### 1. Deploy Contract
Deploy `AmbYContract.nef` to Neo N3 Testnet or Private Net using the Neo Blockchain Toolkit in VS Code.
* *Note:* The deployer address is automatically assigned as the **Owner**.

### 2. Create a Market
Invoke the `createMarket` method.
* **Title:** e.g., "Will BTC > 100k by 2025?"
* **Description:** e.g., "Resolution based on Binance Spot..."
* **EndTime:** Timestamp in milliseconds.

### 3. Place a Bet (User)
Users place bets by transferring **GAS** to the contract address. The contract detects the transfer via `OnNEP17Payment`.

* **To:** `<AmbY_Contract_Hash>`
* **Asset:** GAS Token Hash
* **Amount:** Your bet amount (e.g., 10 GAS)
* **Data:** An Array `[marketId, outcome]`
    * `marketId` (Integer): The ID of the market.
    * `outcome` (Integer): `1` for **YES**, `2` for **NO**.

> **JSON Data Example (for Wallets/RPC):**
> ```json
> {
>   "type": "Array",
>   "value": [
>     { "type": "Integer", "value": "1" },
>     { "type": "Integer", "value": "1" }
>   ]
> }
> ```

### 4. Resolve & Claim
* **Resolve:** The Owner calls `resolveMarket(marketId, winnerOutcome)`.
* **Claim:** Winners call `claim(marketId)` to withdraw their winnings directly to their wallet.
