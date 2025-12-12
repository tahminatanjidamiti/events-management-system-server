import express from 'express';
import { UserRoutes } from '../modules/user/user.router';
import { AuthRoutes } from '../modules/auth/auth.router';
import { HostRoutes } from '../modules/host/host.routes';
import { EventRoutes } from '../modules/event/event.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';


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
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;