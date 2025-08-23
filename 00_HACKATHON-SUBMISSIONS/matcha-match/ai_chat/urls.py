from django.urls import path
from . import views

app_name = 'ai_chat'

urlpatterns = [
    path('chat/', views.chat_with_ai, name='chat'),
    path('conversation/<str:session_id>/', views.get_conversation_history, name='conversation_history'),
    path('preferences/<str:session_id>/', views.get_user_preferences, name='user_preferences'),
]
