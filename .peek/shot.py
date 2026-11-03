"""本地预览截图工具。

用法：
    python shot.py <url> <输出路径> [--full] [--wait 秒] [--scroll 选择器]

依赖：playwright（已装在 default env）
"""
import sys
import asyncio
from playwright.async_api import async_playwright


async def main():
    args = sys.argv[1:]
    url = args[0]
    out = args[1]
    full = "--full" in args
    wait = 4
    scroll = None

    if "--wait" in args:
        wait = float(args[args.index("--wait") + 1])
    if "--scroll" in args:
        scroll = args[args.index("--scroll") + 1]

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=(
                r"C:\Users\ASUS\AppData\Local\ms-playwright"
                r"\chromium-1208\chrome-win64\chrome.exe"
            ),
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto(url, wait_until="networkidle", timeout=45000)
        await page.wait_for_timeout(int(wait * 1000))

        if scroll:
            await page.evaluate(
                f"document.querySelector('{scroll}')?.scrollIntoView()"
            )
            await page.wait_for_timeout(2500)

        await page.screenshot(path=out, full_page=full)

        # 顺带输出关键信息
        info = await page.evaluate("""() => ({
            title: document.title,
            imgs: Array.from(document.images).map(i => ({
                src: i.src.split('/').pop(),
                ok: i.complete && i.naturalWidth > 0
            })).filter(i => !i.ok),
            text: document.body.innerText.slice(0, 200)
        })""")
        print(f"标题: {info['title']}")
        if info['imgs']:
            print(f"未加载图片: {[i['src'] for i in info['imgs']]}")
        else:
            print("所有图片加载正常")
        print(f"截图已保存: {out}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())