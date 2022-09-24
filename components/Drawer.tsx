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
			const toggleScreenIsSmall = () =>
				window.innerWidth < 576 ? setSmallScreen(true) : setSmallScreen(false);

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
				className={`d-flex bg-light border-bottom border-end 
				${drawerIsHidden ? 'custom-nav-hide' : ''} 
				${drawer.onLeft ? 'flex-column' : 'flex-row'}`}
			>
				<DrawerControls
					drawerIsHidden={drawerIsHidden}
					toggleDrawerVisiblity={toggleDrawerVisiblity}
				/>
				<div
					className={`flex-grow-1 d-flex flex-column 
					${drawer.onLeft ? 'flex-lg-column' : 'flex-lg-row'}`}
				>
					<DrawerLinks screenIsSmall={screenIsSmall} />
					<DrawerUtilities
						drawerIsHidden={drawerIsHidden}
						screenIsSmall={screenIsSmall}
						toggleDrawerVisiblity={toggleDrawerVisiblity}
					/>
				</div>
			</nav>
			<main className='w-100 mx-auto'>{children}</main>
		</div>
	);
};

export default Drawer;
