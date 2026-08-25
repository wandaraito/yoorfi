export type UserRole = 'customer' | 'tailor' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export type CustomOrderStatus =
  | 'requested'
  | 'quoted'
  | 'accepted'
  | 'payment_pending'
  | 'paid'
  | 'measurements_confirmed'
  | 'fabric_confirmed'
  | 'cutting'
  | 'sewing'
  | 'quality_check'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd';
export type QuotationStatus = 'pending' | 'accepted' | 'rejected' | 'revision_requested';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface TailorProfile {
  id: string;
  tailor_id: string;
  bio: string | null;
  specialties: string[];
  years_experience: number;
  starting_price: number;
  avg_delivery_days: number;
  verification_status: VerificationStatus;
  rating: number;
  completed_orders: number;
  cancellation_rate: number;
  avg_delivery_time: number;
  is_featured: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  icon: string | null;
  sort_order: number;
}

export interface PortfolioItem {
  id: string;
  tailor_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  tailor_id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tailor_profiles?: TailorProfile;
  categories?: Category;
}

export interface Service {
  id: string;
  tailor_id: string;
  name: string;
  description: string | null;
  base_price: number;
  turnaround_days: number;
  is_active: boolean;
}

export interface MeasurementProfile {
  id: string;
  user_id: string;
  name: string;
  measurements: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  is_default: boolean;
}

export interface CustomOrder {
  id: string;
  customer_id: string;
  tailor_id: string;
  clothing_type: string;
  inspiration_images: string[];
  notes: string | null;
  fabric_option: 'customer_provides' | 'tailor_provides';
  fabric_preference: string | null;
  measurement_profile_id: string | null;
  manual_measurements: Record<string, string> | null;
  needs_measurement_assistance: boolean;
  preferences: Record<string, string>;
  budget_min: number | null;
  budget_max: number | null;
  status: CustomOrderStatus;
  final_price: number | null;
  created_at: string;
  updated_at: string;
  tailor_profiles?: TailorProfile;
}

export interface Quotation {
  id: string;
  custom_order_id: string;
  price: number;
  fabric_cost: number;
  estimated_completion_date: string | null;
  delivery_estimate: string | null;
  notes: string | null;
  status: QuotationStatus;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  tailor_id: string | null;
  custom_order_id: string | null;
  order_type: 'custom' | 'ready_to_wear';
  total: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  shipping_address: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  tailor_profiles?: TailorProfile;
  custom_orders?: CustomOrder;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string | null;
  custom_order_id: string | null;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  tailor_id: string;
  custom_order_id: string | null;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  order_reference: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  tailor_id: string;
  order_id: string | null;
  custom_order_id: string | null;
  rating: number;
  comment: string | null;
  images: string[];
  created_at: string;
  profiles?: Profile;
}

export interface Payment {
  id: string;
  order_id: string | null;
  custom_order_id: string | null;
  customer_id: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  reference: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  tailor_id: string | null;
  product_id: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string | null;
  custom_order_id: string | null;
  raised_by: string;
  reason: string;
  description: string | null;
  status: DisputeStatus;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export const CLOTHING_TYPES = [
  'Shirt',
  'Trousers',
  'Senator',
  'Agbada',
  'Dress',
  'Two-piece',
  'Kaftan',
] as const;

export const NIGERIAN_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Benin City',
  'Kano',
  'Kaduna',
  'Enugu',
] as const;

export const CUSTOM_ORDER_STEPS: CustomOrderStatus[] = [
  'requested',
  'quoted',
  'accepted',
  'payment_pending',
  'paid',
  'measurements_confirmed',
  'fabric_confirmed',
  'cutting',
  'sewing',
  'quality_check',
  'ready_for_dispatch',
  'dispatched',
  'delivered',
  'completed',
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  requested: 'Request Sent',
  quoted: 'Quotation Ready',
  accepted: 'Order Accepted',
  payment_pending: 'Awaiting Payment',
  paid: 'Payment Confirmed',
  measurements_confirmed: 'Measurements Confirmed',
  fabric_confirmed: 'Fabric Confirmed',
  cutting: 'Cutting',
  sewing: 'Sewing',
  quality_check: 'Quality Check',
  ready_for_dispatch: 'Ready for Dispatch',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  pending: 'Pending',
  processing: 'Processing',
};

export function formatNGN(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₦0';
  return '₦' + new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}
