import { renderRoutes } from 'react-router-config';
import App from '../components/App';

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: App,
      },
    ],
  },
];

const router = renderRoutes(routes);

export default router;
