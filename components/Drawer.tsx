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
				<li className='nav-item '>
					<Button
						variant='secondary'
						size='sm'
						className='w-100'
						onClick={handleToggleTheme}
					>
						Mode
					</Button>
				</li>
				<li className='nav-item'>
					<Link href='/'>
						<a
							className={`w-100 btn btn-sm btn-success ${
								router.pathname === '/' ? 'active' : ''
							}`}
						>
							Home
						</a>
					</Link>
				</li>
				<li className='nav-item'>
					<Link href={'/f1'}>
						<a
							className={`w-100 btn btn-sm btn-danger ${
								router.query.series === 'f1' ? 'active' : ''
							}`}
						>
							F1
						</a>
					</Link>
				</li>
				<li className='nav-item'>
					<Link href={'/f2'}>
						<a
							className={`w-100 btn btn-sm btn-primary ${
								router.query.series === 'f2' ? 'active' : ''
							}`}
						>
							F2
						</a>
					</Link>
				</li>
				<li className='nav-item'>
					<Link href={'/f3'}>
						<a
							className={`w-100 btn btn-sm btn-secondary ${
								router.query.series === 'f3' ? 'active' : ''
							}`}
						>
							F3
						</a>
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Drawer;
