import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const fetchData = async (controller) => {
    if (!url) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api(url, {
        ...options,
        signal: controller.signal,
      });

      setData(res.data.data || res.data);
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    fetchData(controller);

    return () => controller.abort();
  }, [url]);

  const refetch = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const newController = new AbortController();
    controllerRef.current = newController;
    return fetchData(newController);
  };

  return { data, loading, error, refetch };
}