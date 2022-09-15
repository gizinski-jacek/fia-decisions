import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';

const Drawer = () => {
	const { toggleTheme } = useContext(ThemeContext);
	const router = useRouter();

	const handleToggleTheme = () => {
		toggleTheme();
	};

	return (
		<nav>
			<ul className='nav nav-tabs nav-fill p-2 gap-5'>
				{/* <li className='nav-item'>
					<Button variant='secondary' onClick={handleToggleTheme}>
						Toggle Theme
					</Button>
				</li> */}
				<li
					className={`nav-item btn btn-sm btn-success ${
						router.pathname === '/' ? 'active' : ''
					}`}
				>
					<Link href={'/'}>Home</Link>
				</li>
				<li
					className={`nav-item btn btn-sm btn-danger ${
						router.pathname === '/f1' ? 'active' : ''
					}`}
				>
					<Link href={'/f1'}>F1</Link>
				</li>
				<li
					className={`nav-item btn btn-sm btn-primary ${
						router.pathname === '/f2' ? 'active' : ''
					}`}
				>
					<Link href={'/f2'}>F2</Link>
				</li>
				<li
					className={`nav-item btn btn-sm btn-secondary ${
						router.pathname === '/f3' ? 'active' : ''
					}`}
				>
					<Link href={'/f3'}>F3</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Drawer;
