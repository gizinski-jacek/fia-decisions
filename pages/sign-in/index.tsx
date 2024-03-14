import { useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextApiRequest, NextPage } from 'next';
import { useRouter } from 'next/router';
import SignInForm from '../../components/forms/SignInForm';
import { verifyToken } from '../../lib/utils';
import Link from 'next/link';

interface Props {
	signedIn: boolean;
}

const SignIn: NextPage<Props> = ({ signedIn }) => {
	const [countdown, setCountdown] = useState(5);
	const router = useRouter();

	useEffect(() => {
		if (signedIn) {
			setTimeout(() => {
				if (countdown > 0) setCountdown(countdown - 1);
			}, 1000);
		}
	}, [countdown, signedIn]);

	useEffect(() => {
		if (countdown === 0) router.push('/dashboard');
	}, [countdown, router]);

	return signedIn ? (
		<div className='my-5 text-center'>
			<h2>Already signed in</h2>
			<h3>
				Redirecting to <Link href='/dashboard'>Dashboard</Link> in{' '}
				<strong className='text-primary'>{countdown} seconds</strong>
			</h3>
		</div>
	) : (
		<SignInForm />
	);
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
	if (!process.env.JWT_STRATEGY_SECRET) {
		throw new Error(
			'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
		);
	}
	const tokenValid = verifyToken(context.req as NextApiRequest);
	if (tokenValid) {
		return {
			props: { signedIn: true },
		};
	} else {
		context.res.setHeader(
			'Set-Cookie',
			`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
		);
		return {
			props: { signedIn: false },
		};
	}
};

export default SignIn;
