import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import TodoList from './abis/TodoList.json';
import toast, { Toaster } from 'react-hot-toast';
import "./App.css";

const CONTRACT_ADDRESS = "0x7b96aF9Bd211cBf6BA5b0dd53aa61Dc5806b6AcE";

function App() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("1");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  // ✅ Dark Mode setup
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const todoContract = new ethers.Contract(CONTRACT_ADDRESS, TodoList.abi, signer);
      setAccount(address);
      setProvider(provider);
      setContract(todoContract);
      loadTasks(todoContract);
    };
    init();
  }, []);

  const loadTasks = async (todoContract) => {
    try {
      const taskArray = await todoContract.getMyTasks();
      setTasks(taskArray);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const handleAddTask = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const tx = await contract.createTask(content, priority);
      await tx.wait();
      setContent("");
      loadTasks(contract);
      toast.success("Task added!");
    } catch (err) {
      toast.error("Failed to add task: " + err.message);
    }
    setLoading(false);
  };

  const toggleCompleted = async (id) => {
    try {
      const tx = await contract.toggleCompleted(id);
      await tx.wait();
      loadTasks(contract);
      toast.success("Task status updated");
    } catch (err) {
      toast.error("Toggle failed: " + err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const tx = await contract.deleteTask(id);
      await tx.wait();
      loadTasks(contract);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    }
  };

  const setTaskPriority = async (id, newPriority) => {
    try {
      const tx = await contract.setPriority(id, newPriority);
      await tx.wait();
      loadTasks(contract);
      toast.success("Priority updated");
    } catch (err) {
      toast.error("Priority change failed: " + err.message);
    }
  };

  const getPriorityText = (priority) => ["Low", "Medium", "High"][priority];
  const priorityColor = ["green", "orange", "red"];

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <Toaster />
      <h1>📝 Web3 Todo List</h1>
      <p>Connected as: {account}</p>

      {/* ✅ Dark mode toggle */}
      <div className="theme-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="slider round"></span>
        </label>
        <span>{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
      </div>

      <div className="input-group">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a new task..."
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
        </select>
        <button onClick={handleAddTask} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("incomplete")}>Incomplete</button>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            <span>{task.content}</span>
            <small style={{ color: priorityColor[task.priority] }}>
              Priority: {getPriorityText(task.priority)}
            </small>
            <div className="actions">
              <button onClick={() => toggleCompleted(task.id)}>✔️</button>
              <button onClick={() => deleteTask(task.id)}>🗑️</button>
              <select
                value={task.priority}
                onChange={(e) => setTaskPriority(task.id, e.target.value)}>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;