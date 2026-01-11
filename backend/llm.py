import os
import json
from openai import OpenAI
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()  
client = OpenAI(
    base_url="https://api.tokenfactory.nebius.com/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)

def get_product_suggestions(user_message: str, products: List[Dict]) -> Dict:
    """
    Get product suggestions from LLM based on user message
    Returns: {message: str, product_ids: List[str]}
    """
    
    system_prompt = """You are a helpful fashion assistant for Zilo Fashion Store in Mumbai.
Your job is to recommend the best products based on the customer's needs.

Analyze the products provided and suggest 2-3 best matches for the customer.
Consider occasion, style, price, and brand reputation.

You MUST respond with ONLY valid JSON in this exact format:
{
  "message": "Brief explanation of why these products suit their need",
  "product_ids": ["id1", "id2", "id3"]
}

Do not include any text before or after the JSON. Only return the JSON object."""

    products_text = json.dumps(products, indent=2)
    
    user_prompt = f"""Customer request: {user_message}

Available products:
{products_text}

Suggest 2-3 best products that match their need."""

    try:
        response = client.chat.completions.create(
            model="nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
            max_tokens=2048,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        result = json.loads(response_text)
        
        # Validate response structure
        if "message" not in result or "product_ids" not in result:
            raise ValueError("Invalid response structure")
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response was: {response_text}")
        # Fallback response
        return {
            "message": "I found some great options for you!",
            "product_ids": [products[0]["id"], products[1]["id"]] if len(products) >= 2 else []
        }
    except Exception as e:
        print(f"Error in LLM call: {e}")
        return {
            "message": "I found some options for you!",
            "product_ids": [products[0]["id"]] if products else []
        }