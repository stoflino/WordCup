import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Tipovačka WorldCup 2026',
  description: 'Soukromá fotbalová tipovačka',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
