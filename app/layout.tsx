import type { Metadata } from "next";
import { montserrat } from './fonts'
import "./globals.css";
import DragAndDropHandler from './lib/DragAndDropHandler';
import WrapperForLoginAndRegistration from "./ui/WrapperForLoginAndRegistration";
import { AuthProvider } from './lib/AuthContext';

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
			<AuthProvider>
			<WrapperForLoginAndRegistration/>
				{children}
				</AuthProvider>
				</body>
    </html>
  );
}
