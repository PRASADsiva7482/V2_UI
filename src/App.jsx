import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route
                        path="/*"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/users" element={<Dashboard />} />
                                        <Route path="/products" element={<Dashboard />} />
                                        <Route path="/analytics" element={<Dashboard />} />
                                        <Route path="/reports" element={<Dashboard />} />
                                        <Route path="/settings" element={<Dashboard />} />
                                    </Routes>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
