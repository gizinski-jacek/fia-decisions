import { createContext } from 'react';
import useLocalStorage from 'use-local-storage';

interface Props {
	children: React.ReactNode;
}

interface DrawerContextProps {
	drawer: { onLeft: boolean; isSmall: boolean; isHidden: boolean };
	toggleDrawerPosition: () => void;
	toggleDrawerSize: () => void;
	toggleDrawerVisibility: () => void;
}

const DrawerContext = createContext<DrawerContextProps>({
	drawer: { onLeft: false, isSmall: false, isHidden: false },
	toggleDrawerPosition: () => null,
	toggleDrawerSize: () => null,
	toggleDrawerVisibility: () => null,
});

const DrawerContextProvider = ({ children }: Props) => {
	const [drawer, setDrawer] = useLocalStorage<{
		onLeft: boolean;
		isSmall: boolean;
		isHidden: boolean;
	}>('drawer', {
		onLeft: false,
		isSmall: false,
		isHidden: false,
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

	const toggleDrawerVisibility = () => {
		setDrawer({
			...drawer,
			isHidden: !drawer.isHidden,
		});
	};

	return (
		<DrawerContext.Provider
			value={{
				drawer,
				toggleDrawerPosition,
				toggleDrawerSize,
				toggleDrawerVisibility,
			}}
		>
			{children}
		</DrawerContext.Provider>
	);
};

export { DrawerContext, DrawerContextProvider };
