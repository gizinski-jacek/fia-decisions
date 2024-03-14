import dynamic from 'next/dynamic';
import Head from 'next/head';
import { DrawerContextProvider } from '../hooks/DrawerContextProvider';
import ScrollToTopBtn from './ScrollToTopBtn';
import { SeriesDataContextProvider } from '../hooks/SeriesDataContextProvider';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	const DynamicDrawer = dynamic(() => import('./Drawer'), { ssr: false });

	return (
		<DrawerContextProvider>
			<SeriesDataContextProvider>
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
			</SeriesDataContextProvider>
		</DrawerContextProvider>
	);
};

export default Layout;
