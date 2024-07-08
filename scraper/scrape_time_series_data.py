from webdriver_manager.chrome import ChromeDriverManager
from scrapy import Selector
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
import csv
import time

def getdriver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--log-level=3')  # Suppress browser logs
    
    prefs = {
        "profile.managed_default_content_settings.images": 2,
        "profile.default_content_settings.cookies": 2
    }
    options.add_experimental_option("prefs", prefs)
    
    driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))
    return driver

def rearrange_string(text):
    parts = text.split(':')
    symbol = parts[1].strip()
    exchange = parts[0].strip()
    return f"{symbol}:{exchange}"

def scraping_time_series_graph(driver, file_writer, seen):
    time.sleep(2)
    try:
        graph = driver.find_element(By.XPATH, "//*[name()='svg']/*[name()='g']/descendant::*[name()='g'][@class='gJBfM']")
    except Exception as e:
        print(f"Error finding graph: {e}")
        return

    try:
        for x in range(-325, 325, 1):
            action = ActionChains(driver).move_to_element_with_offset(graph, x, graph.size['height'] / 2)
            action.perform()
            response = Selector(text=driver.page_source)
            price = response.xpath("//div[@class='hSGhwc']/p[@jsname='BYCTfd']/text()").get()
            date = response.xpath("//div[@class='hSGhwc']/p[@jsname='LlMULe']/text()").get()
            volume = response.xpath("//div[@class='hSGhwc']/p[@jsname='R30goc']/span/text()").get()

            if price and date and volume:
                data = (date, price, volume)
                if data not in seen:
                    seen.add(data)
                    file_writer.writerow(data)
                    print(f"Data written: {data}")  # Debug print
    except Exception as e:
        print(f"Error during action or scraping: {e}")

our_tickers = [
    'NSE: RELIANCE',
    'NSE: RPOWER',
    'NSE: TCS',
    'NSE: INFY',
]

driver = getdriver()
timeframe = '1D'  # i.e '1D','5D','1M','6M','YTD','1Y','5Y','MAX'
filename = 'data1.csv'

with open(filename, mode='w', newline='', encoding='utf-8') as file:
    file_writer = csv.writer(file)
    file_writer.writerow(['date', 'price', 'volume'])  # Header row
    seen = set()

    for ticker in our_tickers:
        ticker = rearrange_string(ticker)
        driver.get(f'https://www.google.com/finance/quote/{ticker}?hl=en&window={timeframe}')
        scraping_time_series_graph(driver, file_writer, seen)

driver.quit()
