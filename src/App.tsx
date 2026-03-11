import { Layout } from "./components/Layout.tsx";
import { DashboardPage } from "./dashboard/DashboardPage.tsx";
import { useHashRoute } from "./hooks/useHashRoute.ts";
import { OSPANPage } from "./tasks/ospan/OSPANPage.tsx";
import { PVTPage } from "./tasks/pvt/PVTPage.tsx";
import "./index.css";

function HomePage() {
  return (
    <div className="task-page">
      <h1>NouLog</h1>
      <p className="home-subtitle">認知パフォーマンス定点観測</p>
      <div className="home-cards">
        <a href="#/pvt" className="home-card">
          <h2>PVT</h2>
          <p>精神運動覚醒テスト</p>
          <p className="home-card-detail">
            反応時間と注意力を測定します (3分間)
          </p>
        </a>
        <a href="#/ospan" className="home-card">
          <h2>OSPAN</h2>
          <p>操作スパンテスト</p>
          <p className="home-card-detail">
            ワーキングメモリ容量を測定します (15セット)
          </p>
        </a>
      </div>
      <a href="#/dashboard" className="btn btn-secondary">
        ダッシュボードを見る
      </a>
    </div>
  );
}

export function App() {
  const route = useHashRoute();

  let page: React.ReactNode;
  switch (route) {
    case "/pvt":
      page = <PVTPage />;
      break;
    case "/ospan":
      page = <OSPANPage />;
      break;
    case "/dashboard":
      page = <DashboardPage />;
      break;
    default:
      page = <HomePage />;
  }

  return <Layout currentRoute={route}>{page}</Layout>;
}

export default App;
