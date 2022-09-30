import style from '../styles/LoadingBar.module.scss';

const LoadingBar: React.FC<{ margin?: string; width?: string }> = ({
	margin,
	width,
}) => {
	return (
		<div
			className={style.loading_bar_container}
			style={{ margin: margin || 'auto', width: width || 'auto' }}
		>
			<div className={style.loading_bar}></div>
		</div>
	);
};

export default LoadingBar;
