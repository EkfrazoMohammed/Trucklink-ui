import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import store from "./redux/store.ts"
import App from './App';
import { LocalStorageProvider } from "./localStorageContext.jsx"; // Adjust the import path accordingly

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <LocalStorageProvider>
        <App />
      </LocalStorageProvider>
    </Provider>
  </React.StrictMode>,
)
