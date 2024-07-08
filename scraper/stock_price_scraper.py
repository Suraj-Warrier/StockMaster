import asyncio
import aiohttp
from bs4 import BeautifulSoup

async def fetch_stock_data(session, stock_symbol):
    url = f'https://www.google.com/finance/quote/{stock_symbol}:NSE'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    async with session.get(url, headers=headers) as response:
        if response.status == 200:
            html = await response.text()
            soup = BeautifulSoup(html, 'html.parser')
            
            try:
                price = soup.find('div', class_='YMlKec fxKbKc').text
                clean_price = price.replace('₹', '').replace(',', '').strip()
            except AttributeError:
                clean_price = "N/A"
                print(f"Could not find the stock price for {stock_symbol}")
            
            market_cap = avg_volume = pe_ratio = "N/A"
            
            try:
                details_divs = soup.find_all('div', class_='gyFHrc')
                for div in details_divs:
                    label = div.text.strip()
                    value_div = div.find('div', class_='P6K39c')
                    if value_div:
                        value = value_div.text.strip()

                        if 'Market cap' in label:
                            market_cap = value
                        elif 'Avg Volume' in label:
                            avg_volume = value
                        elif 'P/E ratio' in label:
                            pe_ratio = value
            except (AttributeError, IndexError):
                print(f"Could not find the additional details for {stock_symbol}")

            print(f"Stock: {stock_symbol}, Price: {clean_price}, Market Cap: {market_cap}, Avg Volume: {avg_volume}, PE Ratio: {pe_ratio}")
        else:
            print(f"Failed to retrieve data for {stock_symbol}. HTTP Status code: {response.status}")

async def main(stock_symbols):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_stock_data(session, symbol) for symbol in stock_symbols]
        await asyncio.gather(*tasks)

# Example usage
stock_symbols = ['RELIANCE', 'TCS', 'INFY', 'RPOWER', 'ADANIGREEN', 'BAJAJ-AUTO', 'COALINDIA', 'COLPAL', 'GILLETTE', 'GODREJIND', 'HDFCBANK']  # Add more symbols as needed
asyncio.run(main(stock_symbols))
