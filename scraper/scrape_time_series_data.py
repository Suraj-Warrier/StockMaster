from webdriver_manager.chrome import ChromeDriverManager
from scrapy import Selector
from selenium.webdriver.chrome.service import Service
import time
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def getdriver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.page_load_strategy = 'eager'  # Load the DOM quickly
    driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))
    return driver

def rearrange_string(text):
    parts = text.split(':')
    symbol = parts[1].strip()
    exchange = parts[0].strip()
    return f"{symbol}:{exchange}"

def scraping_time_series_graph(driver):
    data_points = []
    time.sleep(2)  # Reduced sleep time to speed up
    try:
        graph = driver.find_element(By.XPATH, "//*[name()='svg']/*[name()='g']/descendant::*[name()='g'][@class='gJBfM']")
    except Exception as e:
        # Error finding graph
        return []

    try:
        for x in range(-325, 325, 10):  # Adjusted step to 10 to reduce iterations
            action = ActionChains(driver).move_to_element_with_offset(graph, x, graph.size['height'] / 2)
            action.perform()
            response = Selector(text=driver.page_source)
            price = response.xpath("//div[@class='hSGhwc']/p[@jsname='BYCTfd']/text()").get()
            date = response.xpath("//div[@class='hSGhwc']/p[@jsname='LlMULe']/text()").get()
            volume = response.xpath("//div[@class='hSGhwc']/p[@jsname='R30goc']/span/text()").get()
            
            if price and date and volume:
                data = {
                    'price': price,
                    'date': date,
                    'volume': volume
                }
                data_points.append(data)
                print(data)  # Print the data instead of exporting to CSV
        return data_points
    except Exception as e:
        # Error during scraping
        return []

our_tickers = [
    'NSE: RELIANCE',
    'NSE: RPOWER',
    'NSE: TCS',
    'NSE: INFY',
]

driver = getdriver()
timeframe = '1D'  # i.e '1D','5D','1M','6M','YTD','1Y','5Y','MAX'
for ticker in our_tickers:
    ticker = rearrange_string(ticker)
    driver.get(f'https://www.google.com/finance/quote/{ticker}?hl=en&window={timeframe}')
    scraping_time_series_graph(driver)

driver.quit()
