import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InteractiveBackground from '../components/InteractiveBackground';

export default function PublicLayout() {
  return (
    <div className="public-shell">
      <InteractiveBackground />
      <Header />
      <main className="public-shell__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
