import Image from "next/image";
import styles from "./page.module.css";
import TopNav from "./ui/TopNav";
import Wrapper from "./ui/Wrapper";
import Header from "./ui/Header";
import LogInForm from "./ui/logInForm";
import RegistrationForm from "./ui/RegisterForm";
import WrapperForLoginAndRegistration from "./ui/WrapperForLoginAndRegistration";
import { AuthProvider } from './lib/AuthContext';

export default function Page() {
  return (
		<div className={styles.pageWrapper}>
			
		<Header/>
		<Wrapper/>
		</div>
    
  );
}
