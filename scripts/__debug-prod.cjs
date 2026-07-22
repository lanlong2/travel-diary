const puppeteer = require('puppeteer-core')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ['--no-sandbox', '--disable-features=site-per-process', '--window-size=390,844'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  })
  try {
    const page = await browser.newPage()
    page.setDefaultTimeout(30000)
    page.on('console', (msg) => console.log(`[${msg.type()}]`, msg.text()))
    page.on('pageerror', (err) => console.log('[pageerror]', err.message))
    page.on('requestfailed', (req) => console.log('[reqfail]', req.url(), req.failure()?.errorText))

    const url = process.argv[2] || 'https://travel-diary-dvl.pages.dev/'
    console.log('Visiting:', url)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await new Promise((r) => setTimeout(r, 4000))
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.length)
    console.log('body html length:', bodyHTML)
    const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length ?? -1)
    console.log('root html length:', rootHTML)
    const title = await page.title()
    console.log('title:', title)
    await page.screenshot({ path: 'screenshots/prod-after-fix.png', fullPage: false })
    console.log('screenshot saved')
  } catch (err) {
    console.error('FAIL:', err.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
})()
