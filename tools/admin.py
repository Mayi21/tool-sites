from django.contrib import admin
from .models import UserPreference, ToolUsage, UserHistory


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['session_key_short', 'theme', 'language', 'favorite_tools_count', 'created_at', 'updated_at']
    list_filter = ['theme', 'language', 'created_at']
    search_fields = ['session_key']
    readonly_fields = ['session_key', 'created_at']
    
    def session_key_short(self, obj):
        return f"{obj.session_key[:8]}..."
    session_key_short.short_description = '会话ID'
    
    def favorite_tools_count(self, obj):
        return len(obj.favorite_tools)
    favorite_tools_count.short_description = '收藏工具数'


@admin.register(ToolUsage)
class ToolUsageAdmin(admin.ModelAdmin):
    list_display = ['tool_name', 'usage_count', 'last_used']
    list_filter = ['last_used']
    search_fields = ['tool_name']
    readonly_fields = ['last_used']
    ordering = ['-usage_count']


@admin.register(UserHistory)
class UserHistoryAdmin(admin.ModelAdmin):
    list_display = ['session_key_short', 'tool_name', 'result_preview_short', 'created_at']
    list_filter = ['tool_name', 'created_at']
    search_fields = ['session_key', 'tool_name']
    readonly_fields = ['session_key', 'created_at']
    ordering = ['-created_at']
    
    def session_key_short(self, obj):
        return f"{obj.session_key[:8]}..."
    session_key_short.short_description = '会话ID'
    
    def result_preview_short(self, obj):
        if len(obj.result_preview) > 50:
            return f"{obj.result_preview[:50]}..."
        return obj.result_preview
    result_preview_short.short_description = '结果预览'
