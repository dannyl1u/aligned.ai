from dotenv import load_dotenv
import os
import asyncio
from ollama import AsyncClient

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
COHERE_API_KEY = os.environ.get("COHERE_API_KEY")

MODEL_PROMPT = "You are a relationship coach. Ask me deep situation and interest based questions to evaluate my personality so that I can be matched to others in the future"
messages = []

async def chat():
    client = AsyncClient()

    for i in range(10):
        if i == 0:
            user_message = MODEL_PROMPT
        else:
            user_message = input("You: ")  # Capture user input from the console
        messages.append({'role': 'user', 'content': user_message})

        # Prepare the message to send to the model
        message = {'role': 'user', 'content': messages}
        print("Model response:")

        # Send the message and receive response asynchronously
        async for part in await client.chat(model='llama3.1', messages=messages, stream=True):
            print(part['message']['content'], end='', flush=True)

        print()
        # Append the response to the messages list
        messages.append({'role': 'assistant', 'content': part['message']['content']})

# Run the async chat function
asyncio.run(chat())
