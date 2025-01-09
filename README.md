## Inspiration
Have you ever attended a networking event and felt overwhelmed by the sheer number of people, unsure of how to find the right connections? We've all been there, wishing for a more streamlined way to meet individuals who align with our goals and values. The inspiration for Aligned.ai comes from this common challenge—finding people who will empower you to do your life's best work. Our goal was to create a system that helps individuals build sustainable and long-lasting relationships in the startup space, whether it’s founder-to-founder or founder-to-VC.

## What it does
Aligned.ai is a matchmaking platform designed to connect individuals in the startup ecosystem based on deep personality and goal alignment. Users engage in live, in-depth conversations with Aligned Voice, an AI-powered by Groq, which simulates a real human interaction. The system then generates a unique personality embedding using Cohere, which is stored in Chroma DB. Using powerful vector similarity algorithms, Aligned.ai ranks potential connections, presenting users with the best matches first. This way, users can find those who are not only aligned with their professional aspirations but also resonate with their personal values.

## How we built it
Aligned.ai was developed with a focus on seamless integration across multiple technologies:

![Alt text](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/026/013/datas/original.png)

- Frontend: Built using Next.js, our frontend integrates Auth0 for tokenization and secure login.
- Data Collection: Once logged in, users create their matchmaking profiles, including data from their Web Summit profile, LinkedIn, GitHub, and more.
- Conversation with Aligned Voice: This **core feature** was powered by Groq, users engage in a live conversation that feels as natural as talking to a real person. We used Groq's integrations with Whisper for speech to text - then sent this info to our backend server for stateless requests to Groq's blazing fast llama 3 models. __We experimented with various platforms but found Groq to give us the latency necessary for our needs__
- Personality Embedding: This was the **bread and butter** of our app. The conversation data is processed by Cohere's Embed API to generate a personality embedding, which is stored in Chroma DB vector database.
- Matchmaking: Users can then search for others with similar profiles using vector similarity algorithms. This was all ran over Chroma DB's seamless and powerful interface with multiple integrations. Summaries of similarities are hosted using Groq and Cohere. The system ranks matches from most to least aligned, providing a curated list of potential connections.
- Reach Out: Once a match is found, users can reach out directly using the embedded social information.


## Challenges we ran into
- One of the main challenges we faced was prompt engineering—ensuring that the AI could generate meaningful and accurate personality embeddings from the conversations. 
- Additionally, integrating the full tech stack from frontend to backend, while maintaining real-time AI performance, posed significant difficulties.
- Balancing the scale of integration with providing a clean and intuitive user experience was another key challenge we successfully navigated.

## Accomplishments that we're proud of
- MVP Completion: We successfully built and deployed a minimum viable product that effectively demonstrates the core functionality of Aligned.ai.
- Contribution to Open Source: We made a PR to improve one of the technologies we worked with, contributing back to the community.
- User-Centric Design: We invested significant time in UI/UX design to ensure that the user experience is as intuitive and enjoyable as possible.

## What we learned
Through this project, we learned the immense potential of AI-driven systems to facilitate meaningful connections between individuals. The ability of autonomous agents to understand and simulate human interaction signals a new paradigm in networking and relationship-building. We also gained valuable insights into prompt engineering, real-time AI processing, and the importance of seamless integration across the tech stack.

## What's next for Aligned.ai
The potential for Aligned.ai is vast. Moving forward, we plan to expand the action space of personality embedding and vector based search, integrating more powerful features to enhance the matchmaking process. We aim to refine the AI's ability to simulate even more nuanced human interactions and to improve the accuracy of our personality embeddings. As we continue to develop Aligned.ai, our goal is to make it the go-to platform for building meaningful, long-term relationships in the startup ecosystem.


# FastAPI Project

This is a simple FastAPI application.

## Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/yourrepository.git
    cd yourrepository
    ```

2. **Create and activate a virtual environment**:

    ```bash
    python -m venv venv
    source venv/bin/activate  # On macOS/Linux
    venv\Scripts\activate     # On Windows
    ```

3. **Install the dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

4. **Run the application**:
    ```bash
    cd backend
    ```
    
    ```bash
    uvicorn main:app --reload
    ```

5. **Access the API**:

   Open your browser and go to [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Endpoints

- `GET /`: Returns a "Hello, FastAPI!" message.
- `GET /items/{item_id}`: Returns details about an item.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
