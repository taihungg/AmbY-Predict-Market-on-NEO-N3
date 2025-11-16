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

### 3. SpoonOS Framework

**SpoonOS** provides a modular, asynchronous, and production-ready framework for building AI + Web3 agents with clean abstractions.

#### Core Components

- **spoon_ai.tools.base.BaseTool** – defines plug-and-play custom tools.
- **spoon_ai.chat.ChatBot** – unified interface for calling LLMs (Gemini, OpenAI, Anthropic).
- **spoon_ai.schema.Message** – standardized multi-message memory object.
- **spoon_ai.chat.Memory** – manages conversation state and context history.
- **Asynchronous Engine (async/await)** – enables tools to run concurrently for maximum performance.

#### 🤖 LLM Provider

**Gemini 2.5 Pro**  
Used to generate Web3 event lists in structured JSON format.

#### 🔗 Blockchain Layer (Neo N3)

SpoonOS interacts with the **Neo N3 RPC layer** using JSON-RPC 2.0.


#### 🚀 End-to-End Flow (Mermaid Diagram)
```text
+-----------------------------+
| Admin/User Input Keyword   |
|   (e.g., Bitcoin, Solana)  |
+-------------+---------------+
              |
              v
+-----------------------------+
| GeminiEventSearchTool       |
+-------------+---------------+
              |
              v
+-----------------------------+
| Gemini LLM                  |
| Generate JSON Event List    |
+-------------+---------------+
              |
              v
+-----------------------------+
| Agent Logic                 |
| Parse + Select Markets      |
+-------------+---------------+
              |
              v
+-----------------------------+
| CreateMarketTool            |
+-------------+---------------+
              |
              v
+-----------------------------+
| Neo N3 RPC                  |
| JSON-RPC invokefunction     |
+-------------+---------------+
              |
              v
+-----------------------------+
| Smart Contract              |
| createMarket()              |
+-------------+---------------+
              |
              v
+-----------------------------+
| Market Created On-Chain     |
+-----------------------------+
```
---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
* **Java JDK 17** (Strictly required for `neow3j` compatibility).
* **Docker Desktop** (For running Neo Express Private Net).
* **Visual Studio Code** (With *Neo Blockchain Toolkit* extension).
* **Gradle 7.x+**
* **Python 3.10+** (Required for SpoonOS Framework)
* **aiohttp** (Async HTTP client used by SpoonOS tools)
* **pip install spoon-ai** (SpoonOS Python SDK for AI + Web3 integration)

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