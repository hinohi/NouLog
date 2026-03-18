import { Layout } from "./components/Layout.tsx";
import { DashboardPage } from "./dashboard/DashboardPage.tsx";
import { ResultDetailPage } from "./dashboard/ResultDetailPage.tsx";
import { useHashRoute } from "./hooks/useHashRoute.ts";
import { CorsiPage } from "./tasks/corsi/CorsiPage.tsx";
import { GoNogoPage } from "./tasks/gonogo/GoNogoPage.tsx";
import { OSPANPage } from "./tasks/ospan/OSPANPage.tsx";
import { PVTPage } from "./tasks/pvt/PVTPage.tsx";
import { TaskSwitchPage } from "./tasks/taskswitch/TaskSwitchPage.tsx";
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
        <a href="#/gonogo" className="home-card">
          <h2>Go/No-Go</h2>
          <p>抑制制御テスト</p>
          <p className="home-card-detail">衝動抑制能力を測定します (80試行)</p>
        </a>
        <a href="#/corsi" className="home-card">
          <h2>Corsi Block</h2>
          <p>空間ワーキングメモリテスト</p>
          <p className="home-card-detail">空間ワーキングメモリを測定します</p>
        </a>
        <a href="#/taskswitch" className="home-card">
          <h2>Task Switching</h2>
          <p>認知的柔軟性テスト</p>
          <p className="home-card-detail">
            セットシフティング能力を測定します (64試行)
          </p>
        </a>
      </div>
      <a href="#/dashboard" className="btn btn-secondary">
        ダッシュボードを見る
      </a>
      <div className="home-footer">
        <p className="home-disclaimer">
          本アプリは非専門家が作成したものであり、医学的・心理学的な効果を保証するものではありません。
        </p>
        <p className="home-disclaimer">
          データはブラウザにローカル保存されます。サーバーへの送信は行いません。端末やブラウザを変更するとデータは引き継がれないため、ダッシュボードのエクスポート/インポート機能をご利用ください。
        </p>
        <a
          href="https://github.com/hinohi/NouLog"
          target="_blank"
          rel="noopener noreferrer"
          className="home-github-link"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}

export function App() {
  const route = useHashRoute();

  let page: React.ReactNode;
  const resultMatch = route.match(/^\/result\/(\w+)\/(.+)$/);
  if (resultMatch) {
    return (
      <Layout currentRoute={route}>
        <ResultDetailPage taskType={resultMatch[1]} uid={resultMatch[2]} />
      </Layout>
    );
  }
  switch (route) {
    case "/pvt":
      page = <PVTPage />;
      break;
    case "/ospan":
      page = <OSPANPage />;
      break;
    case "/gonogo":
      page = <GoNogoPage />;
      break;
    case "/corsi":
      page = <CorsiPage />;
      break;
    case "/taskswitch":
      page = <TaskSwitchPage />;
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
