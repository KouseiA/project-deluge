import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Collection from "./pages/Collection";
import Map from "./pages/Map";
import Battle from "./pages/Battle";
import PvP from "./pages/PvP";
import Inventory from "./pages/Inventory";
import Quests from "./pages/Quests";
import { isLoggedIn, logout, getCurrentUser } from "./utils/auth";

function NavBar({ onLogout, loggedIn, username }) {
  const navigate = useNavigate();
  return (
    <nav style={{ padding: "1rem", background: "#eee", marginBottom: "2rem" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>
        Home
      </Link>
      {!loggedIn && (
        <Link to="/login" style={{ marginRight: "1rem" }}>
          Login
        </Link>
      )}
      {!loggedIn && (
        <Link to="/register" style={{ marginRight: "1rem" }}>
          Register
        </Link>
      )}
      {loggedIn && (
        <Link to="/collection" style={{ marginRight: "1rem" }}>
          Collection
        </Link>
      )}
      {loggedIn && (
        <Link to="/map" style={{ marginRight: "1rem" }}>
          Map
        </Link>
      )}
      {loggedIn && <Link to="/battle">Battle</Link>}
      {loggedIn && <Link to="/pvp">PvP</Link>}
      {loggedIn && <Link to="/inventory">Inventory</Link>}
      {loggedIn && <Link to="/quests">Quests</Link>}
      {loggedIn && (
        <span style={{ float: "right" }}>
          Welcome, {username}!{" "}
          <button
            onClick={() => {
              onLogout();
              navigate("/");
            }}
            style={{ marginLeft: "1rem" }}
          >
            Logout
          </button>
        </span>
      )}
    </nav>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [username, setUsername] = useState("");

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    const user = getCurrentUser();
    setUsername(user ? user.username : "");
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUsername("");
  };

  useEffect(() => {
    const onStorage = () => {
      setLoggedIn(isLoggedIn());
      const user = getCurrentUser();
      setUsername(user ? user.username : "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <Router>
      <NavBar onLogout={handleLogout} loggedIn={loggedIn} username={username} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/collection"
          element={loggedIn ? <Collection /> : <Login />}
        />
        <Route path="/map" element={loggedIn ? <Map /> : <Login />} />
        <Route path="/battle" element={loggedIn ? <Battle /> : <Login />} />
        <Route path="/pvp" element={loggedIn ? <PvP /> : <Login />} />
        <Route
          path="/inventory"
          element={loggedIn ? <Inventory /> : <Login />}
        />
        <Route path="/quests" element={loggedIn ? <Quests /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
