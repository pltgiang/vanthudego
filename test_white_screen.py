import sys
from playwright.sync_api import sync_playwright

def test_page():
    with open('browser_logs.txt', 'w', encoding='utf-8') as f:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            page.on("console", lambda msg: f.write(f"Browser console [{msg.type}]: {msg.text}\n"))
            page.on("pageerror", lambda err: f.write(f"Browser error: {err}\n"))
            
            f.write("Navigating to http://localhost:8082/hdsd/4\n")
            response = page.goto("http://localhost:8082/hdsd/4")
            f.write(f"Status: {response.status}\n")
            
            page.wait_for_timeout(3000)
            browser.close()

if __name__ == "__main__":
    test_page()
