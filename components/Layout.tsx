import Head from 'next/head';
import { useState } from 'react';
import { ThemeContextProvider } from '../hooks/ThemeProvider';
import Drawer from './Drawer';
import Footer from './Footer';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	// Save position in local storage
	const [drawerOnLeft, setDrawerOnLeft] = useState(false);

	const toggleDrawerPosition = () => {
		setDrawerOnLeft((prevState) => !prevState);
	};

	return (
		<ThemeContextProvider>
			<Head>
				<title>FIA Decisions</title>
				<meta name='description' content='FIA Decisions' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div
				className={`d-flex flex-column custom-main-container 
				${drawerOnLeft ? 'flex-sm-row' : 'flex-sm-column'}`}
			>
				<Drawer
					drawerOnLeft={drawerOnLeft}
					toggleDrawerPosition={toggleDrawerPosition}
				/>
				<main>{children}</main>
				{/* <Footer /> */}
			</div>
		</ThemeContextProvider>
	);
};

export default Layout;
