import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import GunContext from "./contexts/gun";
import UsersPage from "./pages/UsersPage";
import Gun from "gun";
import BlockchainPage from "./pages/BlockchainPage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/:username/:malicious",
    element: <ChatPage />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/blockchain",
    element: <BlockchainPage />,
  },
]);

const gun = Gun({ peers: ["http://localhost:8000/gun"], localStorage: false });

root.render(
  // <React.Strict>
  <div className="w-full h-screen px-20 bg-slate-800">
    <GunContext.Provider value={gun}>
      <RouterProvider router={router} />
    </GunContext.Provider>
  </div>
  // </React.Strict>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
