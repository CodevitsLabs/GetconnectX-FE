import { Image } from 'expo-image';
import { View } from 'react-native';

import { AppCard, AppPill, AppText } from '@shared/components';

import type { ProductItem } from '../types/products.types';

type ProductCardProps = {
  product: ProductItem;
};

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <AppCard className="gap-4">
      <View className="flex-row gap-4">
        <Image
          contentFit="cover"
          source={{ uri: product.thumbnail }}
          style={{ borderRadius: 16, height: 72, width: 72 }}
        />

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <AppText numberOfLines={1} variant="bodyStrong">
                {product.title}
              </AppText>
              <AppText numberOfLines={1} tone="muted">
                {product.brand ? `${product.brand} · ${product.category}` : product.category}
              </AppText>
            </View>
            <View className="items-end gap-1">
              <AppText tone="muted" variant="label">
                Price
              </AppText>
              <AppText variant="subtitle">{formatCurrency(product.price)}</AppText>
            </View>
          </View>

          <AppText numberOfLines={2} tone="muted">
            {product.description}
          </AppText>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <AppPill label={`${product.rating.toFixed(1)} rating`} tone="neutral" />
        <AppPill label={`${product.stock} in stock`} tone={product.stock < 20 ? 'signal' : 'success'} />
        <AppPill label={`${product.discountPercentage.toFixed(0)}% off`} tone="accent" />
      </View>

      <AppCard tone="muted" className="gap-1">
        <AppText tone="muted" variant="label">
          Availability
        </AppText>
        <AppText variant="bodyStrong">{product.availabilityStatus}</AppText>
        <AppText tone="muted">{product.shippingInformation}</AppText>
      </AppCard>
    </AppCard>
  );
}
