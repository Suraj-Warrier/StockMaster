import { createContext, useState } from 'react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Feed from './pages/Feed';
import PrivateRoute from './Helpers/PrivateRoute';
import Layout from './Helpers/Layout';
import StockDetail from './pages/StockDetail'; // Import the StockDetail component

export const UserContext = createContext();

function App() {
  const [login, setLogin] = useState(false);
  const [feedStocks,setFeedStocks] = useState([]);
  return (
    <BrowserRouter>
      <UserContext.Provider value={{ login, setLogin,feedStocks,setFeedStocks }}>
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
              // <PrivateRoute>
                <Layout>
                  <StockDetail />
                </Layout>
              // </PrivateRoute>
            }
          />
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
