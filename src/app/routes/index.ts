import express from 'express';
import { UserRoutes } from '../modules/user/user.router';
import { AuthRoutes } from '../modules/auth/auth.router';
import { HostRoutes } from '../modules/host/host.routes';
import { EventRoutes } from '../modules/event/event.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { SocialRoutes } from '../modules/social/social.routes';
import { MetaRoutes } from '../modules/meta/meta.routes';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/host',
        route: HostRoutes
    },
    {
        path: '/event',
        route: EventRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
    {
        path: '/social',
        route: SocialRoutes
    },
    {
        path: '/metadata',
        route: MetaRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;