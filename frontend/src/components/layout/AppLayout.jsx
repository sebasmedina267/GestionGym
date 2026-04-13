import Sidebar from "./Sidebar";
import Header from "./Header";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-content">
        <Header />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
