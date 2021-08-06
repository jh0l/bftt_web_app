import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {RecoilRoot} from 'recoil';
import Alerts from '../components/Alerts';
import useWebsocket from '../state/hooks/useWebsocket';

function WebsocketListener() {
    useWebsocket();
    return null;
}

function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <RecoilRoot>
                <WebsocketListener />
                <Component {...pageProps} />
                <Alerts />
            </RecoilRoot>
        </>
    );
}
export default MyApp;
