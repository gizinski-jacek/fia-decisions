import type { NextPage } from 'next';
import Head from 'next/head';
import Footer from '../components/Footer';

const Home: NextPage = () => {
	return (
		<div>
			<Head>
				<title>FIA Decisions</title>
				<meta name='description' content='FIA Decisions' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main>Hello</main>
			<Footer />
		</div>
	);
};

export default Home;
