import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {userAtom} from '../user';

export default function useRequiresLogin() {
    const userId = useRecoilValue(userAtom);
    const router = useRouter();
    useEffect(() => {
        if (userId == null) {
            router.push('/login');
        }
    }, [userId, router]);
}
