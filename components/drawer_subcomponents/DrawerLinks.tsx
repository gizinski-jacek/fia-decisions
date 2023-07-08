import { useContext } from 'react';
import { useRouter } from 'next/router';
import { DrawerContext } from '../../hooks/DrawerProvider';
import Link from 'next/link';
import Image from 'next/image';
import { supportedYears } from '../../lib/myData';

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
			<li className='nav-item position-relative'>
				<Link href={'/f1'}>
					<a
						className={`w-100 btn btn-sm btn-danger fw-bolder d-flex align-items-center justify-content-center text-nowrap 
						${router.query.series === 'f1' ? 'active' : ''}`}
					>
						<div
							className={`custom-icon ${
								screenIsSmall
									? 'me-2'
									: drawer.onLeft && drawer.isSmall
									? 'm-auto'
									: 'me-2'
							}`}
						>
							<Image src='/f1.png' alt='F1' width={24} height={24} />
						</div>
						{screenIsSmall
							? 'Formula 1'
							: drawer.onLeft && drawer.isSmall
							? ''
							: 'Formula 1'}
					</a>
				</Link>
				<div
					className={`d-none flex-wrap ${
						drawer.onLeft
							? 'flex-column top-0 start-100 ps-1'
							: 'flex-row top-100 start-0 pt-1'
					} gap-1 position-absolute`}
				>
					{supportedYears['f1'].map((year, i) => {
						if (new Date().getFullYear() !== year) {
							return (
								<Link href={`/f1?year=${year}`} key={i}>
									<a className='btn btn-sm btn-danger fw-bolder'>{year}</a>
								</Link>
							);
						} else {
							return (
								<Link href='/f1' key={i}>
									<a className='btn btn-sm btn-danger fw-bolder'>{year}</a>
								</Link>
							);
						}
					})}
				</div>
			</li>
			<li className='nav-item position-relative'>
				<Link href={'/f2'}>
					<a
						className={`w-100 btn btn-sm btn-primary fw-bolder d-flex align-items-center justify-content-center text-nowrap 
						${router.query.series === 'f2' ? 'active' : ''}`}
					>
						<div
							className={`custom-icon ${
								screenIsSmall
									? 'me-2'
									: drawer.onLeft && drawer.isSmall
									? 'm-auto'
									: 'me-2'
							}`}
						>
							<Image src='/f2.png' alt='F2' width={24} height={24} />
						</div>
						{screenIsSmall
							? 'Formula 2'
							: drawer.onLeft && drawer.isSmall
							? ''
							: 'Formula 2'}
					</a>
				</Link>
				<div
					className={`d-none ${
						drawer.onLeft
							? 'flex-column top-0 start-100 ps-1'
							: 'flex-row top-100 start-0 pt-1'
					} gap-1 position-absolute`}
				>
					{supportedYears['f2'].map((year, i) => {
						if (new Date().getFullYear() !== year) {
							return (
								<Link href={`/f2?year=${year}`} key={i}>
									<a className='btn btn-sm btn-primary fw-bolder'>{year}</a>
								</Link>
							);
						} else {
							return (
								<Link href='/f2' key={i}>
									<a className='btn btn-sm btn-primary fw-bolder'>{year}</a>
								</Link>
							);
						}
					})}
				</div>
			</li>
			<li className='nav-item position-relative'>
				<Link href={'/f3'}>
					<a
						className={`w-100 btn btn-sm btn-secondary fw-bolder d-flex align-items-center justify-content-center text-nowrap 
						${router.query.series === 'f3' ? 'active' : ''}`}
					>
						<div
							className={`custom-icon ${
								screenIsSmall
									? 'me-2'
									: drawer.onLeft && drawer.isSmall
									? 'm-auto'
									: 'me-2'
							}`}
						>
							<Image src='/f3.png' alt='F3' width={24} height={24} />
						</div>
						{screenIsSmall
							? 'Formula 3'
							: drawer.onLeft && drawer.isSmall
							? ''
							: 'Formula 3'}
					</a>
				</Link>
				<div
					className={`d-none ${
						drawer.onLeft
							? 'flex-column top-0 start-100 ps-1'
							: 'flex-row top-100 start-0 pt-1'
					} gap-1 position-absolute`}
				>
					{supportedYears['f3'].map((year, i) => {
						if (new Date().getFullYear() !== year) {
							return (
								<Link href={`/f3?year=${year}`} key={i}>
									<a className='btn btn-sm btn-secondary fw-bolder'>{year}</a>
								</Link>
							);
						} else {
							return (
								<Link href='/f3' key={i}>
									<a className='btn btn-sm btn-secondary fw-bolder'>{year}</a>
								</Link>
							);
						}
					})}
				</div>
			</li>
		</ul>
	);
};

export default DrawerLinks;
