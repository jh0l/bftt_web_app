import {splitCmd} from '.';
import {AlertType} from './alerts';
import {ConfGame, PlayerAction} from './game';
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
    | '/action_point_update'
    | '/conf_game'
    | '/user_status'
    | '/board_action_points'
    | '/turn_end_unix'
    | '/player_action'
    | '/players_alive_update'
    | '/alert';
export default class RelayWS {
    static WS_OPEN = false;
    static AUTHED = false;
    static listeners: Map<string, (p: string) => void> = new Map();
    static verifyId: NodeJS.Timeout;
    static sessionKey: string;
    static onOpenQueue: (() => void)[] = [];
    static onAuthQueue: (() => void)[] = [];
    static logoutCallback: (() => Promise<void>) | undefined;
    static alertCallback: (notif: AlertType) => void;

    static connect(identity: {user_id: string; password: string}) {
        if (typeof WS_ADDRESS != 'string')
            throw new Error('WS_ADDRESS not defined');
        ws = new WebSocket(WS_ADDRESS);
        ws.onopen = () => {
            RelayWS.WS_OPEN = true;
            console.log('WS connected');
            if (!ws) throw Error('uninitialised');
            ws.send(`/login ${JSON.stringify(identity)}`);
            RelayWS.sendOpenQueue();
        };
        ws.onmessage = ({data}: {data: string}) => {
            const [command, payload] = splitCmd(data);
            const handler = RelayWS.listeners.get(command);
            console.log(command);
            if (handler) handler(payload);
            else console.log('unhandled ws message: ', data);
            if (command === '/login') {
                RelayWS.AUTHED = true;
                RelayWS.verifySession();
                RelayWS.sendAuthQueue();
            }
        };
        ws.onclose = () => {
            RelayWS.WS_OPEN = false;
            ws = null;
            if (RelayWS.logoutCallback) {
                RelayWS.logoutCallback();
                RelayWS.alertCallback({
                    msg: 'Connection with server closed',
                    type: 'info',
                });
            }
        };
    }

    static close() {
        if (!ws) throw Error('uninitialised');
        ws.close();
        clearTimeout(RelayWS.verifyId);
    }

    static addListener(command: ListenerEvent, listener: (p: string) => void) {
        RelayWS.listeners.set(command, listener);
    }

    static async addJsonListener<T>(
        command: ListenerEvent,
        listener: ((p: T) => void) | ((p: T) => Promise<void>)
    ) {
        // TODO handle parsing errors
        RelayWS.listeners.set(command, async (str) => {
            listener(JSON.parse(str));
        });
    }

    static queueSend(func: () => void, authRequired = false) {
        if (
            RelayWS.WS_OPEN &&
            (!authRequired || (authRequired && RelayWS.AUTHED))
        )
            func();
        else if (!authRequired) {
            RelayWS.onOpenQueue.push(func);
        } else {
            RelayWS.onAuthQueue.push(func);
        }
    }

    static sendOpenQueue() {
        for (let func of RelayWS.onOpenQueue) {
            func();
        }
    }

    static sendAuthQueue() {
        for (let func of RelayWS.onAuthQueue) {
            func();
        }
    }

    static verifySession() {
        this.queueSend(() => {
            if (!ws) return;
            try {
                ws.send(`/verify ${RelayWS.sessionKey}`);
                clearTimeout(RelayWS.verifyId);
                RelayWS.verifyId = setTimeout(() => {
                    RelayWS.verifySession();
                }, 3333);
            } catch (e) {
                console.log(e);
            }
        });
    }

    static sendHostGame(gameId: string) {
        if (!ws) throw Error('uninitialised');
        ws.send('/host_game ' + gameId);
    }

    static sendJoinGame(gameId: string) {
        if (!ws) throw Error('uninitialised');
        ws.send('/join_game ' + gameId);
    }

    static sendConfGame(conf: ConfGame) {
        if (!ws) throw Error('uninitialized');
        ws.send('/conf_game ' + JSON.stringify(conf));
    }

    static sendStartGame(gameId: string) {
        if (!ws) throw Error('uninitialised');
        ws.send('/start_game ' + gameId);
    }

    static sendUserStatus() {
        if (!ws) throw Error('uninitialised');
        ws.send('/user_status');
    }

    static sendPlayerAction(action: PlayerAction) {
        if (!ws) throw Error('uninitialised');
        ws.send('/player_action ' + JSON.stringify(action));
    }
}
