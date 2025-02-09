import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './redux/store';

function Root() {
  const [renderKey, setRenderKey] = useState(0);

  return (
    <div>
      <button onClick={() => setRenderKey(prev => prev + 1)}>Force Render</button>
      <Provider store={store}>
        <App key={renderKey} />
      </Provider>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
