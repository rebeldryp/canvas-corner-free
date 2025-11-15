import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8082", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Navigate back to base URL and verify environment variable VITE_SUPABASE_ENABLED is set to true
        await page.goto('http://localhost:8082/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Set VITE_SUPABASE_ENABLED to true and reload the page
        await page.goto('http://localhost:8082/admin', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to login page or trigger login to authenticate with case-different email
        await page.goto('http://localhost:8082/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input email with case difference and password, then click Sign In
        frame = context.pages[-1]
        # Input email with case difference to test case sensitivity
        elem = frame.locator('xpath=html/body/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Teforamokate48@gmail.com')
        

        frame = context.pages[-1]
        # Input password for authentication
        elem = frame.locator('xpath=html/body/div/div[2]/div/input[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('teforamokate48@gmail.com')
        

        frame = context.pages[-1]
        # Click Sign In button to attempt login
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the Logout button to log out from the current session
        frame = context.pages[-1]
        # Click Logout button to log out from current session
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/nav/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input exact OWNER_EMAIL and password, then click Sign In to verify access is granted
        frame = context.pages[-1]
        # Input exact OWNER_EMAIL for authentication
        elem = frame.locator('xpath=html/body/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('teforamokate48@gmail.com')
        

        frame = context.pages[-1]
        # Input password for authentication
        elem = frame.locator('xpath=html/body/div/div[2]/div/input[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('teforamokate48@gmail.com')
        

        frame = context.pages[-1]
        # Click Sign In button to attempt login
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Write test report to testsprite_tests/testsprite-mcp-test-report.md summarizing that admin access is not denied for case-different email, indicating case insensitivity in email verification.
        await page.goto('http://localhost:8082/testsprite_tests/testsprite-mcp-test-report.md', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Access denied').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    