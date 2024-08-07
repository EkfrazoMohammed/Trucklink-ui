import React, { createContext, useContext, useState } from 'react';

const LocalStorageContext = createContext();

export const LocalStorageProvider = ({ children }) => {
  const [updateCount, setUpdateCount] = useState(0);

  const triggerUpdate = () => setUpdateCount(prev => prev + 1);

  return (
    <LocalStorageContext.Provider value={{ updateCount, triggerUpdate }}>
      {children}
    </LocalStorageContext.Provider>
  );
};

export const useLocalStorage = () => useContext(LocalStorageContext);
