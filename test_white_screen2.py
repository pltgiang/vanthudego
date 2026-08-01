import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()
        
        def on_console(msg):
            try:
                print(f'CONSOLE: {msg.text}')
            except:
                pass
                
        def on_pageerror(err):
            try:
                print(f'PAGE ERROR: {err}')
            except:
                pass
                
        page.on('console', on_console)
        page.on('pageerror', on_pageerror)
        
        print('Navigating to login...')
        await page.goto('http://localhost:8082/')
        
        print('Setting localStorage...')
        await page.evaluate("""() => {
            const user = {id: 1, email: "admin@example.com", full_name: "Admin", permissions: {}};
            window.localStorage.setItem("user", JSON.stringify(user));
            window.localStorage.setItem("token", "fake_token");
        }""")
        
        print('Navigating to /hdsd/9...')
        await page.goto('http://localhost:8082/hdsd/9')
        await page.wait_for_timeout(2000)
        
        content = await page.content()
        with open('page_content_logged_in.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Done')
        await browser.close()

asyncio.run(main())
