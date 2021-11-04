import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {userStatusAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Spinner from './svg/Spinner';

export default function UserStatus() {
    const userStatus = useRecoilValue(userStatusAtom);
    useEffect(() => {
        RelayWS.queueOnOpen(() => RelayWS.sendUserStatus(), true);
    }, []);
    useEffect(() => {
        if (userStatus?.game_id) {
            RelayWS.sendJoinGame(userStatus.game_id);
        }
    }, [userStatus?.game_id]);
    return (
        <>
            {userStatus && userStatus.game_id && (
                <div className="absolute w-screen h-screen top-0 left-0 flex justify-center items-center flex-col gap-10 bg-gray-800 bg-opacity-50">
                    <div className="modal-box select-none">
                        <div className="flex justify-center items-center flex-col gap-10">
                            <br />
                            <div className="xl">
                                Reconnecting to <b>{userStatus.game_id}</b>
                            </div>
                            <div>
                                <Spinner size={10} />
                            </div>
                            <br />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
