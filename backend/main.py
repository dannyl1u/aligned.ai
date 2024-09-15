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

# List of sample responses
messages = [
    "My journey as a founder has been rooted in a deep commitment to creating technology that improves everyday lives. I’m driven by the challenge of identifying problems that people face daily and turning those challenges into innovative solutions. My focus is on building a culture that encourages curiosity, resilience, and collaboration. I believe that the true measure of a startup’s potential lies not just in its product but in the strength of its team and the diversity of its thought. I'm passionate about fostering a work environment where every voice is heard and valued, which I believe is key to sustainable success. My goal is to create a product that not only meets market needs but also makes a meaningful impact on the world.",
    "As a VC, my primary focus is on identifying founders who are not just driven by profit but by a genuine passion to solve real-world problems. I’m drawn to individuals who demonstrate resilience and a unique perspective on their industry. I invest not just in ideas, but in the people behind them—those who have the tenacity to weather the inevitable challenges of building a startup. My approach to funding is deeply collaborative; I see myself as a partner to the founders I invest in, offering not just capital but also strategic guidance and mentorship. I’m particularly interested in sectors where technology intersects with social impact, believing that the most successful ventures are those that benefit society as a whole.",
    "As a founder, my vision is centered on creating scalable technology solutions that address pressing global challenges. I’ve always been fascinated by how technology can bridge gaps and bring about societal change. My current project aims to disrupt the traditional education system by providing personalized learning experiences through AI-driven platforms. I’m a firm believer in the power of education to transform lives, and my goal is to make high-quality education accessible to everyone, regardless of their socioeconomic background. Collaboration and continuous learning are at the core of my leadership style. I encourage my team to constantly challenge the status quo and push the boundaries of what’s possible.",
    "My investment philosophy is grounded in the belief that innovation is the lifeblood of progress. I’m constantly on the lookout for visionary founders who are not afraid to tackle big, complex problems. I have a particular interest in the fields of renewable energy and sustainability, as I believe that these areas will define the future of our planet. I’m drawn to founders who combine technical expertise with a strong sense of purpose and social responsibility. My role as a VC goes beyond providing funding—I aim to be a strategic partner, offering insights and support to help founders navigate the challenges of scaling their businesses. Ultimately, I’m looking to invest in companies that not only have the potential to be financially successful but also to make a positive impact on the world.",
    "Being a founder has been the most challenging yet rewarding experience of my life. I’m passionate about creating products that empower individuals and communities. My current startup focuses on developing tools that help small businesses thrive in the digital economy. I’m driven by a deep belief in the potential of entrepreneurship to drive social change. My leadership style is inclusive and empathetic—I believe that the best ideas come from diverse perspectives, and I strive to create an environment where everyone feels empowered to contribute. My goal is to build a company that not only delivers value to its customers but also creates lasting, positive change in the communities it serves.",
    "My approach to venture capital is shaped by my background in engineering and my passion for technology. I’m particularly interested in startups that are pushing the boundaries of what’s possible in fields like AI, robotics, and biotech. I look for founders who are deeply knowledgeable about their industry and have a clear vision of how their technology can change the world. I believe that the most successful startups are those that are able to combine cutting-edge technology with a deep understanding of the market and the needs of their customers. As an investor, I see myself as a partner to the founders I work with, providing not just capital but also the strategic guidance and industry connections they need to succeed.",
    "My passion lies in using technology to solve some of the world’s most pressing problems. I’m particularly interested in the intersection of healthcare and technology, and my current startup is focused on developing AI-driven tools to improve patient outcomes in chronic disease management. I believe that the key to success as a founder is staying deeply connected to the needs of your users and constantly iterating on your product to meet those needs. I’m committed to building a company that not only delivers financial returns but also makes a meaningful difference in people’s lives. My leadership style is collaborative and mission-driven—I strive to inspire my team with a shared vision and a commitment to making a positive impact.",
    "As a venture capitalist, I’m driven by a passion for discovering and nurturing the next generation of world-changing ideas. I focus on early-stage startups, particularly in the tech and healthcare sectors, where I believe the potential for innovation is greatest. My investment strategy is built on identifying founders who are not only technically proficient but also have a clear vision of how their product can create value in the market. I’m particularly interested in startups that are leveraging AI and machine learning to solve complex problems. Beyond providing capital, I see my role as a mentor and advisor, helping founders navigate the challenges of scaling their businesses and bringing their vision to life.",
    "My journey as a founder has been fueled by a desire to create products that make a difference in people’s lives. I’m passionate about using technology to address social issues, and my current startup focuses on developing affordable housing solutions using sustainable materials. I believe that business can be a powerful force for good, and I’m committed to building a company that not only generates profit but also contributes to solving some of the world’s most pressing challenges. My leadership style is collaborative and inclusive—I believe that the best ideas come from diverse teams, and I strive to create an environment where everyone feels valued and empowered to contribute.",
    "My approach to venture capital is rooted in a belief in the transformative power of technology. I’m particularly interested in startups that are developing innovative solutions in the fields of fintech, edtech, and healthcare. I look for founders who are not only passionate about their product but also have a deep understanding of the market and a clear strategy for scaling their business. I believe that the most successful startups are those that are able to combine technical expertise with a strong business model. As an investor, I see my role as a strategic partner, providing not just capital but also the guidance and support that founders need to turn their vision into reality.",
    "My passion as a founder stems from a deep commitment to leveraging technology to create solutions that empower people. My current focus is on building a platform that democratizes access to mental health resources, making it easier for individuals to find the support they need. I believe that the key to building a successful startup is to stay laser-focused on the needs of your users and to continuously iterate on your product based on their feedback. I’m committed to creating a company culture that values transparency, empathy, and innovation. My goal is to build a company that not only delivers value to its users but also makes a positive impact on the world."
]

# List of corresponding emails
emails = [
    "cameron.bellewood@gmail.com",       # Corresponds to the first response
    "cameron.beneteau@gmail.com",     # Corresponds to the second response
    "emily.jones@gmail.com",    # Corresponds to the third response
    "robert.brown@gmail.com",   # Corresponds to the fourth response
    "susan.lee@gmail.com",      # Corresponds to the fifth response
    "james.wilson@gmail.com",   # Corresponds to the sixth response
    "olivia.martin@gmail.com",  # Corresponds to the seventh response
    "david.moore@gmail.com",    # Corresponds to the eighth response
    "linda.miller@gmail.com",   # Corresponds to the ninth response
    "michael.clark@gmail.com",  # Corresponds to the tenth response
    "sophia.taylor@gmail.com"   # Corresponds to the eleventh response
]

for message, email in zip(messages, emails):
    # Save the chat history to the database
    collection.add(
        documents=[message],
        ids=[f"{collection.count()}"],
        metadatas=[{
            "email": email,
            "user_messages": message
        }],
    )

MODEL_PROMPT = """
You are seeking to understand my personality as a Founder. 
Ask me deep questions that prompt me to critically evaluate my personality and working style so that I can be matched to venture funds managers. You can do this with examples or stories, or test moral situations.
As I answer, use the user message of our previous conversation to ask more meaningful and deep questions, provoking increasingly thoughtful response that tests my character and what I am like including my interests.
Ask increasingly challenging questions that make me reveal what my values are. Do not summarize my responses in my previous replies. Only ask the questions that prompt deeper conversation.
"""

VC_MODEL_PROMPT = """
You are seeking to understand my personality. I am a Venture Fund Manager looking to fund founders. 
Ask me deep questions that prompt me to critically evaluate my personality so that I can be matched to others in the future. You can do this with examples or stories, or test moral situations.
As I answer, use the user message of our previous conversation to ask more meaningful and deep questions, provoking increasingly thoughtful response that tests my character and what I am like including my interests.
Ask increasingly challenging questions that make me reveal what my values are. Do not summarize my responses in my previous replies. Only ask the questions that prompt deeper conversation.
"""

async def chat(email: str, user_message: str, mode = 'founder'):
    client = AsyncGroq(api_key=GROQ_API_KEY)
    
    # Construct the messages list
    messages = [{'role': 'system', 'content': MODEL_PROMPT if mode == 'founder' else VC_MODEL_PROMPT}]
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

class SummarizeTextRequest(BaseModel):
    email: EmailStr
    text: str

class SummarizeTextResponse(BaseModel):
    personality_traits: str
    interests: str
    work_experience: str




SUMMARIZE_PROMPT = """
You are a text analysis expert. Summarize the given text by extracting key personality traits, interests, and work experience. Don't use bullet points and do not output any other text.
"""

async def summarize_with_groq(text: str):
    client = AsyncGroq(api_key=GROQ_API_KEY)
    
    # Construct the messages list
    messages = [{'role': 'system', 'content': SUMMARIZE_PROMPT}]
    messages.append({'role': 'user', 'content': text})
    
    # Get the LLM response
    chat_completion = await client.chat.completions.create(
        messages=messages,
        model="llama3-8b-8192"
    )
    summary = chat_completion.choices[0].message.content
    
    # Extract sections from the summary (assuming the format is consistent)
    personality_traits = summary.split("Personality Traits:")[1].split("Interests:")[0].strip()
    interests = summary.split("Interests:")[1].split("Work Experience:")[0].strip()
    work_experience = summary.split("Work Experience:")[1].strip()


    return personality_traits, interests, work_experience


class ChatRequest(BaseModel):
    email: EmailStr
    messages: List[str]

class SetNewUserRequest(BaseModel):
    user_email: EmailStr
    given_name: str
    family_name: str
    name: str
    picture: str
    linkedin: str
    website: str
    webSummitProfile: str
    userType: str
    matchType: str
    

class GetSimilarRequest(BaseModel):
    email: EmailStr

class GetCurrentUserExistsRequest(BaseModel):
    email: EmailStr

class MatchRequest(BaseModel):
    email: EmailStr

class MatchCard(BaseModel):
    name: str
    score: int
    profileImage: str
    keywords: None
    description: str
    email: str
    linkedin: str
    website: str

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!!!!"}


@app.post("/summarize_text", response_model=SummarizeTextResponse)
async def summarize_text(request: SummarizeTextRequest):
    text = request.text

    try:
        # Use Groq to summarize the text and generate keywords
        personality_traits, interests, work_experience = await summarize_with_groq(text)

        return SummarizeTextResponse(
            personality_traits=personality_traits,
            interests=interests,
            work_experience=work_experience,
        )

    except Exception as e:
        return {"status": "error", "message": f"Failed to summarize text: {str(e)}"}


@app.get("/user_data/{email}")
async def get_user_data(email: str):
    return get_current_user_exists(email)

def get_current_user_exists(email: str):
    print('email is', email)
    current_user_email = email
    with open("users.json", "r") as file:
        data = json.load(file)
        users = data["users"]
        for user in users:
            if user["user_email"] == current_user_email:
                return {"status": "success", "user": user}
    
    print('didnt find email')
    return {"status": "error", "message": "User does not exist"}


@app.post("/submit_profile")
async def set_new_user(request: SetNewUserRequest):
    try:
        # Read the existing data from the JSON file
        with open("users.json", "r") as file:
            data = json.load(file)
        
        # Ensure "users" key exists in the JSON structure
        if "users" not in data:
            data["users"] = []

        # Convert Pydantic model to dictionary
        new_user = request.dict()

        # Check if the user already exists based on email
        if any(user["user_email"] == new_user["user_email"] for user in data["users"]):
            return {"status": "error", "message": "User already exists"}

        # Add the new user to the list
        data["users"].append(new_user)

        print('adding new user', new_user)

        # Write the updated data back to the JSON file
        with open("users.json", 'w') as f:
            json.dump(data, f, indent=4)

        return {"status": "success", "message": "User profile saved successfully"}
    
    except Exception as e:
        logger.error(f"Error saving user profile: {str(e)}")
        return {"status": "error", "message": "Failed to save user profile"}


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
        n_results=10,
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

    # Check the userType for the given email in users.json
    with open("users.json", "r") as file:
        data = json.load(file)
        users = data["users"]
        user_type = None
        for user in users:
            if user["user_email"] == email:
                user_type = user["userType"]
                break
    # Call the chat function and get the LLM response
    llm_response = await chat(email, full_message, mode = 'founder' if user_type == 'Founder' else 'VC')
    
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
    print('saving chat for email', email, 'with details', full_message)

    # Save the chat history to the database
    collection.add(
        documents=[full_message],
        ids=[f"chat_history_{email}_{collection.count()}"],
        metadatas=[{
            "email": email,
            "user_messages": full_message,
        }]
    )

    return {"status": "success", "message": "Chat history saved successfully"}

def get_all_chats(email: EmailStr):
    results = collection.get(
        where={"email": email}
    )
    metadatas = results["metadatas"]
    
    all_user_messages = []
    for metadata in metadatas:
        if 'user_messages' in metadata:
            user_messages = json.loads(metadata['user_messages'])
            all_user_messages.extend(user_messages)
    
    joined_messages = ". ".join(all_user_messages)
    
    return {"email": email, "all_messages": joined_messages}

@app.get("/check_user_in_chroma/{email}")
async def check_user_in_chroma(email: str):
    results = collection.get(
        where={"email": email}
    )

    if results['documents']:
        return {"status": "success", "message": "User exists in ChromaDB"}
    else:
        return {"status": "error", "message": "User does not exist in ChromaDB"}

@app.get("/get_full_user_conversation/{email}")
async def get_full_user_conversation(email: str):
    return get_user_conversation(email)

def get_user_conversation(email: str):
    # Query the collection to get the user's conversation
    results = collection.get(
        where={"email": email}
    )

    # Check if any documents were found
    if results['documents']:
        # Retrieve the user messages from the metadata
        user_conversations = []
        for metadata in results['metadatas']:
            user_messages = metadata.get("user_messages", "")
            if user_messages:
                user_conversations.append(user_messages)

        # Return the full conversation as a list of messages
        return {"status": "success", "user_conversations": user_conversations}
    else:
        return {"status": "error", "message": "User does not exist in ChromaDB"}

@app.post("/matches")
async def get_matches(request: MatchRequest = Body(...)):
    print('GET MATCHES')

    matches = []
    top_users = get_similar_emails(request.email)
    top_data = get_similar_data(request.email)

    # Get all messages for the given user
    user_messages = collection.get(
        where={"email": request.email}
    )
    
    # Combine all user messages into a single query
    combined_query = " ".join(user_messages['documents'])
    
    # Query the collection for similar messages, including distances
    results = collection.query(
        query_texts=[combined_query],
        n_results=10,
        where={"email": {"$ne": request.email}},  # Exclude the current user
        include=['metadatas', 'distances']
    )

    # Filter results based on matchType
    filtered_results = []
    for metadata, distance in zip(results['metadatas'][0], results['distances'][0]):
        similar_user_email = metadata['email']
        query_user = get_current_user_exists(request.email)['user']
        result_user = get_current_user_exists(similar_user_email)['user']

        if query_user['matchType'] == result_user['userType']:
            filtered_results.append((metadata, distance))

    # If no results remain after filtering, return an empty list
    if not filtered_results:
        return {"matches": []}

    # Extract filtered distances
    filtered_distances = [distance for _, distance in filtered_results]
    min_distance = min(filtered_distances)
    max_distance = max(filtered_distances)

    # Define the desired score range
    min_score = 13
    max_score = 93

    # Calculate scores and build the matches list
    for metadata, distance in filtered_results:
        similar_user_email = metadata['email']
        result_string = get_user_conversation(similar_user_email)['user_conversations'][0]
        result_user = get_current_user_exists(similar_user_email)['user']

        # Normalize the distance and calculate the score
        normalized_distance = (distance - min_distance) / (max_distance - min_distance)
        score = round(min_score + (1 - normalized_distance) * (max_score - min_score))

        match_summary = await get_match_summary(combined_query, result_string, query_user['name'], result_user['name'], score)


        match = dict()
        match['name'] = result_user['name']
        match['score'] = score
        match['profileImage'] = result_user['picture']
        match['keywords'] = await get_keywords_from_string(result_string)
        match['description'] = match_summary
        match['email'] = result_user['user_email']
        match['linkedin'] = result_user['linkedin']
        match['website'] = result_user['website']
        match['webSummitProfile'] = result_user['webSummitProfile']
        matches.append(match)

    print(f"MATCHES: {matches}")

    return {"matches": matches}

async def get_match_summary(query_string, result_string, query_user, result_user, score):
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
        I am also giving you a match score between 0 and 100 for these two people.
        If there score is high please be very positive about the match.
        if the score is low please do not be as energetic about the match.
        We want the summary description of the match (or lack there of) to match the score rating.
        You cannot mention the score in your rating (not always) and do not say anything about how it affects the description.
        Score: {score}
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
    # distances = []

    for metadata in results['metadatas'][0]:
        emails.append(metadata['email'])

    # for distances in results['distances'][0]:
        # distances.append(distances)

    print(f"EMAILS: {emails}")

    # return {"emails": emails, "distances": distances}

    return emails

def get_similar_data(email: EmailStr):
    print("GET SIMILAR DATA")
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
        n_results=2,
        where={"email": {"$ne": email}},  # Exclude the current user
        include=['metadatas', 'distances']
    )

    print(f"RESULTS: {results}")

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