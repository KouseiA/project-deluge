import React, { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import Toast from "../components/Toast";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [collection, setCollection] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedMonster, setSelectedMonster] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const inv = await apiRequest("/inventory");
      setInventory(inv);
      const mons = await apiRequest("/monsters/collection");
      setCollection(mons);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUse = async () => {
    setMsg("");
    setError("");
    try {
      const res = await apiRequest("/inventory/use", "POST", {
        itemName: selectedItem,
        monsterId: parseInt(selectedMonster),
      });
      setMsg("Item used!");
      setToast("Item used!");
      setInventory(res.inventory);
      setCollection(res.monsters);
      // Update quest progress
      await apiRequest("/quests/update", "POST", {
        questId: "use_3_items",
        increment: 1,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (itemName) => {
    setMsg("");
    setError("");
    try {
      const inv = await apiRequest("/inventory/remove", "POST", { itemName });
      setInventory(inv);
      setMsg("Item removed.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h2>Inventory</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {inventory.length === 0 ? (
        <p>No items in inventory.</p>
      ) : (
        <ul>
          {inventory.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "1rem" }}>
              <strong>{item.name}</strong>{" "}
              {item.effect && <span>({item.effect})</span>}
              <button
                onClick={() => handleRemove(item.name)}
                style={{ marginLeft: "1rem" }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        style={{
          marginTop: "2rem",
          borderTop: "1px solid #ccc",
          paddingTop: "1rem",
        }}
      >
        <h3>Use Item on Monster</h3>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">Select item</option>
          {inventory.map((item, idx) => (
            <option key={idx} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={selectedMonster}
          onChange={(e) => setSelectedMonster(e.target.value)}
        >
          <option value="">Select monster</option>
          {collection.map((m, idx) => (
            <option key={idx} value={m.id}>
              {m.name} (Lv {m.level || 1})
            </option>
          ))}
        </select>
        <button
          onClick={handleUse}
          disabled={!selectedItem || !selectedMonster}
        >
          Use
        </button>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

export default Inventory;
