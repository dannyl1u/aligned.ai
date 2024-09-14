from fastapi import FastAPI
from pydantic import BaseModel
from async_chat import chat, collection

app = FastAPI()

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!!!!"}

@app.post("/chat")
async def process_chat(chat_request: ChatRequest):
    user_id = chat_request.user_id
    user_message = chat_request.message
    
    # Call the chat function and get the LLM response
    llm_response = await chat(user_id, user_message)
    
    # Add the user message to the collection
    collection.add(
        documents=[user_message],
        ids=[f"user_message_{user_id}_{collection.count()}"]
    )
    
    return {"user_id": user_id, "user_message": user_message, "llm_response": llm_response}

@app.get("/user_messages/{user_id}")
async def get_user_messages(user_id: str):
    results = collection.query(
        query_texts=[""],
        n_results=20
    )
    user_messages = results['documents'][0]
    return {"user_id": user_id, "messages": user_messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)