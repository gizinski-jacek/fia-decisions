import { createContext } from 'react';
import useLocalStorage from 'use-local-storage';

interface Props {
	children: React.ReactNode;
}

type DrawerProps = {
	drawer: { onLeft: boolean; isSmall: boolean };
	toggleDrawerPosition: () => void;
	toggleDrawerSize: () => void;
};

const DrawerContext = createContext<DrawerProps>({
	drawer: { onLeft: false, isSmall: false },
	toggleDrawerPosition: () => null,
	toggleDrawerSize: () => null,
});

const DrawerContextProvider = ({ children }: Props) => {
	const [drawer, setDrawer] = useLocalStorage<{
		onLeft: boolean;
		isSmall: boolean;
	}>('drawer', {
		onLeft: false,
		isSmall: false,
	});

	const toggleDrawerPosition = () => {
		setDrawer({
			...drawer,
			onLeft: !drawer.onLeft,
		});
	};

	const toggleDrawerSize = () => {
		setDrawer({
			...drawer,
			isSmall: !drawer.isSmall,
		});
	};

	return (
		<DrawerContext.Provider
			value={{
				drawer,
				toggleDrawerPosition,
				toggleDrawerSize,
			}}
		>
			{children}
		</DrawerContext.Provider>
	);
};

export { DrawerContext, DrawerContextProvider };
