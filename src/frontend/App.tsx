import TokenUsageDashboardPage from './features/token-usage-dashboard/components/token-usage-dashboard-page';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Token Usage Dashboard</h1>
      </header>
      <main>
        <TokenUsageDashboardPage />
      </main>
    </div>
  );
}
