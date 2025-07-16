"""
工具应用的公共工具函数
"""
from django.http import JsonResponse
from django.shortcuts import render


class ToolViewMixin:
    """工具视图的混合类，提供公共功能"""
    
    @staticmethod
    def handle_tool_request(request, form_class, template_name, process_func, 
                          initial_data=None, extra_context=None):
        """
        统一处理工具请求的公共方法
        
        Args:
            request: HTTP请求对象
            form_class: 表单类
            template_name: 模板名称
            process_func: 处理函数，接收form.cleaned_data，返回结果字典
            initial_data: 初始数据字典
            extra_context: 额外的模板上下文
        
        Returns:
            HttpResponse或JsonResponse
        """
        context = initial_data or {}
        extra_context = extra_context or {}
        
        # 获取工具名称（从模板名称推断）
        tool_name = template_name.split('/')[-1].replace('.html', '')
        
        if request.method == 'POST':
            form = form_class(request.POST, request.FILES)
            if form.is_valid():
                try:
                    result = process_func(form.cleaned_data)
                    context.update(result)
                    
                    # 记录工具使用统计（简化版）
                    record_tool_usage(tool_name)
                    
                    # AJAX请求返回JSON
                    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                        return JsonResponse(context)
                        
                except Exception as e:
                    error_msg = f'处理失败: {str(e)}'
                    context['error'] = error_msg
                    
                    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                        return JsonResponse({'error': error_msg}, status=400)
            else:
                error_msg = '参数错误'
                context['error'] = error_msg
                
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({'error': error_msg}, status=400)
        else:
            form = form_class()
        

        
        # 合并额外上下文
        context.update(extra_context)
        return render(request, template_name, context)


def safe_decode_base64(data):
    """安全的Base64解码"""
    import base64
    try:
        return base64.b64decode(data).decode('utf-8')
    except Exception as e:
        raise ValueError(f'Base64解码失败: {str(e)}')


def safe_encode_base64(data):
    """安全的Base64编码"""
    import base64
    try:
        if isinstance(data, str):
            data = data.encode('utf-8')
        return base64.b64encode(data).decode('utf-8')
    except Exception as e:
        raise ValueError(f'Base64编码失败: {str(e)}')


def validate_timestamp(timestamp_str):
    """验证并标准化时间戳"""
    try:
        ts = float(timestamp_str)
        # 自动判断毫秒还是秒
        if ts > 1e12:  # 13位毫秒
            return ts / 1000, int(ts) % 1000
        else:
            return ts, int((ts - int(ts)) * 1000)
    except ValueError:
        raise ValueError('无效的时间戳格式')


def generate_secure_password(length, use_upper, use_lower, use_digits, use_symbols):
    """生成安全密码"""
    import secrets
    import string
    
    chars = ''
    if use_upper:
        chars += string.ascii_uppercase
    if use_lower:
        chars += string.ascii_lowercase
    if use_digits:
        chars += string.digits
    if use_symbols:
        chars += string.punctuation
    
    if not chars:
        raise ValueError('请至少选择一种字符类型')
    
    return ''.join(secrets.choice(chars) for _ in range(length))


def get_or_create_session_key(request):
    """获取或创建会话密钥"""
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def get_user_preferences(request):
    """获取用户偏好设置"""
    from .models import UserPreference
    session_key = get_or_create_session_key(request)
    
    try:
        preferences = UserPreference.objects.get(session_key=session_key)
    except UserPreference.DoesNotExist:
        preferences = UserPreference.objects.create(session_key=session_key)
    
    return preferences


def update_user_preferences(request, **kwargs):
    """更新用户偏好设置"""
    preferences = get_user_preferences(request)
    for key, value in kwargs.items():
        if hasattr(preferences, key):
            setattr(preferences, key, value)
    preferences.save()
    return preferences


def record_tool_usage(tool_name):
    """记录工具使用统计"""
    from .models import ToolUsage
    usage, created = ToolUsage.objects.get_or_create(tool_name=tool_name)
    usage.usage_count += 1
    usage.save()
    return usage


def save_user_history(request, tool_name, parameters, result_preview=''):
    """保存用户操作历史"""
    from .models import UserHistory
    session_key = get_or_create_session_key(request)
    
    # 限制结果预览长度
    if len(result_preview) > 200:
        result_preview = result_preview[:197] + '...'
    
    history = UserHistory.objects.create(
        session_key=session_key,
        tool_name=tool_name,
        parameters=parameters,
        result_preview=result_preview
    )
    
    # 只保留最近50条历史记录
    old_records = UserHistory.objects.filter(session_key=session_key).order_by('-created_at')[50:]
    if old_records.exists():
        old_ids = list(old_records.values_list('id', flat=True))
        UserHistory.objects.filter(id__in=old_ids).delete()
    
    return history


def get_user_history(request, limit=10):
    """获取用户操作历史"""
    from .models import UserHistory
    session_key = get_or_create_session_key(request)
    
    return UserHistory.objects.filter(session_key=session_key).order_by('-created_at')[:limit]


def get_popular_tools(limit=5):
    """获取热门工具"""
    from .models import ToolUsage
    return ToolUsage.objects.order_by('-usage_count')[:limit]

from django.core.cache import cache
from django.views.decorators.cache import cache_page
from functools import wraps
import hashlib
import json


def cache_tool_result(timeout=300):
    """缓存工具结果的装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(data):
            # 生成缓存键
            cache_key = f"tool_result_{func.__name__}_{hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()}"
            
            # 尝试从缓存获取结果
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # 执行函数并缓存结果
            result = func(data)
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator


def get_tool_statistics():
    """获取工具统计信息（带缓存）"""
    cache_key = 'tool_statistics'
    stats = cache.get(cache_key)
    
    if stats is None:
        from .models import ToolUsage
        stats = {
            'popular_tools': list(ToolUsage.objects.order_by('-usage_count')[:5].values('tool_name', 'usage_count')),
            'total_usage': sum(ToolUsage.objects.values_list('usage_count', flat=True)),
        }
        cache.set(cache_key, stats, 600)  # 缓存10分钟
    
    return stats


def clear_tool_cache():
    """清除工具相关缓存"""
    cache.delete('tool_statistics')
    # 清除所有工具结果缓存
    cache.delete_many([key for key in cache._cache.keys() if key.startswith('tool_result_')])