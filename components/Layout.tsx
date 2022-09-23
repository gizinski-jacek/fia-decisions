import Head from 'next/head';
import { DrawerContextProvider } from '../hooks/DrawerProvider';
import { ThemeContextProvider } from '../hooks/ThemeProvider';
import Drawer from './Drawer';
import Footer from './Footer';
import ScrollToTopBtn from './ScrollToTopBtn';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	return (
		<ThemeContextProvider>
			<DrawerContextProvider>
				<Head>
					<title>FIA Decisions</title>
					<meta name='description' content='FIA Decisions' />
					<link rel='icon' href='/favicon.ico' />
				</Head>
				<Drawer>{children}</Drawer>
				{/* <Footer /> */}
				<ScrollToTopBtn />
			</DrawerContextProvider>
		</ThemeContextProvider>
	);
};

export default Layout;
