from dotenv import load_dotenv
import os
import asyncio
from groq import AsyncGroq

#TODO chromadb

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

MODEL_PROMPT = """
You are a relationship coach. 
Ask me deep situation and interest-based questions to evaluate my personality so that I can be matched to others in the future and make me tell it with an example or story.
As I answer, use my previous answers to ask more meaningful and deep questions, provoking a thoughtful response from me.
Ask questions that make me reveal what my values are.
"""

messages = []

async def chat():
    client = AsyncGroq(api_key=GROQ_API_KEY)

    for i in range(10):
        if i == 0:
            user_message = MODEL_PROMPT
        else:
            user_message = input("You: ")
        messages.append({'role': 'user', 'content': user_message})

        print("Model response:")

        chat_completion = await client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192"
        )

        print(chat_completion.choices[0].message.content)

        messages.append({'role': 'assistant', 'content': chat_completion.choices[0].message.content})

asyncio.run(chat())
