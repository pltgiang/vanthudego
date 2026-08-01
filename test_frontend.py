import os
import sys
import json
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.on("console", lambda msg: errors.append(f"CONSOLE: {msg.type} {msg.text}") if msg.type == 'error' else None)
        
        try:
            print("Fetching token via API...")
            import requests
            res = requests.post("http://localhost:8001/api/auth/login", json={"username": "DEMONV", "password": "code"})
            if res.status_code == 200:
                data = res.json()["data"]
                access_token = data["access_token"]
                refresh_token = data["refresh_token"]
                user = data["user"]
                print("Got tokens.")
                
                context.add_init_script(f"""
                    localStorage.setItem('dms_access_token', '{access_token}');
                    localStorage.setItem('dms_refresh_token', '{refresh_token}');
                    localStorage.setItem('dms_user', JSON.stringify({json.dumps(user)}));
                """)
            else:
                print("Failed to get tokens", res.text)
                return
            
            print("Navigating directly to hdsd/9...")
            page.goto('http://localhost:8082/hdsd/9', wait_until='load', timeout=10000)
            print("Waiting for page render...")
            page.wait_for_timeout(3000)
            
            print("Errors:")
            for err in errors:
                print(err)
            
            html = page.content()
            print("Body length:", len(html))
            
        except Exception as e:
            print(f"Exception: {e}")
        finally:
            browser.close()

if __name__ == '__main__':
    run_test()
