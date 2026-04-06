import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppButton, AppCard, AppPill, AppStatCard, AppText } from '@shared/components';

import { useProducts } from '../hooks/use-products';
import { ProductCard } from './product-card';

export function ProductsScreen() {
  const { data, error, isLoading, refetch } = useProducts();
  const averagePrice = data
    ? data.products.reduce((sum, product) => sum + product.price, 0) / data.products.length
    : 0;
  const lowStockCount = data ? data.products.filter((product) => product.stock < 20).length : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Market' }} />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-6 px-5 pt-4 pb-24"
        contentInsetAdjustmentBehavior="automatic">
        <View className="gap-3">
          <AppPill className="self-start" label="Market" tone="accent" />
          <AppText variant="hero">Curated offers, priced for quick decisions.</AppText>
          <AppText tone="muted">
            Keep the summary numbers up top, then move into compact offer cards with only the
            details that influence action.
          </AppText>
        </View>

        {isLoading ? (
          <AppCard tone="muted" className="gap-2">
            <AppText variant="subtitle">Loading market data</AppText>
            <AppText tone="muted">Offer inventory is syncing into the local view.</AppText>
          </AppCard>
        ) : null}

        {error ? (
          <AppCard tone="signal" className="gap-3">
            <AppText variant="subtitle">Could not load market data</AppText>
            <AppText tone="muted">
              {error instanceof Error ? error.message : 'Unknown request error'}
            </AppText>
            <AppButton
              detail="Fetch the latest offers again"
              label="Retry"
              onPress={() => {
                void refetch();
              }}
              variant="secondary"
            />
          </AppCard>
        ) : null}

        {data ? (
          <>
            <View className="flex-row gap-3">
              <AppStatCard
                className="flex-1"
                detail="Tracked offers"
                label="Total"
                tone="accent"
                value={String(data.total)}
              />
              <AppStatCard
                className="flex-1"
                detail="Average price"
                label="Ticket"
                value={`$${averagePrice.toFixed(0)}`}
              />
            </View>

            <AppStatCard
              detail="Need attention"
              label="Low Stock"
              tone={lowStockCount > 0 ? 'signal' : 'success'}
              value={String(lowStockCount)}
            />

            <View className="gap-4">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}
