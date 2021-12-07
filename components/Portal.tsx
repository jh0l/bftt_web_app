import dynamic from 'next/dynamic';

const Portal = dynamic(() => import('./PortalBasic'), {
    ssr: false,
});

export default Portal;
