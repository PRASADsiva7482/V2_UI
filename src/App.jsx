import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';
import { DataCacheProvider } from './context/DataCacheContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './components/common/Toast';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import './index.css';

// Lazy-loaded page components (U-10)
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const HashtagPage = lazy(() => import('./pages/HashtagPage'));
const Explore = lazy(() => import('./pages/Explore'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Connections = lazy(() => import('./pages/Connections'));
const Settings = lazy(() => import('./pages/Settings'));
const PostPage = lazy(() => import('./pages/PostPage'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Chat = lazy(() => import('./components/chat/Chat'));

// Suspense fallback for lazy-loaded pages
const PageLoader = () => (
    <div className="page-loader">
        <div className="page-loader-spinner"></div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <SettingsProvider>
                        <ToastProvider>
                            <ChatProvider>
                                <DataCacheProvider>
                                    <Router>
                                        <Routes>
                                            <Route
                                                path="/*"
                                                element={
                                                    <PrivateRoute>
                                                        <MainLayout>
                                                            <Suspense fallback={<PageLoader />}>
                                                                <ErrorBoundary>
                                                                    <Routes>
                                                                        <Route path="/" element={<Home />} />
                                                                        <Route path="/home" element={<Home />} />
                                                                        <Route path="/explore" element={<Explore />} />
                                                                        <Route path="/notifications" element={<Notifications />} />
                                                                        <Route path="/profile/u/:username" element={<Profile />} />
                                                                        <Route path="/profile/:userId" element={<Profile />} />
                                                                        <Route path="/hashtag/:tagName" element={<HashtagPage />} />
                                                                        <Route path="/connections" element={<Connections />} />
                                                                        <Route path="/settings/*" element={<Settings />} />
                                                                        <Route path="/post/:postId" element={<PostPage />} />
                                                                        <Route path="/bookmarks" element={<Bookmarks />} />
                                                                        <Route path="/chat" element={<Chat />} />
                                                                    </Routes>
                                                                </ErrorBoundary>
                                                            </Suspense>
                                                        </MainLayout>
                                                    </PrivateRoute>
                                                }
                                            />
                                        </Routes>
                                    </Router>
                                </DataCacheProvider>
                            </ChatProvider>
                        </ToastProvider>
                    </SettingsProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
