import './globals.css';

export const metadata = {
  title: 'Focus Trap',
  description: 'Get to know the best focus trap on the web',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={process.env.NODE_ENV !== 'production' ? 'debug-screens' : ''}>{children}</body>
    </html>
  );
}
