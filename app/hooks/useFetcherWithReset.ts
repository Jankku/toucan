import { SerializeFrom } from '@remix-run/node';
import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';

export type FetcherWithComponentsReset<T> = FetcherWithComponents<T> & {
  reset: () => void;
};

export function useFetcherWithReset<T>(): FetcherWithComponentsReset<SerializeFrom<T>> {
  const fetcher = useFetcher<T>();
  const [data, setData] = useState(fetcher.data);
  useEffect(() => {
    if (fetcher.state === 'idle') {
      setData(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);
  return {
    ...fetcher,
    data: data as SerializeFrom<T> | undefined,
    reset: () => setData(undefined),
  };
}
