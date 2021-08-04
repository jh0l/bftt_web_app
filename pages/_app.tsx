import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {RecoilRoot} from 'recoil';
import Alerts from '../components/Alerts';

function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <RecoilRoot>
                <Component {...pageProps} />
                <Alerts />
            </RecoilRoot>
        </>
    );
}
export default MyApp;
