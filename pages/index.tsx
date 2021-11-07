import Head from 'next/head';
import HostGameModal from '../components/HostGameModal';
import useRequiresLogin from '../state/hooks/useLogin';
import JoinGameInput from '../components/JoinGameInput';
import UserStatus from '../components/UserStatus';
import Spinner from '../components/svg/Spinner';

export default function Home() {
    const user = useRequiresLogin();
    return (
        <>
            <Head>
                <title>BFTT: {user?.user_id || ''}</title>
                <meta
                    name="description"
                    content="A turn based social deduction game"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="hero bg-base-200 h-2/3">
                <div className="text-center hero-content">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-4xl font-bold">
                            Best Friends Til Tuesday
                        </h1>
                        <p className="mb-5">
                            Provident cupiditate voluptatem et in. Quaerat
                            fugiat ut assumenda excepturi exercitationem quasi.
                            In deleniti eaque aut repudiandae et a id nisi.
                        </p>
                        {user ? (
                            <>
                                <HostGameModal />
                                <br></br>
                                <div className="divider">OR</div>
                                <JoinGameInput />
                                <UserStatus />
                            </>
                        ) : (
                            <>
                                <Spinner />
                            </>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
