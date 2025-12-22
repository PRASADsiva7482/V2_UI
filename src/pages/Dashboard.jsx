import './Dashboard.css';
import {
    TrendingUp,
    Users,
    ShoppingCart,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
    const stats = [
        {
            title: 'Total Revenue',
            value: '$45,231.89',
            change: '+20.1%',
            trend: 'up',
            icon: DollarSign,
            color: 'primary'
        },
        {
            title: 'Active Users',
            value: '2,350',
            change: '+15.3%',
            trend: 'up',
            icon: Users,
            color: 'success'
        },
        {
            title: 'Orders',
            value: '1,234',
            change: '+12.5%',
            trend: 'up',
            icon: ShoppingCart,
            color: 'secondary'
        },
        {
            title: 'Conversion Rate',
            value: '3.24%',
            change: '-2.4%',
            trend: 'down',
            icon: Activity,
            color: 'warning'
        }
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-header">
                            <span className="stat-title">{stat.title}</span>
                            <div className={`stat-icon stat-icon-${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="stat-body">
                            <h2 className="stat-value">{stat.value}</h2>
                            <div className={`stat-change ${stat.trend}`}>
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight size={16} />
                                ) : (
                                    <ArrowDownRight size={16} />
                                )}
                                <span>{stat.change}</span>
                                <span className="stat-period">from last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <div className="content-card">
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                        <button className="btn-ghost">View All</button>
                    </div>
                    <div className="card-body">
                        <div className="activity-list">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div key={item} className="activity-item">
                                    <div className="activity-icon">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p className="activity-title">New order received</p>
                                        <p className="activity-time">{item} hours ago</p>
                                    </div>
                                    <div className="activity-value">+$234.00</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="card-body">
                        <div className="quick-actions">
                            <button className="action-btn">
                                <Users size={20} />
                                <span>Add User</span>
                            </button>
                            <button className="action-btn">
                                <ShoppingCart size={20} />
                                <span>New Order</span>
                            </button>
                            <button className="action-btn">
                                <Activity size={20} />
                                <span>View Reports</span>
                            </button>
                            <button className="action-btn">
                                <DollarSign size={20} />
                                <span>Payments</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
