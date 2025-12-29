import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import HashtagPage from './pages/HashtagPage';
import './index.css';

function App() {
    return (
        <ThemeProvider>
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
                                            <Route path="/profile/:userId" element={<Profile />} />
                                            <Route path="/hashtag/:tagName" element={<HashtagPage />} />
                                        </Routes>
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
