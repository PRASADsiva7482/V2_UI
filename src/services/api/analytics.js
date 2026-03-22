import apiCaller from './apiCaller';
import { URLS } from './Urls';

export const getAnalyticsDashboard = async () => apiCaller.get(URLS.ANALYTICS.DASHBOARD);
