import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createBrowserHistory } from 'history';
// import 'virtual:fonts.css'
import './index.css'
import {
  HashRouter as Router1,
  useRoutes,
} from 'react-router-dom'
import { MemoryRouter } from "react-router"
const history = createBrowserHistory();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
    <MemoryRouter initialIndex={0}>
      <App />
    </MemoryRouter>
  // </React.StrictMode>
)

// // vite.config.js
// export default {
//   // ...
//   plugins: [
//     Pages({
//       extendRoute(route, parent) {
//         if (route.path === '/') {
//           // Index is unauthenticated.
//           return route
//         }

//         // Augment the route with meta that indicates that the route requires authentication.
//         return {
//           ...route,
//           meta: { auth: true },
//         }
//       },
//     }),
//   ],
// }