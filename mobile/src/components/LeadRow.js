import React, { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { timeAgo } from '../time';

export default function LeadRow({ lead, now }) {
  // New leads get a marker-pen highlight that fades out over a few seconds.
  // That's the one bit of motion in the app, it tells you "this just landed".
  const fade = useRef(new Animated.Value(lead.isNew ? 1 : 0)).current;
  const [justLanded] = useState(!!lead.isNew);

  useEffect(() => {
    if (!justLanded) return;
    Animated.timing(fade, {
      toValue: 0,
      duration: 6000,
      useNativeDriver: false, // background colour can't use the native driver
    }).start();
  }, [fade, justLanded]);

  const background = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.paper, colors.mark],
  });

  const call = () => {
    if (lead.phone) Linking.openURL(`tel:${lead.phone.replace(/\s/g, '')}`);
  };

  return (
    <Animated.View style={[styles.row, { backgroundColor: background }]}>
      <View style={[styles.rail, justLanded && styles.railNew]} />

      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {lead.name}
          </Text>
          <Text style={styles.time}>{timeAgo(lead.createdAt, now)}</Text>
        </View>

        {!!lead.email && <Text style={styles.line}>{lead.email}</Text>}

        <View style={styles.bottom}>
          {!!lead.phone && (
            <Pressable onPress={call} hitSlop={8} accessibilityRole="link">
              <Text style={styles.phone}>{lead.phone}</Text>
            </Pressable>
          )}
          {!!lead.interest && <Text style={styles.interest}>{lead.interest}</Text>}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  rail: { width: 4, backgroundColor: colors.rule },
  railNew: { backgroundColor: colors.flag },
  body: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 14,
    paddingTop: 15,
    paddingBottom: 12, // not equal to the top, on purpose
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginRight: 12,
  },
  time: { fontFamily: fonts.body, fontSize: 13, color: colors.slate },
  line: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, marginTop: 3 },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
  },
  phone: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  interest: { fontFamily: fonts.body, fontSize: 13, color: colors.slate, fontStyle: 'italic' },
});
