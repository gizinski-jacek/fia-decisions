import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

const ScrollToTopBtn = () => {
	const [showBtn, setShowBtn] = useState(false);
	const [fixed, setFixed] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setFixed(window.innerWidth > 1200);
		}
	}, []);

	useEffect(() => {
		const toggleShowBtn = () => {
			setShowBtn(document.documentElement.scrollTop > 200);
		};

		window.addEventListener('scroll', toggleShowBtn);

		return () => window.removeEventListener('scroll', toggleShowBtn);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const togglePosition = () => {
				setFixed(window.innerWidth > 1200);
			};

			window.addEventListener('resize', togglePosition);

			return () => window.removeEventListener('resize', togglePosition);
		}
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	return (
		<Button
			variant='primary'
			size='sm'
			className={`m-3 end-0 bottom-0 
			${fixed ? 'position-fixed' : 'w-50 mx-auto'}
			${showBtn ? 'd-block' : 'd-none'}`}
			onClick={scrollToTop}
		>
			{!fixed && <h5 className='d-inline mx-2'>Back To Top</h5>}
			<i className='bi bi-arrow-up-circle fs-6'></i>
		</Button>
	);
};

export default ScrollToTopBtn;
