
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './hooks/useUser';
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login.jsx';




import Register from './pages/Register.jsx';
import ReceiptForm from './components/ReceiptForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import ViewReceipt from './components/ViewReceipt.jsx';
import Reports from './components/reports.jsx';






const router = createBrowserRouter([
  {
    path: "/", element: <App/>,
   children:[
  { path: 'login', element: <Login/> },
  { path: 'register', element: <Register/> },
  { path: 'receipt', element: <ReceiptForm /> },
  { path: '/', element: <Dashboard /> },
  { path: 'view-receipt', element: <ViewReceipt /> },
  {path: 'reports', element: <Reports/> }
]

  }
])
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>

    <Toaster />
    <RouterProvider router={router} />
    </UserProvider>

  </React.StrictMode>
);
