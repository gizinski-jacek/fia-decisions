import Head from 'next/head';
import { DrawerContextProvider } from '../hooks/DrawerProvider';
import Drawer from './Drawer';
import ScrollToTopBtn from './ScrollToTopBtn';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	return (
		<DrawerContextProvider>
			<Head>
				<title>Track Limits</title>
				<meta
					name='description'
					content='Quickly find out which Formula drivers got hit by penalties.'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Drawer>{children}</Drawer>
			<ScrollToTopBtn />
		</DrawerContextProvider>
	);
};

export default Layout;
