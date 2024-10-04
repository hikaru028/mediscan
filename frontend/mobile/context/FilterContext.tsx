import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FilterContextProps {
    searchQuery: string;
    selectedSort: string;
    selectedFilters: { [key: string]: string[] };
    setSearchQuery: (query: string) => void;
    setSelectedSort: (sort: string) => void;
    setSelectedFilters: (filters: { [key: string]: string[] }) => void;
}

const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
};

interface FilterProviderProps {
    children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});

    return (
        <FilterContext.Provider value={{ searchQuery, selectedSort, selectedFilters, setSearchQuery, setSelectedSort, setSelectedFilters }}>
            {children}
        </FilterContext.Provider>
    );
};
