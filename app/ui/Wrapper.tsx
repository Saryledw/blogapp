import styles from './Wrapper.module.css';
import Post from "./posts";
import FileUploadForm from "./FileUploadForm";
import Button from "./Button";
import Container from "./Container";
import AlertMessage from "./AlertMessage";

export default function Wrapper() {
  return (
		<div className={styles.wrapper}>
			<Post/>
			<FileUploadForm allowedExtensions=".png, .jpeg, .jpg, .webp" maxFiles={10} filesName="profile_picture" uploadButton={false}/>
			<Button label='СМЕНИТЬ'/>
			<Container header='Вход'>
			<AlertMessage message='ERRORRRRRRRRRRRRRR'/>
			<div className={styles.dashedBorder}>
			<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
			</div >
			<Button label='BUTTON' />
			</Container>
		</div>
    
  );
}