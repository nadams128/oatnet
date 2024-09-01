import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Inventory from './Inventory';
import Report from './Report';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet,
} from "react-router-dom";
import './index.css'

const router = createBrowserRouter(createRoutesFromElements(
  <Route
    element={<App><Outlet/></App>}
    errorElement = {<div className="mt-24 flex flex-col flex-wrap text-white place-content-center text-center font-rubik select-none text-3xl">
      <div className="mb-8">404 Not Found!</div>
      <div>The Requested Page Isn't Real, But You Can Imagine It If You'd Like!</div>
    </div>}
  >
    <Route
      path = "/"
      element = {<Inventory/>}
    />
    <Route
      path = "/inventory"
      key=""
      element = {<Inventory/>}
    />
    <Route
      path = "/report"
      element = {<Report/>}
    />
  </Route>
  
));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
