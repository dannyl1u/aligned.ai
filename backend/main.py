from fastapi import FastAPI
from pydantic import BaseModel
from async_chat import chat, collection
import re

app = FastAPI()

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!!!!"}

@app.get("/getMostSimilar/{user_id}")
async def get_most_similar(user_id: str):
    # Get all messages
    all_messages = collection.get()
    
    # Filter messages for the given user
    user_messages = [doc for doc, id in zip(all_messages['documents'], all_messages['ids']) 
                     if f"user_message_{user_id}_" in id]
    
    if not user_messages:
        return {"message": "No messages found for this user"}
    
    # Combine all user messages into a single query
    combined_query = " ".join(user_messages)
    
    # Query the collection for similar messages
    results = collection.query(
        query_texts=[combined_query],
        n_results=50,  # Increase this number to ensure we get enough results after filtering
    )
    
    # Extract user IDs from the results, excluding the current user
    similar_user_ids = {}
    for id, distance in zip(results['ids'][0], results['distances'][0]):
        match = re.search(r'user_message_(\w+)_', id)
        if match:
            similar_user_id = match.group(1)
            if similar_user_id != user_id:
                if similar_user_id not in similar_user_ids or distance < similar_user_ids[similar_user_id]:
                    similar_user_ids[similar_user_id] = distance
    
    # Sort similar users by similarity score (lower distance is more similar)
    sorted_similar_users = sorted(similar_user_ids.keys(), key=lambda x: similar_user_ids[x])
    
    return {"most_similar_users": sorted_similar_users[:1]}  # Returns most similar users

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
    all_messages = collection.get()
    user_messages = [doc for doc, id in zip(all_messages['documents'], all_messages['ids']) 
                     if f"user_message_{user_id}_" in id]
    return {"user_id": user_id, "messages": user_messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)