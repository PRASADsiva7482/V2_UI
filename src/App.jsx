import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
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
                                        <Route path="/" element={<Home />} />
                                        <Route path="/home" element={<Home />} />
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
