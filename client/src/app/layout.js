import localFont from 'next/font/local' ;
import "./globals.css";

const interRegular = localFont({
  src: [
    { path: '../../public/fonts/Inter-SemiBold.ttf' , weight: '600' } // Semi-bold weight
  ],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={interRegular.className}>{children}</body>
    </html>
  );
}
