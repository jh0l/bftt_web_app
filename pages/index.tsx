import Head from 'next/head';
import HostGameModal from '../components/HostGameModal';
import useRequiresLogin from '../state/hooks/useRequiresLogin';
import JoinGameInput from './JoinGameInput';

export default function Home() {
    useRequiresLogin();

    return (
        <>
            <Head>
                <title>BFTT</title>
                <meta
                    name="description"
                    content="A turn based social deduction game"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="hero min-h-screen bg-base-200">
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
            </div>
        </>
    );
}
