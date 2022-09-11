import axios from 'axios';
import Link from 'next/link';
import { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';

const Drawer = () => {
	const { toggleTheme } = useContext(ThemeContext);

	const handleToggleTheme = () => {
		toggleTheme();
	};

	const handleRequestUpdate = async () => {
		try {
			const res = await axios.get('/api/f1/force-update/decisions-offences');
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<nav>
			<ul className='nav nav-pills nav-fill'>
				{/* <li className='nav-item'>
					<button
						type='button'
						className='nav-link active'
						onClick={handleToggleTheme}
					>
						Toggle Theme
					</button>
				</li> */}
				<li className='nav-item'>
					<Button
						variant='outline-dark'
						size='sm'
						onClick={handleRequestUpdate}
					>
						Request Update
					</Button>
				</li>
				<li className='nav-item'>
					<Link href={'/'} className='nav-link'>
						Home
					</Link>
				</li>
				<li className='nav-item'>
					<Link href={'/f1'} className='nav-link'>
						F1
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Drawer;
