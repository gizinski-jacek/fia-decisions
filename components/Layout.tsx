import dynamic from 'next/dynamic';
import Head from 'next/head';
import { DrawerContextProvider } from '../hooks/DrawerProvider';
import ScrollToTopBtn from './ScrollToTopBtn';
import { SupportedYearsProvider } from '../hooks/SupportedYearsProvider';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	const DynamicDrawer = dynamic(() => import('./Drawer'), { ssr: false });

	return (
		<DrawerContextProvider>
			<SupportedYearsProvider>
				<Head>
					<title>Track Limits</title>
					<meta
						name='description'
						content='Quickly find out which Formula drivers got hit by penalties.'
					/>
					<link rel='icon' href='/favicon.ico' />
				</Head>
				<DynamicDrawer>{children}</DynamicDrawer>
				<ScrollToTopBtn />
			</SupportedYearsProvider>
		</DrawerContextProvider>
	);
};

export default Layout;
