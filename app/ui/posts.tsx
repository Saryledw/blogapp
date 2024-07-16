import styles from './posts.module.css';
import Image from "next/image";

export default function Post() {
  return (
		<div className={styles.postContainer}>
			<div className={styles.postHeaderContainer}>
				<div className={styles.postHeaderAbsolute}>
				<div className={styles.postHeaderTitle}><h2>Titler of the post website</h2></div>
				
			<button className={styles.minusButton}>–</button>
			<p className={styles.postLikesCount}>250</p>
			<button className={styles.plusButton}>+</button>
			</div>
			<svg className={styles.postHeader} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="0.2,2 25,2 26.5,25 99.8,25 99.8,98 0.2,98" style={{width: '100%', height: '100%', fill: '#c0ddd8', stroke: '#96aca8', strokeWidth: '0.17vw', vectorEffect:'non-scaling-stroke' }} />
			</svg>
			</div>
			<div className={styles.postContent}>
				<div className={styles.postContentImage}>

				</div>
				<div className={styles.postContentText}>
					<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p>
				</div>
			</div>
			<div className={styles.postFooter}>
				<div className={styles.postFooterUserProfilePicture}>
				<Image
    src="/images/profile.png"
    fill={true} // Makes the image fill the container
    objectFit="cover" // Adjust how the image fits in the container
    alt="User profile image"/>
			</div>
				<p className={styles.postFooterUserName}>UserNameLoooong</p>
				<p className={styles.postFooterTime}>2:34 11.03.2024</p>
			</div>
		</div>
    
  );
}