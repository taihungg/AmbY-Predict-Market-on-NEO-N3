import os
import json
import aiohttp
from spoon_ai.tools.base import BaseTool
from typing import Dict, Any

class CreateMarketTool(BaseTool):
    name: str = "create_market"
    description: str = "Call createMarket(title, description, endTime) on NEO smart contract"

    parameters: Dict[str, Any] = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "endTime": {"type": "integer"}
        },
        "required": ["title", "description", "endTime"]
    }

    async def execute(self, title: str, description: str, endTime: int):
        rpc_endpoint = os.getenv("http://seed3t5.neo.org:20332")
        contract_hash = os.getenv("CONTRACT_HASH")
        wallet_address = os.getenv("WALLET_ADDRESS")  

        if not rpc_endpoint or not contract_hash or not wallet_address:
            return "Missing NEO_RPC_ENDPOINT / CONTRACT_HASH / WALLET_ADDRESS."

        payload = {
            "jsonrpc": "2.0",
            "method": "invokefunction",
            "params": [
                contract_hash,
                "createMarket",
                [
                    {"type": "String", "value": title},
                    {"type": "String", "value": description},
                    {"type": "Integer", "value": endTime}
                ]
            ],
            "id": 1
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(rpc_endpoint, json=payload) as resp:
                result = await resp.json()

        return json.dumps(result, indent=2)
