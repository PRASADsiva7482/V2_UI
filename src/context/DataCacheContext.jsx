import { createContext, useState, useContext, useCallback } from 'react';

const DataCacheContext = createContext();

export const useDataCache = () => {
    const context = useContext(DataCacheContext);
    if (!context) {
        throw new Error('useDataCache must be used within a DataCacheProvider');
    }
    return context;
};

export const DataCacheProvider = ({ children }) => {
    // Cache structure:
    // {
    //   home: {
    //     forYou: { data: [], page: 0, hasMore: true, timestamp: ... },
    //     following: { data: [], page: 0, hasMore: true, timestamp: ... },
    //     activeTab: 'forYou'
    //   },
    //   explore: {
    //     FOR_YOU: { data: {}, timestamp: ... },
    //     TRENDING: { data: {}, timestamp: ... },
    //     ...
    //     activeCategory: 'FOR_YOU'
    //   }
    // }
    const [cache, setCache] = useState({
        home: {
            forYou: null,
            following: null,
            activeTab: 'forYou'
        },
        explore: {}
    });

    const updateHomeCache = useCallback((tab, data) => {
        setCache(prev => ({
            ...prev,
            home: {
                ...prev.home,
                [tab]: {
                    ...data,
                    timestamp: Date.now()
                }
            }
        }));
    }, []);

    const updateHomeActiveTab = useCallback((tab) => {
        setCache(prev => ({
            ...prev,
            home: {
                ...prev.home,
                activeTab: tab
            }
        }));
    }, []);

    const updateExploreCache = useCallback((category, data) => {
        setCache(prev => ({
            ...prev,
            explore: {
                ...prev.explore,
                [category]: {
                    data,
                    timestamp: Date.now()
                }
            }
        }));
    }, []);

    const updateExploreActiveCategory = useCallback((category) => {
        setCache(prev => ({
            ...prev,
            explore: {
                ...prev.explore,
                activeCategory: category
            }
        }));
    }, []);

    const clearCache = useCallback(() => {
        setCache({
            home: {
                forYou: null,
                following: null,
                activeTab: 'forYou'
            },
            explore: {}
        });
    }, []);

    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes validity

    const isCacheValid = (timestamp) => {
        if (!timestamp) return false;
        return Date.now() - timestamp < CACHE_DURATION;
    };

    return (
        <DataCacheContext.Provider value={{
            cache,
            updateHomeCache,
            updateHomeActiveTab,
            updateExploreCache,
            updateExploreActiveCategory,
            clearCache,
            isCacheValid
        }}>
            {children}
        </DataCacheContext.Provider>
    );
};
