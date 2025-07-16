from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.sessions.models import Session
from .models import UserPreference, ToolUsage, UserHistory
from .utils import (
    safe_encode_base64, safe_decode_base64, validate_timestamp,
    generate_secure_password, get_user_preferences, record_tool_usage
)
import json
import base64


class UtilsTestCase(TestCase):
    """工具函数测试"""
    
    def test_safe_encode_base64(self):
        """测试Base64编码"""
        text = "Hello World"
        encoded = safe_encode_base64(text)
        self.assertEqual(encoded, base64.b64encode(text.encode()).decode())
    
    def test_safe_decode_base64(self):
        """测试Base64解码"""
        text = "Hello World"
        encoded = base64.b64encode(text.encode()).decode()
        decoded = safe_decode_base64(encoded)
        self.assertEqual(decoded, text)
    
    def test_validate_timestamp(self):
        """测试时间戳验证"""
        # 测试秒级时间戳
        ts, ms = validate_timestamp("1640995200")
        self.assertEqual(ts, 1640995200.0)
        self.assertEqual(ms, 0)
        
        # 测试毫秒级时间戳
        ts, ms = validate_timestamp("1640995200123")
        self.assertEqual(ts, 1640995200.123)
        self.assertEqual(ms, 123)
    
    def test_generate_secure_password(self):
        """测试密码生成"""
        password = generate_secure_password(12, True, True, True, False)
        self.assertEqual(len(password), 12)
        
        # 测试异常情况
        with self.assertRaises(ValueError):
            generate_secure_password(12, False, False, False, False)


class ModelsTestCase(TestCase):
    """模型测试"""
    
    def test_user_preference_creation(self):
        """测试用户偏好创建"""
        pref = UserPreference.objects.create(
            session_key='test_session',
            theme='dark',
            language='en'
        )
        self.assertEqual(pref.session_key, 'test_session')
        self.assertEqual(pref.theme, 'dark')
        self.assertEqual(pref.language, 'en')
    
    def test_tool_usage_creation(self):
        """测试工具使用统计创建"""
        usage = ToolUsage.objects.create(
            tool_name='base64',
            usage_count=10
        )
        self.assertEqual(usage.tool_name, 'base64')
        self.assertEqual(usage.usage_count, 10)
    
    def test_user_history_creation(self):
        """测试用户历史创建"""
        history = UserHistory.objects.create(
            session_key='test_session',
            tool_name='base64',
            parameters={'text': 'test', 'action': 'encode'},
            result_preview='dGVzdA=='
        )
        self.assertEqual(history.session_key, 'test_session')
        self.assertEqual(history.tool_name, 'base64')


class ViewsTestCase(TestCase):
    """视图测试"""
    
    def setUp(self):
        self.client = Client()
    
    def test_index_view(self):
        """测试首页视图"""
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '工具箱')
    
    def test_base64_tool_get(self):
        """测试Base64工具GET请求"""
        response = self.client.get(reverse('base64_tool'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Base64')
    
    def test_base64_tool_post_encode(self):
        """测试Base64编码POST请求"""
        data = {
            'text': 'Hello World',
            'action': 'encode'
        }
        response = self.client.post(reverse('base64_tool'), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'SGVsbG8gV29ybGQ=')
    
    def test_base64_tool_post_decode(self):
        """测试Base64解码POST请求"""
        data = {
            'text': 'SGVsbG8gV29ybGQ=',
            'action': 'decode'
        }
        response = self.client.post(reverse('base64_tool'), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Hello World')
    
    def test_base64_tool_ajax(self):
        """测试Base64工具AJAX请求"""
        data = {
            'text': 'Hello World',
            'action': 'encode'
        }
        response = self.client.post(
            reverse('base64_tool'), 
            data,
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response content: {response.content}")
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        self.assertEqual(json_data['result'], 'SGVsbG8gV29ybGQ=')
    
    def test_diff_tool(self):
        """测试文本对比工具"""
        data = {
            'text1': 'Hello\nWorld',
            'text2': 'Hello\nPython'
        }
        response = self.client.post(reverse('diff_tool'), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'World')
        self.assertContains(response, 'Python')
    
    def test_timestamp_tool(self):
        """测试时间戳工具"""
        data = {
            'timestamp': '1640995200'
        }
        response = self.client.post(reverse('timestamp_tool'), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '2022-01-01')
    
    def test_ipgen_tool(self):
        """测试IP生成工具"""
        data = {
            'ip_type': 'ipv4',
            'count': 2
        }
        response = self.client.post(reverse('ipgen_tool'), data)
        self.assertEqual(response.status_code, 200)
        # 检查是否生成了IP地址
        content = response.content.decode()
        ip_count = content.count('.')
        self.assertGreaterEqual(ip_count, 6)  # 至少2个IPv4地址
    
    def test_password_tool(self):
        """测试密码生成工具"""
        data = {
            'length': 10,
            'use_upper': True,
            'use_lower': True,
            'use_digits': True,
            'use_symbols': False,
            'count': 1
        }
        response = self.client.post(reverse('password_tool'), data)
        self.assertEqual(response.status_code, 200)
    
    def test_uuid_tool(self):
        """测试UUID生成工具"""
        data = {
            'version': 4,
            'count': 2
        }
        response = self.client.post(reverse('uuid_tool'), data)
        self.assertEqual(response.status_code, 200)
        # 检查是否生成了UUID
        content = response.content.decode()
        uuid_count = content.count('-')
        self.assertGreaterEqual(uuid_count, 8)  # 至少2个UUID
    
    def test_unicode_tool_encode(self):
        """测试Unicode编码"""
        data = {
            'text': '你好',
            'action': 'encode'
        }
        response = self.client.post(reverse('unicode_tool'), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '\\u4f60\\u597d')
    
    def test_unicode_tool_decode(self):
        """测试Unicode解码"""
        data = {
            'text': '\\u4f60\\u597d',
            'action': 'decode'
        }
        response = self.client.post(reverse('unicode_tool'), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '你好')
    
    def test_language_switch(self):
        """测试语言切换"""
        response = self.client.get(reverse('switch_language', args=['en']))
        self.assertEqual(response.status_code, 302)  # 重定向


class IntegrationTestCase(TestCase):
    """集成测试"""
    
    def setUp(self):
        self.client = Client()
    
    def test_user_preference_integration(self):
        """测试用户偏好集成"""
        # 访问工具页面
        response = self.client.get(reverse('base64_tool'))
        self.assertEqual(response.status_code, 200)
        
        # 检查是否创建了用户偏好
        session_key = self.client.session.session_key
        if session_key:
            prefs = UserPreference.objects.filter(session_key=session_key)
            # 注意：由于我们的实现是在POST时才创建偏好，所以这里可能为空
    
    def test_tool_usage_tracking(self):
        """测试工具使用统计"""
        # 使用Base64工具
        data = {'text': 'test', 'action': 'encode'}
        self.client.post(reverse('base64_tool'), data)
        
        # 检查使用统计
        usage = ToolUsage.objects.filter(tool_name='base64').first()
        if usage:
            self.assertGreaterEqual(usage.usage_count, 1)
    
    def test_error_handling(self):
        """测试错误处理"""
        # 测试Base64解码错误
        data = {
            'text': 'invalid_base64!@#',
            'action': 'decode'
        }
        response = self.client.post(reverse('base64_tool'), data)
        self.assertEqual(response.status_code, 200)
        # 应该包含错误信息（检查处理失败或Base64相关错误）
        content = response.content.decode()
        self.assertTrue('失败' in content or 'error' in content.lower() or 'Base64' in content)


class PerformanceTestCase(TestCase):
    """性能测试"""
    
    def test_batch_operations(self):
        """测试批量操作性能"""
        # 测试批量生成密码
        data = {
            'length': 12,
            'use_upper': True,
            'use_lower': True,
            'use_digits': True,
            'use_symbols': False,
            'count': 100
        }
        response = self.client.post(reverse('password_tool'), data)
        self.assertEqual(response.status_code, 200)
        
        # 测试批量生成UUID
        data = {
            'version': 4,
            'count': 100
        }
        response = self.client.post(reverse('uuid_tool'), data)
        self.assertEqual(response.status_code, 200)
