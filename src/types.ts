export type Role = 'user' | 'admin';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  discountPercentage: number;
  images: string[];
  category: string;
  subcategory?: string;
  sizes: string[];
  colors?: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isTrending?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

export interface Address {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'online';
  paymentId?: string;
  shippingAddress: Address;
  createdAt: number;
}

export interface Customer {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  addresses: Address[];
  wishlist: string[];
  createdAt: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
}
