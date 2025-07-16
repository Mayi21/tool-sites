from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.utils.translation import gettext_lazy as _, activate
from django.utils import translation
from django.urls import reverse
from .forms import Base64Form, DiffForm, TimestampForm, IPGenForm, PasswordForm, UUIDForm, UnicodeForm
from .utils import ToolViewMixin, safe_decode_base64, safe_encode_base64, validate_timestamp, generate_secure_password
import base64, difflib, datetime, ipaddress, secrets, string, uuid, re


def index(request):
    return render(request, 'tools/index.html')

def switch_language(request, language):
    """语言切换视图"""
    if language in ['zh-hans', 'en']:
        activate(language)
        request.session['django_language'] = language
    return redirect(request.META.get('HTTP_REFERER', '/'))

def base64_tool(request):
    def process_base64(data):
        text = data.get('text', '')
        action = data.get('action', 'encode')
        file = request.FILES.get('file')
        
        if file:
            file_content = file.read()
            if action == 'encode':
                result = safe_encode_base64(file_content)
            else:
                decoded = base64.b64decode(file_content)
                result = safe_encode_base64(decoded)
        elif text:
            if action == 'encode':
                result = safe_encode_base64(text)
            else:
                result = safe_decode_base64(text)
        else:
            result = ''
            
        return {'result': result, 'text': text, 'action': action}
    
    initial_data = {'text': '', 'action': 'encode'}
    return ToolViewMixin.handle_tool_request(
        request, Base64Form, 'tools/base64.html', process_base64, initial_data
    )

def diff_tool(request):
    def process_diff(data):
        text1 = data.get('text1', '')
        text2 = data.get('text2', '')
        d = difflib.unified_diff(text1.splitlines(), text2.splitlines(), lineterm='')
        diff = '\n'.join(d)
        return {'diff': diff, 'text1': text1, 'text2': text2}
    
    initial_data = {'text1': '', 'text2': '', 'diff': None}
    return ToolViewMixin.handle_tool_request(
        request, DiffForm, 'tools/diff.html', process_diff, initial_data
    )

def timestamp_tool(request):
    def process_timestamp(data):
        timestamp = data.get('timestamp', '')
        datetime_str = data.get('datetime_str', '')
        
        if timestamp:
            ts, ms = validate_timestamp(timestamp)
            dt = datetime.datetime.fromtimestamp(ts)
            result = dt.strftime('%Y-%m-%d %H:%M:%S.{:03d}'.format(ms))
        elif datetime_str:
            # 支持毫秒级日期时间
            if '.' in datetime_str:
                dt = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S.%f')
            else:
                dt = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
            sec_ts = int(dt.timestamp())
            ms_ts = int(dt.timestamp() * 1000 + dt.microsecond // 1000)
            result = _('秒级时间戳：') + str(sec_ts) + '\n' + _('毫秒时间戳：') + str(ms_ts)
        else:
            result = ''
            
        return {'result': result, 'timestamp': timestamp, 'datetime_str': datetime_str}
    
    # 默认展示当前时间
    now = datetime.datetime.now()
    initial_data = {
        'timestamp': str(int(now.timestamp())),
        'datetime_str': now.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3],
        'result': (
            _('当前时间：') + now.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3] + '\n' +
            _('秒级时间戳：') + str(int(now.timestamp())) + '\n' +
            _('毫秒时间戳：') + str(int(now.timestamp() * 1000))
        )
    }
    
    return ToolViewMixin.handle_tool_request(
        request, TimestampForm, 'tools/timestamp.html', process_timestamp, initial_data
    )

def ipgen_tool(request):
    def process_ipgen(data):
        ip_type = data.get('ip_type', 'ipv4')
        count = data.get('count', 1)
        ips = []
        for _ in range(count):
            if ip_type == 'ipv4':
                ip = '.'.join(str(secrets.randbelow(256)) for _ in range(4))
            else:
                ip = ':'.join('%x' % secrets.randbits(16) for _ in range(8))
            ips.append(ip)
        result = '\n'.join(ips)
        return {'result': result, 'ip_type': ip_type, 'count': count}
    
    initial_data = {'ip_type': 'ipv4', 'count': 1}
    return ToolViewMixin.handle_tool_request(
        request, IPGenForm, 'tools/ipgen.html', process_ipgen, initial_data
    )

def password_tool(request):
    def process_password(data):
        length = data.get('length', 12)
        use_upper = data.get('use_upper', True)
        use_lower = data.get('use_lower', True)
        use_digits = data.get('use_digits', True)
        use_symbols = data.get('use_symbols', False)
        count = data.get('count', 1)
        
        passwords = []
        for _ in range(count):
            password = generate_secure_password(length, use_upper, use_lower, use_digits, use_symbols)
            passwords.append(password)
        
        result = '\n'.join(passwords)
        return {
            'result': result,
            'length': length,
            'use_upper': use_upper,
            'use_lower': use_lower,
            'use_digits': use_digits,
            'use_symbols': use_symbols,
            'count': count,
        }
    
    initial_data = {
        'length': 12,
        'use_upper': True,
        'use_lower': True,
        'use_digits': True,
        'use_symbols': False,
        'count': 1,
    }
    return ToolViewMixin.handle_tool_request(
        request, PasswordForm, 'tools/password.html', process_password, initial_data
    )

def uuid_tool(request):
    def process_uuid(data):
        version = int(data.get('version', 4))
        count = data.get('count', 1)
        uuids = []
        for _ in range(count):
            if version == 1:
                u = uuid.uuid1()
            elif version == 3:
                u = uuid.uuid3(uuid.NAMESPACE_DNS, 'example.com')
            elif version == 4:
                u = uuid.uuid4()
            elif version == 5:
                u = uuid.uuid5(uuid.NAMESPACE_DNS, 'example.com')
            else:
                u = uuid.uuid4()
            uuids.append(str(u))
        result = '\n'.join(uuids)
        return {'result': result, 'version': version, 'count': count}
    
    initial_data = {'version': 4, 'count': 1}
    return ToolViewMixin.handle_tool_request(
        request, UUIDForm, 'tools/uuid.html', process_uuid, initial_data
    )

def unicode_tool(request):
    def process_unicode(data):
        text = data.get('text', '')
        action = data.get('action', 'encode')
        
        if action == 'encode':
            # 所有字符转Unicode，保持换行符的可读性
            result = ''
            for char in text:
                if char == '\n':
                    result += '\\u000a\n'  # 换行符后添加实际换行
                elif char == '\r':
                    result += '\\u000d'
                elif char == '\t':
                    result += '\\u0009'
                else:
                    result += '\\u{:04x}'.format(ord(char))
        else:
            # Unicode转中文
            def decode_unicode(match):
                return chr(int(match.group(1), 16))
            result = re.sub(r'\\u([0-9a-fA-F]{4})', decode_unicode, text)
            
        return {'result': result, 'text': text, 'action': action}
    
    initial_data = {'text': '', 'action': 'encode'}
    return ToolViewMixin.handle_tool_request(
        request, UnicodeForm, 'tools/unicode.html', process_unicode, initial_data
    )

