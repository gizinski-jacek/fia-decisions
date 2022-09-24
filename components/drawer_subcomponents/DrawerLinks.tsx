import { useContext } from 'react';
import { useRouter } from 'next/router';
import { DrawerContext } from '../../hooks/DrawerProvider';
import Link from 'next/link';

interface Props {
	screenIsSmall: boolean;
}

const DrawerLinks = ({ screenIsSmall }: Props) => {
	const { drawer } = useContext(DrawerContext);

	const router = useRouter();

	return (
		<ul
			className={`nav nav-tabs nav-fill flex-nowrap p-2 py-2 p-md-2 
						${
							drawer.onLeft
								? 'flex-sm-column gap-2'
								: 'flex-sm-row flex-sm-grow-1 gap-3 '
						}`}
		>
			{/* <li className='nav-item'>
							<Link href='/'>
								<a
									className={`w-100 btn btn-sm btn-success fw-bolder d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
									${router.query.series === '' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-house-door fs-6 
										${
											screenIsSmall
												? 'me-2'
												: drawer.onLeft && drawer.isSmall
												? 'm-auto'
												: 'me-2'
										}`}
									></i>
									{screenIsSmall
										? 'Home'
										: drawer.onLeft && drawer.isSmall
										? ''
										: 'Home'}
								</a>
							</Link>
						</li> */}
			<li className='nav-item'>
				<Link href={'/f1'}>
					<a
						className={`w-100 btn btn-sm btn-danger fw-bolder d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
									${router.query.series === 'f1' ? 'active' : ''}`}
					>
						<i
							className={`bi bi-1-square fs-6 
										${
											screenIsSmall
												? 'me-2'
												: drawer.onLeft && drawer.isSmall
												? 'm-auto'
												: 'me-2'
										}`}
						></i>
						{screenIsSmall
							? 'Formula 1'
							: drawer.onLeft && drawer.isSmall
							? ''
							: 'Formula 1'}
					</a>
				</Link>
			</li>
			<li className='nav-item'>
				<Link href={'/f2'}>
					<a
						className={`w-100 btn btn-sm btn-primary fw-bolder d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
									${router.query.series === 'f2' ? 'active' : ''}`}
					>
						<i
							className={`bi bi-2-square fs-6 
										${
											screenIsSmall
												? 'me-2'
												: drawer.onLeft && drawer.isSmall
												? 'm-auto'
												: 'me-2'
										}`}
						></i>
						{screenIsSmall
							? 'Formula 2'
							: drawer.onLeft && drawer.isSmall
							? ''
							: 'Formula 2'}
					</a>
				</Link>
			</li>
			<li className='nav-item'>
				<Link href={'/f3'}>
					<a
						className={`w-100 btn btn-sm btn-secondary fw-bolder d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
									${router.query.series === 'f3' ? 'active' : ''}`}
					>
						<i
							className={`bi bi-3-square fs-6 
										${
											screenIsSmall
												? 'me-2'
												: drawer.onLeft && drawer.isSmall
												? 'm-auto'
												: 'me-2'
										}`}
						></i>
						{screenIsSmall
							? 'Formula 3'
							: drawer.onLeft && drawer.isSmall
							? ''
							: 'Formula 3'}
					</a>
				</Link>
			</li>
		</ul>
	);
};

export default DrawerLinks;
