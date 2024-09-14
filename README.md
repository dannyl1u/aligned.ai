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
