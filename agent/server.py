from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import asyncio

from tools.gemini_event_search import GeminiEventSearchTool
from tools.create_market import CreateMarketTool

app = FastAPI()

class SearchRequest(BaseModel):
    keyword: str

@app.post("/search-events")
async def search_events(req: SearchRequest):
    tool = GeminiEventSearchTool()
    result = await tool.execute(req.keyword)
    return {"events": result}

class CreateMarketRequest(BaseModel):
    title: str
    description: str
    endTime: int

@app.post("/create-market")
async def create_market(req: CreateMarketRequest):
    tool = CreateMarketTool()
    tx = await tool.execute(
        title=req.title,
        description=req.description,
        endTime=req.endTime
    )
    return {"tx": tx}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
