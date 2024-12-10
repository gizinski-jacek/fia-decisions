interface Props {
	errors: string[];
	dismiss?: () => void;
}

const ErrorMsg = ({ errors, dismiss }: Props) => {
	return (
		<div className='m-0 alert alert-danger alert-dismissible overflow-auto custom-alert-maxheight text-start text-break'>
			{errors.map((error, index) => (
				<div className='d-flex mb-2' key={index}>
					<i className='bi bi-exclamation-triangle-fill fs-5 m-0 me-2'></i>
					<strong className='ms-2 me-4'>{error}</strong>
				</div>
			))}
			<button
				type='button'
				className='btn btn-close'
				onClick={dismiss}
			></button>
		</div>
	);
};

export default ErrorMsg;
