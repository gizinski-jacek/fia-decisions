import style from '../styles/LoadingBar.module.scss';

const LoadingBar: React.FC<{ margin?: string }> = ({ margin }) => {
	return (
		<div
			className={style.loading_bar_container}
			style={{ margin: margin || '' }}
		>
			<div className={style.loading_bar}></div>
		</div>
	);
};

export default LoadingBar;
