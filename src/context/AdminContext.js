import React, { createContext, useState, useContext } from 'react';

var DEFAULT_CONFIG = {
  '1': { mapVisible: true,  lists: ['tendances', 'autour'] },
  '2': { mapVisible: true,  lists: ['tendances'] },
  '3': { mapVisible: false, lists: ['autour'] },
  '4': { mapVisible: true,  lists: ['tendances', 'autour'] },
};

var AdminCtx = createContext(null);

export function AdminProvider({ children }) {
  var _s = useState(DEFAULT_CONFIG);
  var config = _s[0]; var setConfig = _s[1];

  function toggleMap(id) {
    setConfig(function (prev) {
      var n = Object.assign({}, prev);
      n[id] = Object.assign({}, n[id], { mapVisible: !n[id].mapVisible });
      return n;
    });
  }

  function toggleList(id, key) {
    setConfig(function (prev) {
      var n = Object.assign({}, prev);
      var lists = n[id].lists.slice();
      var idx = lists.indexOf(key);
      if (idx >= 0) lists.splice(idx, 1); else lists.push(key);
      n[id] = Object.assign({}, n[id], { lists: lists });
      return n;
    });
  }

  return (
    <AdminCtx.Provider value={{ config, toggleMap, toggleList }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminCtx);
}
