import type { GetServerSidePropsContext, NextPage } from 'next';

const Home: NextPage = () => {
	return <div></div>;
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	return {
		redirect: {
			destination: '/f1',
			permanent: false,
		},
	};
};

export default Home;
