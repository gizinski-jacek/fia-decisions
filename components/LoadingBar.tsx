import style from '../styles/LoadingBar.module.scss';

const LoadingBar: React.FC = () => {
	return (
		<div className={style.loading_bar_container}>
			<div className={style.loading_bar}></div>
		</div>
	);
};

export default LoadingBar;
