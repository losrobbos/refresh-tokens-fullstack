import './App.css';
import axios from 'axios';
import { useState } from 'react';

const axiosConfig = { 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true
}
axios.defaults.baseURL = axiosConfig.baseURL;
axios.defaults.withCredentials = axiosConfig.withCredentials;

// Response interceptor for API calls
// => will intercept expired tokens and try to refresh token by calling /refresh route...
axios.interceptors.response.use(
  (response) => {
    return response
  }, 
  async (error) => {
    // GET ORIGINAL REQUEST!
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;


      // create axios instance WITHOUT interceptor
      // => this prevents that an error on the refresh route gets intercepted
      // => which would produce an error endless loop :) 
      console.log("Unauthorized. Trying refresh...")
      const instance = axios.create( axiosConfig )
      const responseRefresh = await instance.get("/refresh")

      if(responseRefresh.status.code !== 401) {
        console.log("Refresh worked!!!")
        console.log("Retry request...")
        return axios(originalRequest) // prevent that this call get's intercepted...
      }
      else {
        console.log("Refresh did not work out, prob no refresh cookie theeere!")
      }
      
    }
    return Promise.reject(error);
  }
);


function App() {
  
  const [ message, setMessage ] = useState('');
  const [ error, setError ] = useState('');

  const login = async () => {
    try {
      const response = await axios.get('/login');
      console.log(response.data);
      setError('');
      setMessage(`Logged you in, ${response.data.user.username}`);
    } 
    catch (err) {
      const errorMsg = err.response && err.response.data.error.message;
      setError(errorMsg || 'API not available...');
    }
  };

  const getSecret = async () => {
    try {
      const response = await axios.get('/protected');
      setError('');
      setMessage(response.data.message);
    } 
    catch (err) {
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
