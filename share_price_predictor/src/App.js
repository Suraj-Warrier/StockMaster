import { createContext, useState } from 'react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Feed from './pages/Feed';
import PrivateRoute from './Helpers/PrivateRoute';
import Layout from './Helpers/Layout';
import StockDetail from './pages/StockDetail'; // Import the StockDetail component
import WatchlistPage from './pages/WatchlistPage';

export const UserContext = createContext();

function App() {
  const [login, setLogin] = useState(false);
  const [feedStocks,setFeedStocks] = useState([]);
  const [currentPrices, setCurrentPrices]  = useState([]);
  const [lastPrices,setLastPrices] = useState([]);
  return (
    <BrowserRouter>
      <UserContext.Provider value={{ login, setLogin,feedStocks,setFeedStocks, currentPrices, setCurrentPrices,lastPrices,setLastPrices }}>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route
            path="/feed"
            element={
              <PrivateRoute>
                <Layout>
                  <Feed />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/stock/:symbol"
            element={
              <PrivateRoute>
                <Layout>
                  <StockDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/watchlist/:watchlistId"
            element={
              <PrivateRoute>
                <Layout>
                  <WatchlistPage />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
