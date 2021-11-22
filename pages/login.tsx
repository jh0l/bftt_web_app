import Head from 'next/head';
import LoginForm from '../components/LoginForm';

export default function Login() {
    return (
        <>
            <Head>
                <title>BFTT: Login</title>
                <meta
                    name="description"
                    content="A turn based social deduction game"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="hero flex-grow bg-base-200">
                <div className="md:mx-48 flex-col justify-center hero-content lg:flex-row">
                    <div className="text-center lg:text-left">
                        <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
                        <p className="mb-5">
                            Provident cupiditate voluptatem et in. Quaerat
                            fugiat ut assumenda excepturi exercitationem quasi.
                            In deleniti eaque aut repudiandae et a id nisi.
                        </p>
                    </div>
                    <LoginForm />
                </div>
            </main>
            {/* <footer className="flex justify-center w-100 my-5">
                <a
                    href="https://github.com/jh0l"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                >
                    Powered by jh0.co
                </a>
            </footer> */}
        </>
    );
}
