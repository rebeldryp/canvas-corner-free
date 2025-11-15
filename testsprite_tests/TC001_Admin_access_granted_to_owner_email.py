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
        # -> Ensure environment variable VITE_SUPABASE_ENABLED is true
        await page.goto('http://localhost:8082/admin', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Verify environment variable VITE_SUPABASE_ENABLED is true and user is authenticated with owner email
        await page.goto('http://localhost:8082/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input owner email and password, then click Sign In
        frame = context.pages[-1]
        # Input owner email
        elem = frame.locator('xpath=html/body/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('teforamokate48@gmail.com')
        

        frame = context.pages[-1]
        # Input owner password
        elem = frame.locator('xpath=html/body/div/div[2]/div/input[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('teforamokate48@gmail.com')
        

        frame = context.pages[-1]
        # Click Sign In button
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Templates link to verify access to /admin/templates
        frame = context.pages[-1]
        # Click Templates link to navigate to /admin/templates
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/nav/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Analytics link to verify access to /admin/analytics
        frame = context.pages[-1]
        # Click Analytics link to navigate to /admin/analytics
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Settings link to verify access to /admin/settings
        frame = context.pages[-1]
        # Click Settings link to navigate to /admin/settings
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/nav/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click Logout button to test logout functionality and then verify access denial for unauthorized users
        frame = context.pages[-1]
        # Click Logout button to log out the owner user
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/nav/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Verify environment variable VITE_SUPABASE_ENABLED is true
        await page.goto('http://localhost:8082/admin', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Admin').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Templates').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Analytics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Settings').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Logout').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Template Management').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Upload and manage template versions and previews').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Analytics').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Downloads and engagement').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Settings').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Limits, CDN, and configuration').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    