import express from 'express';
import { UserRoutes } from '../modules/user/user.router';
import { AuthRoutes } from '../modules/auth/auth.router';
import { HostRoutes } from '../modules/host/host.routes';

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
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;