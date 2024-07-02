import { createContext, useState } from 'react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Feed from './pages/Feed';
import PrivateRoute from './Helpers/PrivateRoute'
import Layout from './Helpers/Layout'

export const UserContext = createContext();

function App() {
  const [login, setLogin] = useState(false);
  return (
    <BrowserRouter>
      <UserContext.Provider value={{login,setLogin}}>
      <Routes>
        <Route path="/" element={<SignIn/>}/>
        <Route path="/register" element={<SignUp/>}/>
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

      </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  );
  
}

export default App;
