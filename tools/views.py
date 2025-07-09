from django.shortcuts import render
from .forms import Base64Form, DiffForm, TimestampForm, IPGenForm, PasswordForm, UUIDForm, UnicodeForm
import base64, difflib, datetime, ipaddress, secrets, string, uuid
from django.http import HttpResponse
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import JsonResponse


def index(request):
    return render(request, 'tools/index.html')

def base64_tool(request):
    result = None
    file_result = None
    text = ''
    action = 'encode'
    if request.method == 'POST':
        form = Base64Form(request.POST, request.FILES)
        if form.is_valid():
            text = form.cleaned_data['text']
            action = form.cleaned_data['action']
            file = request.FILES.get('file')
            if file:
                file_content = file.read()
                if action == 'encode':
                    result = base64.b64encode(file_content).decode('utf-8')
                else:
                    try:
                        decoded = base64.b64decode(file_content)
                        # 文件解码AJAX返回base64字符串
                        result = base64.b64encode(decoded).decode('utf-8')
                    except Exception as e:
                        result = f'解码失败: {e}'
            elif text:
                if action == 'encode':
                    result = base64.b64encode(text.encode('utf-8')).decode('utf-8')
                else:
                    try:
                        result = base64.b64decode(text.encode('utf-8')).decode('utf-8')
                    except Exception as e:
                        result = f'解码失败: {e}'
        else:
            result = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'result': result, 'text': text, 'action': action})
    else:
        form = Base64Form()
    return render(request, 'tools/base64.html', {'result': result, 'text': text, 'action': action})

def diff_tool(request):
    diff = None
    text1 = text2 = ''
    if request.method == 'POST':
        form = DiffForm(request.POST)
        if form.is_valid():
            text1 = form.cleaned_data['text1']
            text2 = form.cleaned_data['text2']
            d = difflib.unified_diff(text1.splitlines(), text2.splitlines(), lineterm='')
            diff = '\n'.join(d)
        else:
            diff = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'diff': diff, 'text1': text1, 'text2': text2})
    else:
        form = DiffForm()
    return render(request, 'tools/diff.html', {'diff': diff, 'text1': text1, 'text2': text2})

def timestamp_tool(request):
    import time
    result = None
    timestamp = ''
    datetime_str = ''
    if request.method == 'POST':
        form = TimestampForm(request.POST)
        if form.is_valid():
            timestamp = form.cleaned_data['timestamp']
            datetime_str = form.cleaned_data['datetime_str']
            if timestamp:
                try:
                    ts = float(timestamp)
                    # 自动判断毫秒还是秒
                    if ts > 1e12:  # 13位毫秒
                        ms = int(ts) % 1000
                        ts = ts / 1000
                    else:
                        ms = int((ts - int(ts)) * 1000)
                    dt = datetime.datetime.fromtimestamp(ts)
                    result = dt.strftime('%Y-%m-%d %H:%M:%S.{:03d}'.format(ms))
                except Exception as e:
                    result = f'转换失败: {e}'
            elif datetime_str:
                try:
                    # 支持毫秒级日期时间
                    if '.' in datetime_str:
                        dt = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S.%f')
                    else:
                        dt = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
                    sec_ts = int(dt.timestamp())
                    ms_ts = int(dt.timestamp() * 1000 + dt.microsecond // 1000)
                    result = f'秒级时间戳：{sec_ts}\n毫秒时间戳：{ms_ts}'
                except Exception as e:
                    result = f'转换失败: {e}'
        else:
            result = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'result': result, 'timestamp': timestamp, 'datetime_str': datetime_str})
    else:
        form = TimestampForm()
        # 默认展示当前时间和毫秒时间戳
        now = datetime.datetime.now()
        timestamp = str(int(now.timestamp()))
        ms_timestamp = str(int(now.timestamp() * 1000))
        datetime_str = now.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        result = f'当前时间：{datetime_str}\n秒级时间戳：{timestamp}\n毫秒时间戳：{ms_timestamp}'
    return render(request, 'tools/timestamp.html', {'result': result, 'timestamp': timestamp, 'datetime_str': datetime_str})

def ipgen_tool(request):
    result = None
    ip_type = 'ipv4'
    count = 1
    if request.method == 'POST':
        form = IPGenForm(request.POST)
        if form.is_valid():
            ip_type = form.cleaned_data['ip_type']
            count = form.cleaned_data['count']
            ips = []
            for _ in range(count):
                if ip_type == 'ipv4':
                    ip = '.'.join(str(secrets.randbelow(256)) for _ in range(4))
                else:
                    ip = ':'.join('%x' % secrets.randbits(16) for _ in range(8))
                ips.append(ip)
            result = '\n'.join(ips)
        else:
            result = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'result': result, 'ip_type': ip_type, 'count': count})
    else:
        form = IPGenForm()
    return render(request, 'tools/ipgen.html', {'result': result, 'ip_type': ip_type, 'count': count})

def password_tool(request):
    result = None
    length = 12
    use_upper = use_lower = use_digits = True
    use_symbols = False
    count = 1
    if request.method == 'POST':
        form = PasswordForm(request.POST)
        if form.is_valid():
            length = form.cleaned_data['length']
            use_upper = form.cleaned_data['use_upper']
            use_lower = form.cleaned_data['use_lower']
            use_digits = form.cleaned_data['use_digits']
            use_symbols = form.cleaned_data['use_symbols']
            count = form.cleaned_data['count']
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
                result = '请至少选择一种字符类型！'
            else:
                result = '\n'.join(''.join(secrets.choice(chars) for _ in range(length)) for _ in range(count))
        else:
            result = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'result': result})
    else:
        form = PasswordForm()
    return render(request, 'tools/password.html', {
        'result': result,
        'length': length,
        'use_upper': use_upper,
        'use_lower': use_lower,
        'use_digits': use_digits,
        'use_symbols': use_symbols,
        'count': count,
    })

def uuid_tool(request):
    result = None
    version = 4
    count = 1
    if request.method == 'POST':
        form = UUIDForm(request.POST)
        if form.is_valid():
            version = int(form.cleaned_data['version'])
            count = form.cleaned_data['count']
            uuids = []
            for _ in range(count):
                if version == 1:
                    u = uuid.uuid1()
                elif version == 3:
                    # 用NAMESPACE_DNS和固定名字演示
                    u = uuid.uuid3(uuid.NAMESPACE_DNS, 'example.com')
                elif version == 4:
                    u = uuid.uuid4()
                elif version == 5:
                    u = uuid.uuid5(uuid.NAMESPACE_DNS, 'example.com')
                else:
                    u = uuid.uuid4()
                uuids.append(str(u))
            result = '\n'.join(uuids)
        else:
            result = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'result': result, 'version': version, 'count': count})
    else:
        form = UUIDForm()
    return render(request, 'tools/uuid.html', {'result': result, 'version': version, 'count': count})

def unicode_tool(request):
    result = None
    text = ''
    action = 'encode'
    if request.method == 'POST':
        form = UnicodeForm(request.POST)
        if form.is_valid():
            text = form.cleaned_data['text']
            action = form.cleaned_data['action']
            if action == 'encode':
                # 所有字符转Unicode
                result = ''.join(['\\u{:04x}'.format(ord(c)) for c in text])
            else:
                # Unicode转中文
                import re
                def decode_unicode(match):
                    return chr(int(match.group(1), 16))
                result = re.sub(r'\\u([0-9a-fA-F]{4})', decode_unicode, text)
        else:
            result = '参数错误'
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'result': result, 'text': text, 'action': action})
    else:
        form = UnicodeForm()
    return render(request, 'tools/unicode.html', {'result': result, 'text': text, 'action': action})
