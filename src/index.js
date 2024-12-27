import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot for React 18
import { Provider } from 'react-redux';
import store from './redux/store'; // Adjust this path if necessary
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);