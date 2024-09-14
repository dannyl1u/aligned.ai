# https://docs.trychroma.com/getting-started
import chromadb
from dotenv import load_dotenv
import os

load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
COHERE_API_KEY = os.environ.get("COHERE_API_KEY")

chroma_client = chromadb.Client()

collection = chroma_client.create_collection(name="my_collection")

# https://docs.trychroma.com/integrations/cohere
import chromadb.utils.embedding_functions as embedding_functions
cohere_ef  = embedding_functions.CohereEmbeddingFunction(api_key=COHERE_API_KEY,  model_name="large")

def add_to_collection(user_id: int, document: str):
    pass