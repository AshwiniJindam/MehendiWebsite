import json
import urllib.request
import urllib.error
from pathlib import Path

env_path = Path('.env')
if not env_path.exists():
    raise SystemExit('.env file not found')

with env_path.open('r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]

url = None
for line in lines:
    if line.startswith('VITE_GOOGLE_SCRIPT_URL='):
        url = line.split('=', 1)[1].strip()

print('URL:', url)
if not url:
    raise SystemExit('No VITE_GOOGLE_SCRIPT_URL found')

get_url = url + '?action=fetch'
print('GET URL:', get_url)

req = urllib.request.Request(get_url, headers={'Accept': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        print('GET STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except Exception as e:
    print('GET ERROR', repr(e))

payload = {
    'fullName': 'Test User',
    'phone': '9999999999',
    'email': 'test@example.com',
    'course': 'Basic Mehndi – ₹2,000 / 30 Days',
    'city': 'Pune',
    'message': 'Test message',
    'status': 'New',
}

post_req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(post_req, timeout=30) as resp:
        print('POST STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('POST HTTP ERROR', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('POST ERROR', repr(e))
