export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <nav className="border-b p-4">
        <h2 className="text-xl font-bold">Dashboard</h2>
      </nav>
      <main>{children}</main>
    </div>
  );
}
