import { StackNavigationProp } from '@react-navigation/stack';
import { Product, Order, OrderItem } from '@/utils/index';

export type RootStackParamList = {
    '(tabs)': undefined;
    'product': undefined;
    'camera': undefined;
    'cart': undefined;
    'modal': undefined;
    'screens/FilterSideMenuScreen': undefined;
    'screens/DeliveryAndPaymentInfoScreen': undefined;
    'screens/ProfileEditorScreen': undefined;
    'screens/PhotoPreviewScreen': undefined;
    'screens/PhotoSelectScreen': undefined;
    'screens/ProfileScreen': undefined;
    'screens/LoginScreen': undefined;
    'screens/ProductDetailScreen': { image: any, product: Product };
    'screens/PaymentSuccessScreen': undefined;
    'screens/PaymentFailScreen': undefined;
    'screens/OrderHistoryScreen': undefined;
    'screens/OrderDetailScreen': { order: Order };
    'components/checkout/PaymentMethod': undefined;
    'components/checkout/PersonalInfo': undefined;
};

export type NavigationProps = StackNavigationProp<RootStackParamList>;
