import { useCallback, useEffect, useState } from "react";

export function useApiQuery<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(url);
    if (res.ok) setData(await res.json());
    setIsLoading(false);
  }, [url]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, refresh, setData };
}
