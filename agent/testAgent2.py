#!/usr/bin/env python
import os
import asyncio
from dotenv import load_dotenv

from spoon_ai.chat import ChatBot, Memory
from spoon_ai.schema import Message
from spoon_ai.monitoring.clients.cex import get_cex_client

load_dotenv()

print("GEMINI_API_KEY =", os.getenv("GEMINI_API_KEY"))


async def main():
    bot = ChatBot(
        llm_provider="gemini",        
        model_name="gemini-2.5-pro"   
    )

    memory = Memory()

    client = get_cex_client("binance")
    symbol = "BTCUSDT"

    ticker = client.get_ticker_price(symbol)
    price = float(ticker["price"])

    msg = Message(
        role="user",
        content=f"""
Phân tích kỹ thuật BTC dựa trên giá hiện tại:
- Pair: {symbol}
- Current Price: {price}

Hãy phân tích xu hướng ngắn hạn và đưa ra nhận định hôm nay.
"""
    )

    memory.clear()
    memory.add_message(msg)

    result = await bot.ask(
        memory.get_messages(),
        system_msg="Bạn là chuyên gia phân tích thị trường Crypto."
    )

    print("\n=== BTC MARKET ANALYSIS ===")
    print(result)
    print("============================\n")


if __name__ == "__main__":
    asyncio.run(main())
