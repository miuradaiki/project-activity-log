export interface LocalStorageMockStore {
  store: Record<string, string>;
  reset: () => void;
}

/**
 * localStorage モックをセットアップする
 */
export const setupLocalStorageMock = (): LocalStorageMockStore => {
  const store: Record<string, string> = {};
  const localStorageMock = window.localStorage as jest.Mocked<
    typeof window.localStorage
  >;

  localStorageMock.getItem.mockImplementation(
    (key: string) => store[key] || null
  );
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    store[key] = value;
  });
  localStorageMock.removeItem.mockImplementation((key: string) => {
    delete store[key];
  });
  localStorageMock.clear.mockImplementation(() => {
    Object.keys(store).forEach((key) => delete store[key]);
  });

  return {
    store,
    reset: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};
