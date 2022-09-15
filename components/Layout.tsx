import Head from 'next/head';
import { ThemeContextProvider } from '../hooks/ThemeProvider';
import Drawer from './Drawer';
import Footer from './Footer';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	return (
		<ThemeContextProvider>
			<Head>
				<title>FIA Decisions</title>
				<meta name='description' content='FIA Decisions' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Drawer />
			<main className='m-2 my-4 m-sm-4'>{children}</main>
			{/* <Footer /> */}
		</ThemeContextProvider>
	);
};

export default Layout;
