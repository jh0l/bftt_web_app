import {splitCmd} from '.';
const WS_ADDRESS = process.env.WS_ADDRESS;

let ws: WebSocket | null = null;

type ListenerEvent =
    | '/login'
    | '/logout'
    | '/error'
    | '/host_game_success'
    | '/join_game_success'
    | '/player_joined'
    | '/start_game'
    | '/replenish'
    | '/alert';
export default class RelayWS {
    static listeners: Map<string, (p: string) => void> = new Map();
    static verifyId: NodeJS.Timeout;

    static connect(
        identity: {user_id: string; password: string},
        callback?: () => void
    ) {
        if (typeof WS_ADDRESS != 'string')
            throw new Error('WS_ADDRESS not defined');
        ws = new WebSocket(WS_ADDRESS);
        ws.onopen = () => {
            console.log('WS connected');
            if (!ws) throw Error('uninitialised');
            ws.send(`/login ${JSON.stringify(identity)}`);
        };
        ws.onmessage = ({data}: {data: string}) => {
            callback && callback();
            const [command] = splitCmd(data);
            if (command === '/login') RelayWS.verifySession();
            const handler = RelayWS.listeners.get(command);
            if (handler) handler(data);
            else console.log('unhandled ws message: ', data);
        };
        ws.onclose = () => {
            ws = null;
        };
    }

    static close() {
        if (!ws) throw Error('uninitialised');
        ws.close();
    }

    static addListener(command: ListenerEvent, listener: (p: string) => void) {
        RelayWS.listeners.set(command, listener);
    }

    static verifySession() {
        clearTimeout(RelayWS.verifyId);
        RelayWS.verifyId = setTimeout(() => {
            if (!ws) return;
            ws.send('/verify');
            RelayWS.verifySession();
        }, 3333);
    }

    static sendHostGame(gameId: string) {
        if (!ws) throw Error('uninitialised');
        ws.send('/host_game ' + gameId);
    }

    static sendJoinGame(gameId: string) {
        if (!ws) throw Error('uninitialised');
        ws.send('/join_game ' + gameId);
    }

    static sendStartGame(gameId: string) {
        if (!ws) throw Error('uninitialised');
        ws.send('/start_game ' + gameId);
    }
}
