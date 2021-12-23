import './App.css';
import axios from 'axios';
import { useState } from 'react';

const axiosConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
}
axios.defaults.baseURL = axiosConfig.baseURL;

// Response interceptor for API calls
// => will intercept expired tokens and try to refresh token by calling /refresh route...
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // GET ORIGINAL REQUEST!
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refresh_token")

    // in case we are unauthorized AND have a refreshtoken 
    // => fetch new access token & retry request!
    if (error.response.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("Unauthorized. Trying refresh...")

      // create axios instance which will NOT use our global interceptor
      // => this prevents that an error on the refresh route gets intercepted
      // => which would produce an error endless loop :) 
      const instance = axios.create( axiosConfig )
      const responseRefresh = await instance.get("/refresh", {
        headers: { refresh_token: refreshToken }
      })

      if(responseRefresh.status.code !== 401) {
        console.log("Refresh worked!!!")
        // store new token pair
        storeTokens(responseRefresh.data)
        console.log("Retry original request with NEW token...")
        originalRequest.headers.token = responseRefresh.data.token

        // prevent that this call get's intercepted...
        return axios(originalRequest)
      }
      else {
        console.log("Refresh did not work out, prob refresh cookie not there or expired!")
        // clear tokens
        clearTokens()
      }
      
    }
    return Promise.reject(error);
  }
);

const clearTokens = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("refresh_token")
}

const storeTokens = ({token, refresh_token}) => {
  localStorage.setItem("token", token)
  localStorage.setItem("refresh_token", refresh_token)
}

function App() {
  
  const [ message, setMessage ] = useState('');
  const [ error, setError ] = useState('');

  const login = async () => {
    try {
      const response = await axios.get('/login');
      console.log(response.data);
      setError('');
      setMessage(`Logged you in, ${response.data.user.username}`);
      storeTokens(response.data)
    } 
    catch (err) {
      const errorMsg = err.response && err.response.data.error.message;
      setError(errorMsg || 'API not available...');
    }
  };

  const getSecret = async () => {

    const token = localStorage.getItem("token")

    try {
      const response = await axios.get('/protected', {
        headers: { token }
      });
      console.log("Accessing protected route worked!")
      setError('');
      setMessage(response.data.message);
    } 
    catch (err) {
      console.log("Final response finished...")
      const errorMsg = err.response && err.response.data.error.message;
      setMessage('');
      setError(errorMsg || 'API not available...');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <button onClick={login}>Login</button>
        </div>
        <div>
          <button onClick={getSecret}>Show Protected Information</button>
        </div>
        {error ? <div className="error">{error}</div> : <div className="result">{message}</div>}
      </header>
    </div>
  );
}

export default App;
