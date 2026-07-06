import { BusinessProvider } from '../../components/providers/BusinessProvider.js';
import DashboardShell from '../../components/dashboard/DashboardShell.js';

export const metadata = {
  title: 'Atlas BusinessOS — Dashboard',
};

export default function DashboardLayout({ children }) {
  return (
    <BusinessProvider>
      <DashboardShell>{children}</DashboardShell>
    </BusinessProvider>
  );
}
