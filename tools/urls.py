from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('base64/', views.base64_tool, name='base64_tool'),
    path('diff/', views.diff_tool, name='diff_tool'),
    path('timestamp/', views.timestamp_tool, name='timestamp_tool'),
    path('ipgen/', views.ipgen_tool, name='ipgen_tool'),
    path('password/', views.password_tool, name='password_tool'),
    path('uuid/', views.uuid_tool, name='uuid_tool'),
    path('unicode/', views.unicode_tool, name='unicode_tool'),
    path('language/<str:language>/', views.switch_language, name='switch_language'),
] 