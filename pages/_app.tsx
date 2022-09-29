import '../styles/globals.scss';
import '../styles/App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import Router from 'next/router';
import LoadingBar from '../components/LoadingBar';

const MyApp = ({ Component, pageProps }: AppProps) => {
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const start = () => {
			setLoading(true);
		};
		const end = () => {
			setLoading(false);
		};
		Router.events.on('routeChangeStart', start);
		Router.events.on('routeChangeComplete', end);
		Router.events.on('routeChangeError', end);
		return () => {
			Router.events.off('routeChangeStart', start);
			Router.events.off('routeChangeComplete', end);
			Router.events.off('routeChangeError', end);
		};
	}, []);

	return (
		<Layout>
			{loading ? (
				<LoadingBar margin='5rem 10rem' />
			) : (
				<Component {...pageProps} />
			)}
		</Layout>
	);
};

export default MyApp;
