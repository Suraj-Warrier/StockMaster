import asyncio
import aiohttp
from bs4 import BeautifulSoup
import yfinance as yf

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
                print(f"Stock: {stock_symbol}, Price: {clean_price}")
                
                # Fetch additional data using yfinance
                ticker = yf.Ticker(stock_symbol)
                volume = ticker.history(period='1d')['Volume'].iloc[0]
                print(f"Trade Volume: {volume}")
            except AttributeError:
                print(f"Could not find the stock data for {stock_symbol}")
        else:
            print(f"Failed to retrieve data for {stock_symbol}. HTTP Status code: {response.status}")

async def main(stock_symbols):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_stock_data(session, symbol) for symbol in stock_symbols]
        await asyncio.gather(*tasks)

# Example usage
stock_symbols = ['RELIANCE', 'TCS', 'INFY', 'RPOWER']  # Add more symbols as needed
asyncio.run(main(stock_symbols))
