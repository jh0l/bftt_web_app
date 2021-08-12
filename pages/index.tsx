import Head from 'next/head';
import {useRecoilValue} from 'recoil';
import HostGameModal from '../components/HostGameModal';
import useRequiresLogin from '../state/hooks/useLogin';
import {userAtom} from '../state/user';
import JoinGameInput from '../components/JoinGameInput';

export default function Home() {
    useRequiresLogin();
    const user = useRecoilValue(userAtom);
    return (
        <>
            <Head>
                <title>BFTT: {user?.user_id}</title>
                <meta
                    name="description"
                    content="A turn based social deduction game"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="hero min-h-full bg-base-200 flex-grow">
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
                        <HostGameModal />
                        <div className="divider">OR</div>
                        <JoinGameInput />
                    </div>
                </div>
            </main>
        </>
    );
}
