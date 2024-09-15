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
# chroma_client = chromadb.PersistentClient(path="./chroma_storage")
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="memory", embedding_function=cohere_ef)

# List of fake messages
messages = [
    "That football match last night was unbelievable!",
    "I can't wait for the basketball playoffs to start next week!",
    "Have you ever seen such a fast lap in Formula 1?",
    "Golf might be slow, but it's all about the strategy!",
    "The volleyball game was full of unexpected turns!",
    "I never thought I'd enjoy a cricket match so much!",
    "Hockey is getting more intense with every game this season!",
    "I love watching track and field events, they’re so exciting!",
    "The tennis match yesterday had so many incredible rallies!",
    "I’m amazed by the skills in professional cycling races!"
]

# List of fake emails
emails = [
    "cameron.bellewood@gmail.com",
    "basketballlover88@example.com",
    "f1speedster10@example.com",
    "golfstrategist21@example.com",
    "volleyballchamp44@example.com",
    "cricketfanatic55@example.com",
    "hockeyenthusiast99@example.com",
    "trackstar77@example.com",
    "tennisace25@example.com",
    "cyclingpro32@example.com"
]


for message, email in zip(messages, emails):
    # Save the chat history to the database
    collection.add(
        documents=[message],
        ids=[f"{collection.count()}"],
        metadatas=[{
            "email": email,
        }],
    )

MODEL_PROMPT = """
You are seeking to understand my personality as a Founder. 
Ask me deep questions that prompt me to critically evaluate my personality and working style so that I can be matched to venture funds managers. You can do this with examples or stories, or test moral situations.
As I answer, use the user message of our previous conversation to ask more meaningful and deep questions, provoking increasingly thoughtful response that tests my character and what I am like including my interests.
Ask increasingly challenging questions that make me reveal what my values are. Do not summarize my responses in my previous replies. Only ask the questions that prompt deeper conversation.
"""

VC_MODEL_PROMPT = """
You are seeking to understand my personality as a Venture Fund Manager looking to fund founders. 
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

class MatchRequest(BaseModel):
    email: EmailStr

class MatchCard(BaseModel):
    name: str
    profileImage: str
    keywords: None
    description: str
    email: str
    linkedin: str
    website: str

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
    # collection.add(
    #     documents=[full_message],  # We use the full message as the document
    #     ids=[f"chat_{email}_{collection.count()}"],
    #     metadatas=[{
    #         "email": email,
    #         "user_messages": json.dumps(user_messages),  # Store as JSON string
    #         "llm_response": llm_response
    #     }]
    # )
    
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
    print("SAVE CHAT HISTORY")
    email = chat_request.email
    user_messages = chat_request.messages
    full_message = "\n".join(user_messages)
    print(f'full_message {full_message}')

    # Save the chat history to the database
    collection.add(
        documents=[full_message],
        ids=[f"chat_history_{email}_{collection.count()}"],
        metadatas=[{
            "email": email,
            "user_messages": json.dumps(user_messages),  # Store as JSON string
        }],
    )

    return {"status": "success", "message": "Chat history saved successfully"}

class GetAllChatsRequest(BaseModel):
    email: EmailStr

def get_all_chats(email: EmailStr):
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

@app.post("/matches")
async def get_matches(request: MatchRequest = Body(...)):
    print('GET MATCHES')

    matches = []
    top_users = get_similar_emails(request.email)

    for email in top_users:
        query_string = get_all_chats(request.email)['chat_history'][0]['full_text']
        result_string = get_all_chats(email)['chat_history'][0]['full_text']

        print(f"QUERY STRING: {query_string}")
        print(f"RESULT STRING: {result_string}")

        match_summary = await get_match_summary(query_string, result_string, "Sophia", "Cameron")

        match = dict()
        match['name'] = "Cameron Beneteau"
        match['profileImage'] = "https://lh3.googleusercontent.com/a/ACg8ocKOd5LDeas0dQSXC18kU3S0fKufsEECZZRM-FanC6jDd3ZvoDG8=s96-c"
        match['keywords'] = await get_keywords_from_string(result_string)
        match['description'] = match_summary
        match['email'] = "cameron.beneteau@gmail.com"
        match['linkedin'] = "Cameron Beneteau"
        match['website'] = "cameronbeneteau.com"
        matches.append(match)

    print(f"MATCHES: {matches}")

    return {"matches": matches}

async def get_match_summary(query_string, result_string, query_user, result_user):
    print("GET MATCH SUMMARY")

    client = AsyncGroq(api_key=GROQ_API_KEY)

    SUMMARY_PROMT=f'''
        I have a matching service that connects users based on the similarities of their answers to previous prompts.
        I would like you to give me a short description of the similarities between the two following contents:
        Query string: {query_string}
        Result string: {result_string}
        Please use the tone of a matchmaker and make connections between the two but remember this is not dating app, it for more professional relationships.
        This will be shown on a matchmaking page so that users can see a short description of why one person may be a good connection.
        Please do not mention anything about 'query string' or 'result string'.
        Please keep the description short and sweet without too much detail.
        When referring to the matched user, please use their first name and address the current user in first person.
        Speak to the reader of the webpage but do not address them, keep the focus on the match found.
        Result string user: {result_user}
        '''
    
    # SUMMARY_PROMT = f'''
    #     I have a matching service that connects users based on the similarities of their answers to previous prompts.
    #     You will be proving the description on a users homepage describing the similarities between them.
    #     Please only use the query string and result string I will give you and no other information.
    #     I would like you to find and summarize the main similarities between the two users prompts.
    #     This could be interests, work ethic, or anything else that shows in both prompts.
    #     Query string: {query_string}
    #     Result string: {result_string}
    #     Please keep the summary short and remember you are speaking to the user about their match.
    #     Do not address the user and only speak about the matched person in third person.
    #     The name of the person this user has matched with is: {result_user}
    # '''

    # Construct the messages list
    messages = [{'role': 'system', 'content': SUMMARY_PROMT}]
    
    # Get the LLM response
    chat_completion = await client.chat.completions.create(
        messages=messages,
        model="llama3-8b-8192"
    )

    return chat_completion.choices[0].message.content

def get_similar_emails(email: EmailStr):
    print("GET SIMILAR EMAILS")
    print(email)

    # Get all messages for the given user
    user_messages = collection.get(
        where={"email": email}
    )

    print(f"USER MESSAGES: {user_messages}")
    
    if not user_messages['documents']:
        return []
    
    # Combine all user messages into a single query
    combined_query = " ".join(user_messages['documents'])
    
    # Query the collection for similar messages
    results = collection.query(
        query_texts=[combined_query],
        n_results=50,
        where={"email": {"$ne": email}},  # Exclude the current user
        include=['metadatas', 'distances']
    )

    print(f"RESULTS: {results}")

    emails = []

    for metadata in results['metadatas'][0]:
        emails.append(metadata['email'])

    print(f"EMAILS: {emails}")

    return emails

async def get_keywords_from_string(query_string):
    client = AsyncGroq(api_key=GROQ_API_KEY)

    KEYWORD_PROMT = f'''
        A user has just taken a test so we can learn a little more about them.
        The only response I need from you is three indidivual descritive words to summarize their test.
        Seperate them by one space each and title case each word.
        There test result is as follows: {query_string}.
        Do not add anything else to the response.
    '''

    # Construct the messages list
    messages = [{'role': 'system', 'content': KEYWORD_PROMT}]
    
    # Get the LLM response
    chat_completion = await client.chat.completions.create(
        messages=messages,
        model="llama3-8b-8192"
    )

    response = chat_completion.choices[0].message.content
    words = response.split(' ')
    words = [word for word in words if word]

    return words

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)