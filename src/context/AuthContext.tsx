import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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

const ADMIN_EMAILS = [
  'ashukumar8076801908@gmail.com', 
  'sanachauhan393@gmail.com',
  'dressifyindia@gmail.com',
  'kumarashu807680@gmail.com'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure persistence is set to local
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Persistence error:', err);
    });

    let unsubscribeCustomer: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (unsubscribeCustomer) {
        unsubscribeCustomer();
        unsubscribeCustomer = undefined;
      }

      if (user) {
        // Set loading to false early if it's a known admin email to speed up panel access
        if (ADMIN_EMAILS.includes(user.email || '')) {
          setLoading(false);
        }

        try {
          const customerRef = doc(db, 'customers', user.uid);
          
          // Use onSnapshot for real-time updates and more robust state management
          unsubscribeCustomer = onSnapshot(customerRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as Customer;
              
              // Handle auto-upgrade to admin for trusted emails
              const isTrusted = user.email && ADMIN_EMAILS.includes(user.email);
              if (isTrusted && data.role !== 'admin') {
                const { updateDoc } = await import('firebase/firestore');
                // The new rules allow this upgrade for trusted emails
                await updateDoc(customerRef, { role: 'admin' }).catch(e => console.warn('Role sync deferred:', e));
                data.role = 'admin';
              }
              setCustomer(data);
              setLoading(false);
            } else {
              // Create new record
              const isTrusted = user.email && ADMIN_EMAILS.includes(user.email);
              const newRole = isTrusted ? 'admin' : 'user';
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
              
              try {
                await setDoc(customerRef, newCustomer);
                setCustomer(newCustomer);
                setLoading(false);
                import('react-hot-toast').then(m => m.default.success('Foundation Identity Created'));
              } catch (err) {
                console.error('Failed to create customer identity:', err);
                setLoading(false);
              }
            }
          }, (err) => {
            console.error('Customer sync error:', err);
            setLoading(false);
          });
        } catch (err) {
          console.error('Auth sync prep error:', err);
          setLoading(false);
        }
      } else {
        setCustomer(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCustomer) unsubscribeCustomer();
    };
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
      let errorMessage = `Access Denied: ${err.message}`;
      
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Login Popup Blocked by Browser. Please allow popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        return; // Ignore user cancellation
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized in Firebase Console. Please add your Vercel domain to Authorized Domains in Firebase Auth settings.';
      }

      import('react-hot-toast').then(m => m.default.error(errorMessage, { duration: 6000 }));
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
      await login();
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
