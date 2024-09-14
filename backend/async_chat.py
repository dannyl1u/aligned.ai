from dotenv import load_dotenv
import os
import asyncio
from groq import AsyncGroq
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
import cohere
import logging

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
chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="memory", embedding_function=cohere_ef)

MODEL_PROMPT = """
You are a relationship coach. 
Ask me deep situation and interest-based questions to evaluate my personality so that I can be matched to others in the future and make me tell it with an example or story.
As I answer, use my previous answers to ask more meaningful and deep questions, provoking a thoughtful response from me.
Ask questions that make me reveal what my values are.
"""

NUM_MESSAGES = 10

messages = []
user_messages = []


async def chat(user_id):
    client = AsyncGroq(api_key=GROQ_API_KEY)
    message_count = 0

    for i in range(NUM_MESSAGES):
        if i == 0:
            user_message = MODEL_PROMPT
        else:
            user_message = input("You: ")
            user_messages.append(user_message)
            
            collection.add(
                documents=[user_message],
                ids=[f"user_message_{message_count}"]
            )
            message_count += 1
        
        messages.append({'role': 'user', 'content': user_message})

        print("Model response:")

        chat_completion = await client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192"
        )

        assistant_message = chat_completion.choices[0].message.content
        print(assistant_message)

        messages.append({'role': 'assistant', 'content': assistant_message})

asyncio.run(chat("123")) #TODO: no hardcode

results = collection.query(
    query_texts=[""],
    n_results=20
)

print("All documents in collection:")
for i, doc in enumerate(results['documents'][0]):
    print(f"Document {i}: {doc}")