import type { Metadata } from "next";
import { montserrat } from './fonts'
import "./globals.css";
import DragAndDropHandler from './lib/DragAndDropHandler';

export const metadata: Metadata = {
  title: "Блог",
  description: "Создайте свой блог",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	
  return (
    <html lang="ru" className={montserrat.className}>
      <body>
			<DragAndDropHandler />
				{children}
				</body>
    </html>
  );
}
