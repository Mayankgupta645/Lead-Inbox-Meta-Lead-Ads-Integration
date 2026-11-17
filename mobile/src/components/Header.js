import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export default function Header({ total, arrived, connected }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.statusRow}>
        <Text style={styles.title}>Lead inbox</Text>
        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: connected ? colors.flag : colors.slate }]} />
          <Text style={styles.statusText}>{connected ? 'Listening' : 'Offline'}</Text>
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count} accessibilityLabel={`${total} leads`}>
          {total}
        </Text>
        <View style={styles.side}>
          <Text style={styles.sideMain}>{total === 1 ? 'lead' : 'leads'} so far</Text>
          <Text style={styles.sideSub}>
            {arrived === 0
              ? 'None new since you opened this'
              : `${arrived} came in while you watched`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 14,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.ink,
  },
  status: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, marginRight: 6 }, // square on purpose
  statusText: { fontFamily: fonts.body, fontSize: 13, color: colors.slate },

  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
    marginLeft: -4, // pulls the big numeral optically flush with the text below
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 112,
    lineHeight: 108,
    color: colors.ink,
    letterSpacing: -4,
  },
  side: { marginLeft: 12, paddingBottom: 14, flexShrink: 1 },
  sideMain: { fontFamily: fonts.displayMedium, fontSize: 22, color: colors.ink },
  sideSub: { fontFamily: fonts.body, fontSize: 14, color: colors.slate, marginTop: 2 },
});
