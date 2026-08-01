import os
import sys
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
            print("Navigating directly to hdsd/9...")
            page.goto('http://localhost:8082/hdsd/9', wait_until='load', timeout=15000)
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
