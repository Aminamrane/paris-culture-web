import React, { createContext, useState, useContext } from 'react';

var ADMIN_ACCOUNT = {
  id: 'admin',
  name: 'Administrateur',
  email: 'admin@lumina.fr',
  password: 'Lumina2026',
  isAdmin: true,
  createdAt: '2025-01-01',
};

var AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  var _s1 = useState(null); var currentUser = _s1[0]; var setCurrentUser = _s1[1];
  var _s2 = useState([]); var users = _s2[0]; var setUsers = _s2[1];

  function login(email, password) {
    var emailLower = email.trim().toLowerCase();
    // Check admin
    if (emailLower === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      setCurrentUser(ADMIN_ACCOUNT);
      return { success: true, user: ADMIN_ACCOUNT };
    }
    // Check registered users
    var found = users.find(function (u) {
      return u.email.toLowerCase() === emailLower && u.password === password;
    });
    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: 'Email ou mot de passe incorrect.' };
  }

  function signup(name, email, password) {
    var emailLower = email.trim().toLowerCase();
    if (emailLower === ADMIN_ACCOUNT.email) {
      return { success: false, error: 'Cet email est deja utilise.' };
    }
    var exists = users.find(function (u) { return u.email.toLowerCase() === emailLower; });
    if (exists) {
      return { success: false, error: 'Un compte avec cet email existe deja.' };
    }
    var newUser = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      email: emailLower,
      password: password,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setUsers(function (prev) { return prev.concat([newUser]); });
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  function logout() {
    setCurrentUser(null);
  }

  return (
    <AuthCtx.Provider value={{ currentUser, login, signup, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
