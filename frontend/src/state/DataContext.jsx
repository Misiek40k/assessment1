import { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const itemsPerPage = 20;

  const fetchItems = useCallback(async (targetPage = 1) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:4001/api/items?limit=${itemsPerPage}&page=${targetPage}`);
      const data = await res.json();

      setPage(targetPage);

      if (data.metadata.isLast) {
        setIsLastPage(true);
      } 

      return data;
    } catch (error) {
      console.error("Items fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{
      items,
      fetchItems,
      setItems,
      page,
      isLoading,
      isLastPage
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);