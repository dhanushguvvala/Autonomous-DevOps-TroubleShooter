products = [
    {
        "id": 1,
        "name": "Laptop",
        "price": 55000,
        "stock": 10
    },
    {
        "id": 2,
        "name": "Wireless Mouse",
        "price": 1200,
        "stock": 25
    },
    {
        "id": 3,
        "name": "Keyboard",
        "price": 1800,
        "stock": 15
    },
    {
        "id": 4,
        "name": "Headphones",
        "price": 2500,
        "stock": 20
    }
]


orders = [
    {
        "id": 101,
        "product_id": 1,
        "quantity": 1,
        "status": "confirmed"
    },
    {
        "id": 102,
        "product_id": 2,
        "quantity": 2,
        "status": "confirmed"
    }
]


def get_products():
    return products


def get_product(product_id):
    for product in products:
        if product["id"] == product_id:
            return product

    return None


def get_orders():
    return orders