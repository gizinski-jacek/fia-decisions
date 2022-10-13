import { useContext } from 'react';
import { DrawerContext } from '../../hooks/DrawerProvider';
import { Button } from 'react-bootstrap';

interface Props {
	drawerIsHidden: boolean;
	screenIsSmall: boolean;
	toggleDrawerVisiblity: () => void;
}

const DrawerControls = ({
	drawerIsHidden,
	screenIsSmall,
	toggleDrawerVisiblity,
}: Props) => {
	const { drawer, toggleDrawerPosition, toggleDrawerSize } =
		useContext(DrawerContext);

	return (
		<ul
			className={`nav nav-tabs d-flex flex-nowrap justify-content-between align-items-center p-2 p-md-2 gap-2 
			${drawer.onLeft ? 'order-first' : ''}
			${
				drawer.onLeft && drawer.isSmall
					? 'flex-column'
					: drawer.onLeft && !drawer.isSmall
					? 'flex-row'
					: 'flex-column flex-lg-row border-start'
			}`}
		>
			<li
				className={`nav-item w-100 
				${drawerIsHidden ? 'custom-btn-show' : ''} 
				${drawer.onLeft ? 'flex-grow-1' : 'order-lg-last'}`}
			>
				<Button
					variant='dark'
					size='sm'
					className='w-100 fw-bolder'
					onClick={() =>
						screenIsSmall
							? toggleDrawerVisiblity()
							: drawer.onLeft
							? toggleDrawerSize()
							: toggleDrawerVisiblity()
					}
				>
					{screenIsSmall ? (
						<i className='bi bi-arrow-bar-up fs-6'></i>
					) : drawer.onLeft ? (
						drawer.isSmall ? (
							<i className='bi bi-arrow-bar-right fs-6'></i>
						) : (
							<i className='bi bi-arrow-bar-left fs-6'></i>
						)
					) : (
						<i className='bi bi-arrow-bar-up fs-6'></i>
					)}
				</Button>
			</li>
			<li className='nav-item w-100 d-none flex-grow-1 d-sm-block'>
				<Button
					variant='dark'
					size='sm'
					className='w-100 fw-bolder'
					onClick={toggleDrawerPosition}
				>
					{drawer.onLeft ? (
						<i className='bi bi-arrow-up-right-square fs-6'></i>
					) : (
						<i className='bi bi-arrow-down-left-square fs-6'></i>
					)}
				</Button>
			</li>
		</ul>
	);
};

export default DrawerControls;
