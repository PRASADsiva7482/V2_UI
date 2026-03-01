import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const PrivateRoute = ({ children }) => {
    const { authenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-loader">
                <div className="page-loader-spinner"></div>
            </div>
        );
    }

    return authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
