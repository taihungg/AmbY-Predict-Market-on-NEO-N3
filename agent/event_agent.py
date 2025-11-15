import asyncio
from dotenv import load_dotenv

from spoon_ai.chat import ChatBot, Memory
from spoon_ai.schema import Message

from tools.gemini_event_search import GeminiEventSearchTool
from tools.create_market import CreateMarketTool 
load_dotenv()


async def main():
    bot = ChatBot(
        llm_provider="gemini",
        model_name="gemini-2.5-pro"
    )

    memory = Memory()
    memory.clear()

    memory.add_message(Message(
        role="user",
        content="Find the hottest Web3 predictions, events in the future."
    ))

    keyword = "web3"

    """
    result = await bot.ask(
        memory.get_messages(),
        system_msg="Extract keyword only. Example: 'web3'."
    )
    keyword = result.strip()
    """
    # create_market_tool = CreateMarketTool()
    tool = GeminiEventSearchTool()
    events = await tool.execute(keyword)

    print("\n=== EVENT SEARCH RESULT ===")
    print(events)
    print("============================\n")
    # tx_result = await create_market_tool.execute(title=title, description=description, endTime=endTime)
    # cho vào vòng for gọi tiếp tool create_market (để tạo market sau khi querry cái json events)  

if __name__ == "__main__":
    asyncio.run(main())
