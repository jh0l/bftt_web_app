import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {RecoilRoot} from 'recoil';
import Alerts from '../components/Alerts';
import useWebsocket from '../state/hooks/useWebsocket';
import Navbar from '../components/Navbar';

function WebsocketListener() {
    useWebsocket();
    return null;
}

function MyApp({Component, pageProps}: AppProps) {
    return (
        <div className="flex flex-col h-screen max-h-screen bg-base-200 overflow-hidden">
            <RecoilRoot>
                <WebsocketListener />
                <Navbar />
                <Component {...pageProps} />
                <Alerts />
            </RecoilRoot>
        </div>
    );
}
export default MyApp;
