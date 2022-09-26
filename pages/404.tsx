import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Custom404 = () => {
	const [countdown, setCountdown] = useState(5);
	const router = useRouter();

	useEffect(() => {
		setTimeout(() => {
			if (countdown > 0) setCountdown(countdown - 1);
		}, 1000);
	}, [countdown]);

	useEffect(() => {
		if (countdown === 0) router.push('/');
	}, [countdown, router]);

	return (
		<div className='my-5 text-center'>
			<h1>404</h1>
			<h2>Page Not Found</h2>
			<h3>
				Redirecting to <Link href='/'>Home</Link> page in{' '}
				<strong className='text-primary'>{countdown}</strong>
			</h3>
		</div>
	);
};

export default Custom404;
