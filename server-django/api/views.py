from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def matcha_places(request):
    sample_places = [
        {
            "id": 1,
            "name": "Matcha House",
            "address": "123 Tea St",
            "rating": 4.5,
            "price_level": 2,
            "open_now": True,
        },
        {
            "id": 2,
            "name": "Green Leaf Matcha",
            "address": "456 Leaf Ave",
            "rating": 4.7,
            "price_level": 3,
            "open_now": False,
        }
    ]
    return Response(sample_places)