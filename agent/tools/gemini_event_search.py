from spoon_ai.tools.base import BaseTool
from spoon_ai.chat import ChatBot, Memory
from spoon_ai.schema import Message
from typing import Dict, Any

class GeminiEventSearchTool(BaseTool):
    name: str = "search_events"
    description: str = "Search latest Web3 hot quests using Gemini"

    parameters: Dict[str, Any] = {
        "type": "object",
        "properties": {
            "keyword": {"type": "string"},
        },
        "required": ["keyword"]
    }

    async def execute(self, keyword: str):
        bot = ChatBot(
            llm_provider="gemini",
            model_name="gemini-2.5-pro"
        )

        memory = Memory()
        memory.add_message(Message(
            role="user",
            content=(
                f"Generate a list of hot Web3/Blockchain events or quests related to '{keyword}'. "
                f"Examples: BTC > 100k before December, Ethereum hardfork XYZ, etc. "
                f"Return ONLY JSON as a list of objects with fields {{title, description, endTime}} "
                f"where endTime is an integer timestamp in the future, in milliseconds (UTC)."
            )
        ))

        return await bot.ask(
            memory.get_messages(),
            system_msg="You are a system that generates a list of hot Web3 quests/events."
        )
