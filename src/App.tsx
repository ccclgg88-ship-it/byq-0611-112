import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home';
import EditorPage from '@/pages/EditorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/editor/:id',
    element: <EditorPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
