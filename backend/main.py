from typing import List
from fastapi import FastAPI, Body
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import os
from groq import AsyncGroq
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
import cohere
import logging
from fastapi.middleware.cors import CORSMiddleware
import json

load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
COHERE_API_KEY = os.environ.get("COHERE_API_KEY")

logger = logging.getLogger(__name__)

class CohereEmbeddingFunction(EmbeddingFunction[Documents]):
    def __init__(self, api_key: str, model_name: str = "embed-english-v3.0"):
        self._client = cohere.Client(api_key)
        self._model_name = model_name

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = self._client.embed(
            texts=input,
            model=self._model_name,
            input_type="search_document"
        ).embeddings
        return [list(embedding) for embedding in embeddings]

cohere_ef = CohereEmbeddingFunction(api_key=COHERE_API_KEY)
chroma_client = chromadb.PersistentClient(path="./chroma_storage")
collection = chroma_client.get_or_create_collection(name="memory", embedding_function=cohere_ef)

MODEL_PROMPT = """
You are seeking to understand my personality. 
Ask me deep questions that prompt me to critically evaluate my personality so that I can be matched to others in the future. You can do this with examples or stories, or test moral situations.
As I answer, use the user message of our previous conversation to ask more meaningful and deep questions, provoking increasingly thoughtful response that tests my character and what I am like including my interests.
Ask increasingly challenging questions that make me reveal what my values are. Do not summarize my responses in my previous replies. Only ask the questions that prompt deeper conversation.
"""

async def chat(email: str, user_message: str):
    client = AsyncGroq(api_key=GROQ_API_KEY)
    
    # Construct the messages list
    messages = [{'role': 'system', 'content': MODEL_PROMPT}]
    messages.append({'role': 'user', 'content': user_message})
    
    # Get the LLM response
    chat_completion = await client.chat.completions.create(
        messages=messages,
        model="llama3-8b-8192"
    )
    assistant_message = chat_completion.choices[0].message.content
    
    return assistant_message

app = FastAPI()
# Allow CORS for specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

class ChatRequest(BaseModel):
    email: EmailStr
    messages: List[str]

class GetSimilarRequest(BaseModel):
    email: EmailStr

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!!!!"}

@app.get("/getMostSimilar")
async def get_most_similar(request: GetSimilarRequest = Body(...)):
    email = request.email
    # Get all messages for the given user
    user_messages = collection.get(
        where={"email": email}
    )
    
    if not user_messages['documents']:
        return {"message": "No messages found for this user"}
    
    # Combine all user messages into a single query
    combined_query = " ".join(user_messages['documents'])
    
    # Query the collection for similar messages
    results = collection.query(
        query_texts=[combined_query],
        n_results=50,
        where={"email": {"$ne": email}},  # Exclude the current user
        include=['metadatas', 'distances']
    )
    
    # Process results to get the most similar user
    similar_users = {}
    for metadata, distance in zip(results['metadatas'][0], results['distances'][0]):
        similar_user_email = metadata['email']
        if similar_user_email not in similar_users or distance < similar_users[similar_user_email]:
            similar_users[similar_user_email] = distance
    
    # Sort similar users by similarity score (lower distance is more similar)
    sorted_similar_users = sorted(similar_users.items(), key=lambda x: x[1])
    
    if sorted_similar_users:
        most_similar_user = sorted_similar_users[0][0]
        return {"most_similar_user": most_similar_user}
    else:
        return {"message": "No similar users found"}

@app.post("/chat")
async def process_chat(chat_request: ChatRequest):
    email = chat_request.email
    user_messages = chat_request.messages

    # Join the user messages with \n
    full_message = "\n".join(user_messages)
    
    # Call the chat function and get the LLM response
    llm_response = await chat(email, full_message)
    
    # Store both user messages and LLM response in ChromaDB
    collection.add(
        documents=[full_message],  # We use the full message as the document
        ids=[f"chat_{email}_{collection.count()}"],
        metadatas=[{
            "email": email,
            "user_messages": json.dumps(user_messages),  # Store as JSON string
            "llm_response": llm_response
        }]
    )
    
    return {"email": email, "llm_response": llm_response}

@app.post("/user_messages")
async def get_user_messages(request: GetSimilarRequest = Body(...)):
    email = request.email
    results = collection.get(
        where={"email": email}
    )
    
    # Extract user messages and LLM responses from metadata
    chat_history = []
    for metadata in results['metadatas']:
        user_messages = json.loads(metadata.get('user_messages', '[]'))
        llm_response = metadata.get('llm_response', '')
        chat_history.append({
            "user_messages": user_messages,
            "llm_response": llm_response
        })
    
    return {"email": email, "chat_history": chat_history}

@app.post("/save_chat_history")
async def save_chat_history(chat_request: ChatRequest):
    email = chat_request.email
    user_messages = chat_request.messages
    full_message = "\n".join(user_messages)

    # Save the chat history to the database
    collection.add(
        documents=[full_message],
        ids=[f"chat_history_{email}_{collection.count()}"],
        metadatas=[{
            "email": email,
            "user_messages": json.dumps(user_messages),  # Store as JSON string
        }]
    )

    return {"status": "success", "message": "Chat history saved successfully"}

class GetAllChatsRequest(BaseModel):
    email: EmailStr

@app.get("/get_all_chats")
async def get_all_chats(request: GetAllChatsRequest = Body(...)):
    email = request.email
    results = collection.get(
        where={"email": email}
    )
    
    chat_history = []
    for doc, metadata in zip(results['documents'], results['metadatas']):
        user_messages = json.loads(metadata.get('user_messages', '[]'))
        llm_response = metadata.get('llm_response', '')
        chat_history.append({
            "user_messages": user_messages,
            "llm_response": llm_response,
            "full_text": doc
        })
    
    return {"email": email, "chat_history": chat_history}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)