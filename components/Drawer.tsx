import React, { useContext, useEffect, useState } from 'react';
import { DrawerContext } from '../hooks/DrawerProvider';
import DrawerLinks from './drawer_subcomponents/DrawerLinks';
import DrawerUtilities from './drawer_subcomponents/DrawerUtilities';
import DrawerControls from './drawer_subcomponents/DrawerControls';

interface Props {
	children: React.ReactNode;
}

const Drawer = ({ children }: Props) => {
	const { drawer } = useContext(DrawerContext);
	const [screenIsSmall, setSmallScreen] = useState(false);
	const [drawerIsHidden, setDrawerHidden] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setSmallScreen(window.innerWidth < 576);
		}
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const toggleScreenIsSmall = () => {
				setSmallScreen(window.innerWidth < 576);
			};

			window.addEventListener('resize', toggleScreenIsSmall);

			return () => window.removeEventListener('resize', toggleScreenIsSmall);
		}
	}, []);

	const toggleDrawerVisiblity = () => {
		setDrawerHidden((prevState) => !prevState);
	};

	return (
		<div
			className={`d-flex flex-column custom-main-container 
			${drawer.onLeft ? 'flex-sm-row' : 'flex-sm-column'}`}
		>
			<nav
				className={`d-lg-flex bg-light border-bottom border-end 
				${
					screenIsSmall
						? 'custom-sm-grid'
						: drawer.onLeft
						? 'd-flex flex-column'
						: 'custom-md-grid'
				}
				${drawerIsHidden ? 'custom-nav-hide' : ''}`}
			>
				<DrawerLinks screenIsSmall={screenIsSmall} />
				<DrawerUtilities screenIsSmall={screenIsSmall} />
				<DrawerControls
					drawerIsHidden={drawerIsHidden}
					screenIsSmall={screenIsSmall}
					toggleDrawerVisiblity={toggleDrawerVisiblity}
				/>
			</nav>
			<main className='w-100 mx-auto'>{children}</main>
		</div>
	);
};

export default Drawer;
