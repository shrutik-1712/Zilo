from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models import ChatRequest, ChatResponse, Product
from database import init_db, get_products_by_gender
from llm import get_product_suggestions

"""
NEED TO LEARN ABOUT DECORATORS AND OTHER ADVANCE TOPICS IN PYTHON 
"""
##########################################################
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    print("Database initialized with products")
    yield
    # Shutdown: cleanup if needed
    print("Shutting down")

#########################################################
app = FastAPI(lifespan=lifespan)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Check if API is running and DB is loaded"""
    men_count = len(get_products_by_gender("men"))
    women_count = len(get_products_by_gender("women"))
    return {
        "status": "healthy",
        "products_loaded": {
            "men": men_count,
            "women": women_count
        }
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Chat endpoint for product suggestions
    """
    # Validate gender
    if request.gender.lower() not in ["men", "women"]:
        raise HTTPException(status_code=400, detail="Gender must be 'men' or 'women'")
    
    # Get products from database
    products = get_products_by_gender(request.gender.lower())
    
    if not products:
        raise HTTPException(status_code=404, detail=f"No products found for {request.gender}")
    
    # Get LLM suggestions
    llm_response = get_product_suggestions(request.message, products)
    
    # Filter products based on LLM-selected product_ids
    selected_products = [
        Product(**p) for p in products 
        if p["id"] in llm_response["product_ids"]
    ]
    
    # If no valid products selected, fallback to first 2
    if not selected_products:
        selected_products = [Product(**p) for p in products[:2]]
    
    return ChatResponse(
        message=llm_response["message"],
        products=selected_products
    )


@app.get("/")
def root():
    return {"message": "Zilo Fashion Store API", "version": "1.0"}