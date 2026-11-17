import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  FamiljenGrotesk_500Medium,
  FamiljenGrotesk_700Bold,
} from '@expo-google-fonts/familjen-grotesk';
import {
  InstrumentSans_400Regular,
  InstrumentSans_600SemiBold,
} from '@expo-google-fonts/instrument-sans';

import useLeads from './src/useLeads';
import Header from './src/components/Header';
import LeadRow from './src/components/LeadRow';
import { API_URL } from './src/config';
import { colors, fonts } from './src/theme';

export default function App() {
  const [fontsReady] = useFonts({
    FamiljenGrotesk_500Medium,
    FamiljenGrotesk_700Bold,
    InstrumentSans_400Regular,
    InstrumentSans_600SemiBold,
  });

  const { leads, loading, error, connected, arrived, refresh } = useLeads();
  const [refreshing, setRefreshing] = useState(false);

  // re-render every 30s so "Just now" turns into "1 min ago" without new data
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (!fontsReady) {
    return <View style={styles.screen} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <FlatList
          data={leads}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => <LeadRow lead={item} now={now} />}
          ListHeaderComponent={
            <Header total={leads.length} arrived={arrived} connected={connected} />
          }
          ListEmptyComponent={<Empty loading={loading} error={error} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.ink}
              colors={[colors.ink]}
            />
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Empty({ loading, error }) {
  if (loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Can't reach the server</Text>
        <Text style={styles.emptyText}>
          Tried {API_URL}. Check that the backend is running and that
          EXPO_PUBLIC_API_URL in mobile/.env points to your computer, then pull
          down to retry.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No leads yet</Text>
      <Text style={styles.emptyText}>
        Send one from Meta's Lead Ads Testing Tool. It will show up here on its own.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  empty: { paddingTop: 48, paddingLeft: 20, paddingRight: 36 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.slate,
    marginTop: 8,
  },
});
