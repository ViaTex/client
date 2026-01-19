import axiosInstance from './axios';

export const fetcher = <T>(url: string): Promise<T> => {
  return axiosInstance.get(url).then((res) => res.data);
};
