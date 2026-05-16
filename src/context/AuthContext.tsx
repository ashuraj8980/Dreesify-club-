import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Customer } from '../types';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['ashukumar8076801908@gmail.com', 'sanachauhan393@gmail.com'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const customerRef = doc(db, 'customers', user.uid);
          const customerSnap = await getDoc(customerRef);
          
          if (customerSnap.exists()) {
            const data = customerSnap.data() as Customer;
            // Auto-upgrade to admin if email matches
            if (user.email && ADMIN_EMAILS.includes(user.email) && data.role !== 'admin') {
              const { updateDoc } = await import('firebase/firestore');
              await updateDoc(customerRef, { role: 'admin' });
              data.role = 'admin';
            }
            setCustomer(data);
          } else {
            const newRole = (user.email && ADMIN_EMAILS.includes(user.email)) ? 'admin' : 'user';
            const newCustomer: Customer = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Anonymous Partner',
              photoURL: user.photoURL || '',
              role: newRole,
              addresses: [],
              wishlist: [],
              createdAt: Date.now(),
            };
            await setDoc(customerRef, newCustomer);
            setCustomer(newCustomer);
            import('react-hot-toast').then(m => m.default.success('Foundation Identity Created'));
          }
        } else {
          setCustomer(null);
        }
      } catch (err) {
        console.error('Auth synchronization error:', err);
        import('react-hot-toast').then(m => m.default.error('Memory Sync Failed. Please refresh.'));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure specific popup behavior
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const isAdminUser = ADMIN_EMAILS.includes(result.user.email || '');
        import('react-hot-toast').then(m => {
          m.default.success(`Welcome, ${result.user.displayName || 'Partner'}`);
          if (isAdminUser) {
            setTimeout(() => {
              m.default.success('Admin privileges active. Access Control Panel in the navigation.');
            }, 1000);
          }
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-blocked') {
        import('react-hot-toast').then(m => m.default.error('Login Popup Blocked by Browser'));
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore user cancellation
      } else {
        import('react-hot-toast').then(m => m.default.error(`Access Denied: ${err.message}`));
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = customer?.role === 'admin' || (user?.email ? ADMIN_EMAILS.includes(user.email) : false);

  const isInWishlist = (productId: string) => {
    return customer?.wishlist?.includes(productId) || false;
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return;
    }

    const { updateDoc, arrayUnion, arrayRemove } = await import('firebase/firestore');
    const customerRef = doc(db, 'customers', user.uid);
    const isCurrentlyIn = isInWishlist(productId);

    try {
      await updateDoc(customerRef, {
        wishlist: isCurrentlyIn ? arrayRemove(productId) : arrayUnion(productId)
      });
      // Update local state for immediate feedback
      setCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          wishlist: isCurrentlyIn 
            ? prev.wishlist.filter(id => id !== productId) 
            : [...prev.wishlist, productId]
        };
      });
      import('react-hot-toast').then(m => m.default.success(isCurrentlyIn ? 'Removed from wishlist' : 'Added to wishlist'));
    } catch (err) {
      console.error(err);
      import('react-hot-toast').then(m => m.default.error('Failed to update wishlist'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, customer, loading, login, logout, isAdmin, isInWishlist, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
