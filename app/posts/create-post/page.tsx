import Image from "next/image";
import styles from "./page.module.css";
import TopNav from "@/app/ui/TopNav";
import LogInForm from "@/app/ui/logInForm";
import RegistrationForm from "@/app/ui/RegisterForm";
import Wrapper from "@/app/posts/create-post/wrapper";
import WrapperForLoginAndRegistration from "@/app/ui/WrapperForLoginAndRegistration";
import { AuthProvider } from '@/app/lib/AuthContext';

export default function Page() {
  return (
		<div className={styles.pageWrapper}>
		<AuthProvider>
		<WrapperForLoginAndRegistration/>
		<Wrapper/>
		</AuthProvider>
		</div>
    
  );
}