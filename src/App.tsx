import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import EditorPage from '@/pages/EditorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/editor/draft_default" replace />,
  },
  {
    path: '/editor/:id',
    element: <EditorPage />,
  },
  {
    path: '/other',
    element: <div className="flex items-center justify-center h-screen text-xl text-gray-500">Other Page - Coming Soon</div>,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
