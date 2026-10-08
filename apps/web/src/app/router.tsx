import { createBrowserRouter } from 'react-router';
import { HomePage } from './home-page';

export const router = createBrowserRouter([{ path: '/', element: <HomePage /> }]);
