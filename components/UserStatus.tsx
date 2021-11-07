import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {userStatusAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Spinner from './svg/Spinner';

export default function UserStatus() {
    const userStatus = useRecoilValue(userStatusAtom);
    console.log(userStatus);
    useEffect(() => {
        RelayWS.queueSend(() => RelayWS.sendUserStatus(), true);
    }, []);
    useEffect(() => {
        if (userStatus?.game_id) {
            RelayWS.sendJoinGame(userStatus.game_id);
        }
    }, [userStatus?.game_id]);
    if (userStatus && userStatus.game_id)
        return (
            <>
                <div className="absolute w-screen h-screen top-0 left-0 flex justify-center items-center flex-col gap-10 bg-opacity-95 bg-base-300">
                    <div className="modal-box select-none">
                        <div className="flex justify-center items-center flex-col gap-10">
                            <br />
                            <div className="text-xl">
                                Reconnecting to <b>{userStatus.game_id}</b>
                            </div>
                            <div>
                                <Spinner />
                            </div>
                            <br />
                        </div>
                    </div>
                </div>
            </>
        );
    return null;
}
