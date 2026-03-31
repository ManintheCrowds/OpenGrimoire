import AdminQueryProvider from './AdminQueryProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminQueryProvider>{children}</AdminQueryProvider>;
}
