import Link from 'next/link';
import { useContext } from 'react';
import { ThemeContext } from '../hooks/ThemeProvider';

const Drawer = () => {
	const { toggleTheme } = useContext(ThemeContext);

	const handleToggleTheme = () => {
		toggleTheme();
	};

	return (
		<nav>
			<ul>
				<li>
					<button type='button' onClick={handleToggleTheme}>
						Toggle Theme
					</button>
				</li>
				<li>
					<Link href={'/'}>Home</Link>
				</li>
				<li>
					<Link href={'/f1'}>F1</Link>
				</li>
				<li>
					<Link href={'/f2'}>F2</Link>
				</li>
				<li>
					<Link href={'/f3'}>F3</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Drawer;
