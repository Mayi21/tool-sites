from django import forms

class Base64Form(forms.Form):
    text = forms.CharField(label='字符串', required=False, widget=forms.Textarea)
    file = forms.FileField(label='文件', required=False)
    action = forms.ChoiceField(choices=[('encode', '编码'), ('decode', '解码')], initial='encode')

class DiffForm(forms.Form):
    text1 = forms.CharField(label='文本1', widget=forms.Textarea)
    text2 = forms.CharField(label='文本2', widget=forms.Textarea)

class TimestampForm(forms.Form):
    timestamp = forms.CharField(label='Unix 时间戳', required=False)
    datetime_str = forms.CharField(label='日期时间', required=False)

class IPGenForm(forms.Form):
    ip_type = forms.ChoiceField(label='类型', choices=[('ipv4', 'IPv4'), ('ipv6', 'IPv6')], initial='ipv4')
    count = forms.IntegerField(label='数量', min_value=1, max_value=200, initial=1)

class PasswordForm(forms.Form):
    length = forms.IntegerField(label='密码长度', min_value=4, max_value=64, initial=12)
    use_upper = forms.BooleanField(label='大写字母', required=False, initial=True)
    use_lower = forms.BooleanField(label='小写字母', required=False, initial=True)
    use_digits = forms.BooleanField(label='数字', required=False, initial=True)
    use_symbols = forms.BooleanField(label='特殊符号', required=False, initial=False)
    count = forms.IntegerField(label='生成数量', min_value=1, max_value=200, initial=1)

class UUIDForm(forms.Form):
    UUID_VERSION_CHOICES = [
        (1, 'UUID1（基于时间）'),
        (3, 'UUID3（基于名字+MD5）'),
        (4, 'UUID4（随机）'),
        (5, 'UUID5（基于名字+SHA1）'),
    ]
    version = forms.ChoiceField(label='UUID版本', choices=UUID_VERSION_CHOICES, initial=4)
    count = forms.IntegerField(label='生成数量', min_value=1, max_value=200, initial=1)
    # 对于3/5，实际页面只做简单演示，名字空间和名字可用默认值 

class UnicodeForm(forms.Form):
    text = forms.CharField(label='输入内容', widget=forms.Textarea(attrs={'rows': 3}), required=True)
    action = forms.ChoiceField(label='操作', choices=[('encode', '中文转Unicode'), ('decode', 'Unicode转中文')], initial='encode') 