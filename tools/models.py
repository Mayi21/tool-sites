from django.db import models
from django.utils import timezone


class UserPreference(models.Model):
    """用户偏好设置"""
    session_key = models.CharField(max_length=40, unique=True, verbose_name='会话ID')
    theme = models.CharField(
        max_length=10, 
        choices=[('light', '亮色'), ('dark', '暗色')], 
        default='light',
        verbose_name='主题'
    )
    language = models.CharField(
        max_length=10,
        choices=[('zh-hans', '中文'), ('en', 'English')],
        default='zh-hans',
        verbose_name='语言'
    )
    favorite_tools = models.JSONField(default=list, verbose_name='收藏工具')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        verbose_name = '用户偏好'
        verbose_name_plural = '用户偏好'
        
    def __str__(self):
        return f'用户偏好 - {self.session_key[:8]}...'


class ToolUsage(models.Model):
    """工具使用统计"""
    tool_name = models.CharField(max_length=50, verbose_name='工具名称')
    usage_count = models.IntegerField(default=0, verbose_name='使用次数')
    last_used = models.DateTimeField(auto_now=True, verbose_name='最后使用时间')
    
    class Meta:
        verbose_name = '工具使用统计'
        verbose_name_plural = '工具使用统计'
        unique_together = ['tool_name']
        
    def __str__(self):
        return f'{self.tool_name} - {self.usage_count}次'


class UserHistory(models.Model):
    """用户操作历史"""
    session_key = models.CharField(max_length=40, verbose_name='会话ID')
    tool_name = models.CharField(max_length=50, verbose_name='工具名称')
    parameters = models.JSONField(verbose_name='参数')
    result_preview = models.TextField(max_length=200, blank=True, verbose_name='结果预览')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='创建时间')
    
    class Meta:
        verbose_name = '用户历史'
        verbose_name_plural = '用户历史'
        ordering = ['-created_at']
        
    def __str__(self):
        return f'{self.tool_name} - {self.created_at.strftime("%Y-%m-%d %H:%M")}'
