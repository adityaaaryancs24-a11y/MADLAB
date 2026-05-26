"""
Verity App - Comprehensive Database Seed Script
Run: python seed.py
Drops all tables and re-creates them with fresh realistic data.
"""
import os
import datetime
import sys

# Ensure the backend root is on the path so 'app.*' imports resolve
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.product import Product, Price, PriceHistory

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def days_ago(n: int) -> datetime.datetime:
    return datetime.datetime.utcnow() - datetime.timedelta(days=n)

def make_history(product_id: int, store: str, price_points: list[tuple[int, float]]) -> list[PriceHistory]:
    """price_points: list of (days_ago, price)"""
    return [
        PriceHistory(product_id=product_id, price=price, store=store, recorded_at=days_ago(d))
        for d, price in price_points
    ]

# ─────────────────────────────────────────────────────────────────────────────
# Seed Data Definition
# ─────────────────────────────────────────────────────────────────────────────

PRODUCTS = [
    {
        "upc": "012000001765",
        "name": "Pepsi Cola, 12-Pack 12 fl oz Cans",
        "brand": "Pepsi",
        "image_url": "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
        "description": "Crisp, refreshing Pepsi Cola. Bold cola taste with 12 pack of 12 fl oz cans. Perfect for parties, game nights, and everyday refreshment.",
        "category": "Beverages",
        "prices": [
            {"retailer": "Walmart", "price": 6.98, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 7.49, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Amazon Fresh", "price": 7.99, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
            {"retailer": "Kroger", "price": 6.79, "in_stock": True, "logo": "🏪", "url": "https://kroger.com"},
        ],
        "history": ("Walmart", [(30, 7.49), (25, 7.29), (20, 7.09), (15, 6.98), (10, 7.19), (5, 6.98), (0, 6.98)]),
    },
    {
        "upc": "049000028911",
        "name": "Coca-Cola Classic, 12-Pack 12 fl oz Cans",
        "brand": "Coca-Cola",
        "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
        "description": "The original refreshing cola. Real Coca-Cola flavor and refreshing taste in every sip. 12-pack of 12 fl oz cans.",
        "category": "Beverages",
        "prices": [
            {"retailer": "Walmart", "price": 6.98, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 7.49, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Walgreens", "price": 8.99, "in_stock": True, "logo": "💊", "url": "https://walgreens.com"},
            {"retailer": "Amazon Fresh", "price": 7.79, "in_stock": False, "logo": "📦", "url": "https://amazon.com"},
        ],
        "history": ("Walmart", [(30, 7.99), (22, 7.49), (15, 6.98), (7, 7.29), (0, 6.98)]),
    },
    {
        "upc": "016000275287",
        "name": "Honey Nut Cheerios, 18.8 oz",
        "brand": "General Mills",
        "image_url": "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=600&q=80",
        "description": "America's favorite cereal. Whole grain oats with a touch of honey and almond flavor. A delicious heart-healthy breakfast.",
        "category": "Cereal",
        "prices": [
            {"retailer": "Walmart", "price": 3.98, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 4.49, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Kroger", "price": 4.29, "in_stock": True, "logo": "🏪", "url": "https://kroger.com"},
            {"retailer": "Amazon Fresh", "price": 4.19, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
        ],
        "history": ("Walmart", [(30, 4.49), (20, 4.19), (10, 3.98), (0, 3.98)]),
    },
    {
        "upc": "028400090179",
        "name": "Doritos Nacho Cheese Tortilla Chips, 9.25 oz",
        "brand": "Frito-Lay",
        "image_url": "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=600&q=80",
        "description": "Bold Nacho Cheese flavored tortilla chips. Crunchy, addictive, and perfect for snacking. The iconic orange triangle everyone loves.",
        "category": "Snacks",
        "prices": [
            {"retailer": "Walmart", "price": 4.28, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 4.79, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "7-Eleven", "price": 5.99, "in_stock": True, "logo": "🏬", "url": "https://7eleven.com"},
            {"retailer": "Kroger", "price": 4.49, "in_stock": True, "logo": "🏪", "url": "https://kroger.com"},
        ],
        "history": ("Walmart", [(30, 4.98), (20, 4.58), (10, 4.28), (0, 4.28)]),
    },
    {
        "upc": "038000138416",
        "name": "Kellogg's Pop-Tarts, Frosted Strawberry, 16 count",
        "brand": "Kellogg's",
        "image_url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
        "description": "Frosted Strawberry Pop-Tarts toaster pastries. A classic breakfast or snack with a delicious strawberry filling and frosted crust.",
        "category": "Breakfast",
        "prices": [
            {"retailer": "Walmart", "price": 4.48, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 4.99, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Amazon Fresh", "price": 5.29, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
        ],
        "history": ("Walmart", [(30, 5.29), (15, 4.79), (7, 4.48), (0, 4.48)]),
    },
    {
        "upc": "036000291452",
        "name": "Crest 3D Whitestrips, Professional Effects",
        "brand": "Crest",
        "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
        "description": "Professional-level teeth whitening at home. 20 strips (10 treatments) with Advanced Seal technology. Noticeably whiter teeth in 3 days.",
        "category": "Oral Care",
        "prices": [
            {"retailer": "Walmart", "price": 34.97, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 38.99, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "CVS", "price": 42.99, "in_stock": True, "logo": "💊", "url": "https://cvs.com"},
            {"retailer": "Amazon", "price": 36.94, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
        ],
        "history": ("Walmart", [(30, 39.99), (20, 37.99), (10, 34.97), (0, 34.97)]),
    },
    {
        "upc": "194252376980",
        "name": "Apple AirPods (4th Generation)",
        "brand": "Apple",
        "image_url": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80",
        "description": "The all-new AirPods with H2 chip. Personalized Spatial Audio with dynamic head tracking. Adaptive Audio, Voice Isolation, and up to 30 hours of battery life.",
        "category": "Electronics",
        "prices": [
            {"retailer": "Apple", "price": 129.00, "in_stock": True, "logo": "🍎", "url": "https://apple.com"},
            {"retailer": "Best Buy", "price": 129.00, "in_stock": True, "logo": "🔵", "url": "https://bestbuy.com"},
            {"retailer": "Amazon", "price": 124.99, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
            {"retailer": "Walmart", "price": 127.00, "in_stock": False, "logo": "🛒", "url": "https://walmart.com"},
        ],
        "history": ("Amazon", [(30, 139.00), (20, 134.99), (10, 129.99), (5, 124.99), (0, 124.99)]),
    },
    {
        "upc": "037000869153",
        "name": "Tide Pods Laundry Detergent Pacs, Spring Meadow, 81 count",
        "brand": "Tide",
        "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
        "description": "Tide PODS with 3-in-1 technology: detergent, stain remover, and brightener in one convenient pac. 81 count, Spring Meadow scent.",
        "category": "Household",
        "prices": [
            {"retailer": "Walmart", "price": 19.97, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 21.99, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Amazon", "price": 20.49, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
            {"retailer": "Costco", "price": 17.99, "in_stock": True, "logo": "🏢", "url": "https://costco.com"},
        ],
        "history": ("Walmart", [(30, 22.99), (20, 21.47), (10, 19.97), (0, 19.97)]),
    },
    {
        "upc": "034000000210",
        "name": "Organic Hass Avocados, 4-Pack",
        "brand": "Nature's Best",
        "image_url": "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80",
        "description": "Fresh, perfectly ripe organic Hass avocados. Rich in healthy fats, fiber, and essential vitamins. Perfect for guacamole, toast, salads, and more.",
        "category": "Produce",
        "prices": [
            {"retailer": "Walmart", "price": 4.99, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Whole Foods", "price": 6.99, "in_stock": True, "logo": "🍏", "url": "https://wholefoods.com"},
            {"retailer": "Kroger", "price": 5.49, "in_stock": True, "logo": "🏪", "url": "https://kroger.com"},
            {"retailer": "Target", "price": 5.79, "in_stock": False, "logo": "🎯", "url": "https://target.com"},
        ],
        "history": ("Walmart", [(30, 5.99), (20, 5.49), (10, 4.99), (0, 4.99)]),
    },
    {
        "upc": "041220002105",
        "name": "Chobani Greek Yogurt, Strawberry, 5.3oz",
        "brand": "Chobani",
        "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80",
        "description": "Thick and creamy nonfat Greek yogurt blended with real strawberries. 15g protein, no artificial flavors, live and active cultures.",
        "category": "Dairy",
        "prices": [
            {"retailer": "Kroger", "price": 1.29, "in_stock": True, "logo": "🏪", "url": "https://kroger.com"},
            {"retailer": "Target", "price": 1.49, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Walmart", "price": 1.25, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
        ],
        "history": ("Walmart", [(30, 1.49), (20, 1.39), (10, 1.29), (0, 1.25)]),
    },
    {
        "upc": "012993102123",
        "name": "LaCroix Sparkling Water, Lime, 12-Pack",
        "brand": "LaCroix",
        "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
        "description": "Sparkling water with natural lime flavor. Zero calories, zero sweeteners, zero sodium. 12 pack of 12 fl oz cans.",
        "category": "Beverages",
        "prices": [
            {"retailer": "Amazon Fresh", "price": 4.99, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
            {"retailer": "Walmart", "price": 5.29, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 5.49, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Whole Foods", "price": 5.99, "in_stock": True, "logo": "🍏", "url": "https://wholefoods.com"},
        ],
        "history": ("Amazon Fresh", [(30, 5.49), (20, 5.29), (10, 4.99), (0, 4.99)]),
    },
    {
        "upc": "021130126026",
        "name": "Nature Valley Crunchy Granola Bars, Oats 'n Honey, 12 count",
        "brand": "Nature Valley",
        "image_url": "https://images.unsplash.com/photo-1490567674331-8a2a9a8a6b0e?w=600&q=80",
        "description": "Made with 100% whole grain oats. Crunchy granola bars with honey flavor. A wholesome snack made with real ingredients. 12 bars per box.",
        "category": "Snacks",
        "prices": [
            {"retailer": "Walmart", "price": 3.78, "in_stock": True, "logo": "🛒", "url": "https://walmart.com"},
            {"retailer": "Target", "price": 4.29, "in_stock": True, "logo": "🎯", "url": "https://target.com"},
            {"retailer": "Amazon Fresh", "price": 3.99, "in_stock": True, "logo": "📦", "url": "https://amazon.com"},
        ],
        "history": ("Walmart", [(30, 4.29), (15, 3.99), (7, 3.78), (0, 3.78)]),
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# Seed Function
# ─────────────────────────────────────────────────────────────────────────────

def seed_data():
    print("🗑  Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("🏗  Re-creating tables with updated schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print(f"🌱 Seeding {len(PRODUCTS)} products...")

        for p_data in PRODUCTS:
            product = Product(
                upc=p_data["upc"],
                name=p_data["name"],
                brand=p_data["brand"],
                image_url=p_data["image_url"],
                description=p_data["description"],
                category=p_data["category"],
            )
            db.add(product)
            db.flush()  # Get product.id before committing

            # Prices
            for price_data in p_data["prices"]:
                db.add(Price(
                    product_id=product.id,
                    retailer=price_data["retailer"],
                    price=price_data["price"],
                    in_stock=price_data["in_stock"],
                    logo=price_data.get("logo"),
                    url=price_data.get("url"),
                ))

            # Price History
            store_name, price_points = p_data["history"]
            for d, price in price_points:
                db.add(PriceHistory(
                    product_id=product.id,
                    price=price,
                    store=store_name,
                    recorded_at=days_ago(d),
                ))

            print(f"  ✅ {p_data['brand']} {p_data['name'][:40]}...")

        db.commit()
        print(f"\n🎉 Seeding complete! {len(PRODUCTS)} products with prices & history loaded.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
