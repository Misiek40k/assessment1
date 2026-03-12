import { useCallback, useEffect } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso'

function Items() {
  const { items, fetchItems, setItems, loading, page, isLastPage } = useData();

  const loadMore = useCallback(async () => {
    if (!loading || !isLastPage) {
      const { data } = await fetchItems(page + 1);
      setItems(prevItems => [...prevItems, ...data]);
    }
  }, [fetchItems, loading, page, isLastPage, setItems]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const { data } = await fetchItems(page);

        if (active) {
          setItems(data);
        }
      } catch (error) {
        if (active) {
          console.error(error);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [fetchItems, setItems]);

  if (!items.length) return <p>Loading...</p>;

  return (
    <Virtuoso
      style={{ height: '500px' }}
      data={items}
      endReached={loadMore}
      increaseViewportBy={200}
      itemContent={(index, item) => (
        <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          <Link to={'/items/' + item.id}>
            {index + 1}. {item.name}
          </Link>
        </div>
      )}
      components={{
        Footer: () => (
          loading ? <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div> : null
        )
      }}
    />
  );
}

export default Items;