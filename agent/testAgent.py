#!/usr/bin/env python
import os
import asyncio
from spoon_ai.chat import ChatBot, Memory
from spoon_ai.schema import Message
from spoon_ai.monitoring.clients.cex import get_cex_client
from dotenv import load_dotenv

from openai import AsyncOpenAI  

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
print("OPENAI_API_KEY =", API_KEY)


# ------------------------------------------------------------------------------
# 🔥 OVERRIDE provider của SpoonAI để ép API key vào đúng client
# ------------------------------------------------------------------------------

# SpoonAI import (sau khi load dotenv)
import spoon_ai.llm.providers.openai_compatible_provider as provider_module

# Save class gốc
OriginalProvider = provider_module.OpenAICompatibleProvider


class PatchedOpenAIProvider(OriginalProvider):
    """Override constructor để truyền api_key đúng vào AsyncOpenAI()."""

    def __init__(self, *args, api_key=None, **kwargs):
        super().__init__(*args, api_key=api_key, **kwargs)

        # EPIC FIX: tự tạo AsyncOpenAI với API key chuẩn
        self.client = AsyncOpenAI(api_key=api_key)

        print("[PATCH] OpenAI provider initialized with correct API key")

# Replace provider trong SpoonAI
provider_module.OpenAICompatibleProvider = PatchedOpenAIProvider


# ------------------------------------------------------------------------------
# ⬆⬆⬆ PATCH HOÀN TẤT
# ------------------------------------------------------------------------------


async def main():
    # Khởi tạo ChatBot
    bot = ChatBot(
        llm_provider="openai",
        model_name="gpt-4o-mini",
        api_key=API_KEY,
    )

    memory = Memory()

    # Binance client (SpoonAI built-in)
    client = get_cex_client("binance")
    symbol = "BTCUSDT"

    # ==== Lấy dữ liệu giá ====
    ticker = client.get_ticker_price(symbol)
    price = float(ticker["price"])

    # Tạo prompt
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

    # ==== Gọi LLM ====
    result = await bot.ask(
        memory.get_messages(),
        system_msg="Bạn là chuyên gia phân tích thị trường Crypto."
    )

    print("\n=== BTC MARKET ANALYSIS ===")
    print(result)
    print("============================\n")


if __name__ == "__main__":
    asyncio.run(main())
