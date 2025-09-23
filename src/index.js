import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { injectContentsquareScript } from '@contentsquare/tag-sdk';

// Injecter le script Contentsquare
const injectHotjarScript = (hjid) => {
  (function (c, s, q, u, a, r, e) {
    c.hj = c.hj || function () { (c.hj.q = c.hj.q || []).push(arguments) };
    c._hjSettings = { hjid: a };
    r = s.getElementsByTagName('head')[0];
    e = s.createElement('script');
    e.async = true;
    e.src = q + c._hjSettings.hjid + u;
    r.appendChild(e);
  })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', hjid);
};
// Remplacez 5360415 par votre propre ID Hotjar
injectHotjarScript(5360415);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Mesurer la performance
reportWebVitals();