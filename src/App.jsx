import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';
import { DataCacheProvider } from './context/DataCacheContext';
import { ChatProvider } from './context/ChatContext';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import HashtagPage from './pages/HashtagPage';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Connections from './pages/Connections';
import Chat from './components/chat/Chat';
import './index.css';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ChatProvider>
                    <DataCacheProvider>
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
                                                    <Route path="/explore" element={<Explore />} />
                                                    <Route path="/notifications" element={<Notifications />} />
                                                    <Route path="/profile/:userId" element={<Profile />} />
                                                    <Route path="/hashtag/:tagName" element={<HashtagPage />} />
                                                    <Route path="/connections" element={<Connections />} />
                                                    <Route path="/chat" element={<Chat />} />
                                                </Routes>
                                            </MainLayout>
                                        </PrivateRoute>
                                    }
                                />
                            </Routes>
                        </Router>
                    </DataCacheProvider>
                </ChatProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
