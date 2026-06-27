import { useState } from "react";
import AddExpenseForm from "./components/AddExpenseForm";
import ExpenseHistory from "./components/ExpenseHistory";
import "./App.css";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>Budget Tracker</h1>
      </header>
      <main>
        <AddExpenseForm onExpenseCreated={() => setRefreshKey((k) => k + 1)} />
        <ExpenseHistory refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default App;
