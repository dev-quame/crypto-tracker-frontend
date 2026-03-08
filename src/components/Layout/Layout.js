import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
    </div>
  );
};

export default Layout;
