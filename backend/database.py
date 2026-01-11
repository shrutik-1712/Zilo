import sqlite3
import json

DB_CONN = None

def init_db():
    global DB_CONN
    DB_CONN = sqlite3.connect(":memory:", check_same_thread=False)
    cursor = DB_CONN.cursor()
    
    cursor.execute("""
        CREATE TABLE products (
            id TEXT PRIMARY KEY,
            brand TEXT,
            name TEXT,
            price REAL,
            mrp REAL,
            discount TEXT,
            best_price TEXT,
            image_url TEXT,
            product_url TEXT,
            gender TEXT
        )
    """)
    
    # Load men's products
    with open("men_data.json") as f:
        men_data = json.load(f)
        for p in men_data:
            cursor.execute("""
                INSERT INTO products (
                    id, brand, name, price, mrp, discount, 
                    best_price, image_url, product_url, gender
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["brand"], p["name"], p["price"], 
                p["mrp"], p["discount"], p["best_price"], 
                p["image_url"], p["product_url"], "men"
            ))
    
    # Load women's products
    with open("women_data.json") as f:
        women_data = json.load(f)
        for p in women_data:
            cursor.execute("""
                INSERT INTO products (
                    id, brand, name, price, mrp, discount, 
                    best_price, image_url, product_url, gender
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["brand"], p["name"], p["price"], 
                p["mrp"], p["discount"], p["best_price"], 
                p["image_url"], p["product_url"], "women"
            ))
    
    DB_CONN.commit()
    return DB_CONN


def get_products_by_gender(gender: str):
    cursor = DB_CONN.cursor()
    cursor.execute("""
        SELECT id, brand, name, price, mrp, discount, 
               best_price, image_url, product_url, gender
        FROM products WHERE gender=?
    """, (gender,))
    
    columns = [desc[0] for desc in cursor.description]
    results = cursor.fetchall()
    
    products = []
    for row in results:
        product = dict(zip(columns, row))
        products.append(product)
    
    return products