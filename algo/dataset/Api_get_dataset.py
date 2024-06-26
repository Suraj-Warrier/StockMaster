import requests

def download_csv(url, params, filename):
    """
    Download CSV data from the specified URL and save it to a file.

    :param url: str, The API endpoint URL.
    :param params: dict, Dictionary of query parameters.
    :param filename: str, The name of the file to save the data to.
    """
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses

        with open(filename, 'wb') as file:
            file.write(response.content)
        print(f"Data successfully saved to {filename}")
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"An error occurred: {err}")

# Example usage
if __name__ == "__main__":
    stocks = ["BAJAJ-AUTO.BSE","ADANIGREEN.BSE","TATAMOTORS.BSE","HDFCBANK.BSE","COALINDIA.BSE","COLPAL.BSE","GILLETTE.BSE","GODREJIND.BSE","IBM","IRCTC.BSE","KALYANKJIL.BSE","NESTLEIND.BSE","NHPC.BSE","RELIANCE.BSE","SUZLON.BSE"]
    for stock in stocks:
        api_url = "https://www.alphavantage.co/query"
        symbol = stock
        interval = "5min"
        function = "TIME_SERIES_WEEKLY"
        query_params = {
            "function": function,
            "symbol": symbol,
            "outputsize":"full",
            "interval":interval,
            "apikey": "BH74MEWAH8WMLW7N",
            "datatype": "csv"
        }
        filename = f"{symbol}_{interval}.csv"
        download_csv(api_url, query_params, filename)
