import {SetterOrUpdater} from 'recoil';
import {splitCmd} from '.';
const WS_ADDRESS = process.env.WS_ADDRESS;
type ListenerEvent = '/login' | '/error' | '/host_game_success';
export default class RelayWS {
    static ws: WebSocket | null = null;
    static listeners: Map<string, (p: string) => void> = new Map();

    static connect(identity: {user_id: string; password: string}) {
        if (typeof WS_ADDRESS != 'string')
            throw new Error('WS_ADDRESS not defined');
        let ws = new WebSocket(WS_ADDRESS);
        ws.onopen = () => {
            console.log('WS connected');
            ws.send(`/login ${JSON.stringify(identity)}`);
        };
        RelayWS.ws = ws;
        ws.onmessage = ({data}: {data: string}) => {
            const [command] = splitCmd(data);
            const handler = RelayWS.listeners.get(command);
            if (handler) handler(data);
            else console.log('unhandled ws message: ', data);
        };
    }

    static addListener(command: ListenerEvent, listener: (p: string) => void) {
        RelayWS.listeners.set(command, listener);
    }

    static sendHostGame(gameId: string) {
        if (!RelayWS.ws) throw Error('uninitialised');
        RelayWS.ws.send('/host_game ' + gameId);
    }
}
