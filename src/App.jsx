// src/App.jsx
// Application root — routing configuration.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Catalog from './pages/Catalog.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyLoans from './pages/MyLoans.jsx';
import { NotFound, Forbidden } from './pages/NotFound.jsx';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminBooks from './pages/admin/AdminBooks.jsx';
import AdminLoans from './pages/admin/AdminLoans.jsx';
import AdminMembers from './pages/admin/AdminMembers.jsx';
import AdminActivity from './pages/admin/AdminActivity.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Member protected */}
            <Route path="/my-loans" element={
              <ProtectedRoute><MyLoans /></ProtectedRoute>
            } />

            {/* Admin protected */}
            <Route path="/admin" element={
              <AdminRoute><AdminLayout /></AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="loans" element={<AdminLoans />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="activity" element={<AdminActivity />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
