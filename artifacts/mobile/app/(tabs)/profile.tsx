import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
  toggle,
  toggleValue,
  onToggle,
  colors,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: danger
              ? "rgba(255,107,107,0.12)"
              : colors.inputBackground,
          },
        ]}
      >
        <Feather
          name={icon as any}
          size={16}
          color={danger ? colors.destructive : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: danger ? colors.destructive : colors.text },
        ]}
      >
        {label}
      </Text>
      {toggle && onToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <View style={styles.settingRight}>
          {value ? (
            <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
              {value}
            </Text>
          ) : null}
          {onPress && (
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const headerPaddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const displayName = user?.displayName ?? "You";
  const email = user?.email ?? "";

  async function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
      }}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, "#4DA3FF"]}
        style={[styles.header, { paddingTop: headerPaddingTop + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Profile</Text>
      </LinearGradient>

      {/* Profile card */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <Avatar name={displayName} size={80} showOnlineIndicator={false} />
          <TouchableOpacity
            style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
        {email ? (
          <Text style={[styles.profilePhone, { color: colors.textTertiary }]}>
            {email}
          </Text>
        ) : null}
        <Text style={[styles.profileStatus, { color: colors.textSecondary }]}>
          Available
        </Text>
      </View>

      {/* Account */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Account</Text>
        <SettingRow icon="user" label="Edit Profile" onPress={() => {}} colors={colors} />
        <SettingRow icon="mail" label="Email" value={email} onPress={() => {}} colors={colors} />
        <SettingRow icon="shield" label="Linked: Google / Email" colors={colors} />
      </View>

      {/* Privacy */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Privacy</Text>
        <SettingRow icon="eye" label="Last Seen" value="Everyone" onPress={() => {}} colors={colors} />
        <SettingRow icon="lock" label="Two-Factor Auth" onPress={() => {}} colors={colors} />
        <SettingRow icon="slash" label="Blocked Contacts" value="0" onPress={() => {}} colors={colors} />
      </View>

      {/* Notifications */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          Notifications
        </Text>
        <SettingRow
          icon="bell"
          label="Message Notifications"
          toggle
          toggleValue={true}
          onToggle={() => {}}
          colors={colors}
        />
        <SettingRow
          icon="volume-2"
          label="Call Ringtone"
          value="Default"
          onPress={() => {}}
          colors={colors}
        />
      </View>

      {/* Appearance */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          Appearance
        </Text>
        <SettingRow
          icon="moon"
          label="Dark Mode"
          value={colorScheme === "dark" ? "On" : "Off"}
          onPress={() => {}}
          colors={colors}
        />
        <SettingRow icon="image" label="Chat Wallpaper" onPress={() => {}} colors={colors} />
        <SettingRow icon="type" label="Font Size" value="Medium" onPress={() => {}} colors={colors} />
      </View>

      {/* Storage */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          Storage & Data
        </Text>
        <SettingRow icon="hard-drive" label="Storage Manager" onPress={() => {}} colors={colors} />
        <SettingRow
          icon="wifi"
          label="Data Saver"
          toggle
          toggleValue={false}
          onToggle={() => {}}
          colors={colors}
        />
      </View>

      {/* Support */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Support</Text>
        <SettingRow icon="help-circle" label="Help & FAQ" onPress={() => {}} colors={colors} />
        <SettingRow icon="star" label="Rate NovaChat" onPress={() => {}} colors={colors} />
        <SettingRow icon="info" label="About" value="1.0.0" onPress={() => {}} colors={colors} />
      </View>

      {/* Developer credit */}
      <View style={styles.devCard}>
        <Image
          source={require("../../assets/images/diablozo-logo.webp")}
          style={styles.devLogo}
          resizeMode="contain"
        />
        <Text style={[styles.devText, { color: colors.textTertiary }]}>
          Developed by Diablozo Tech
        </Text>
      </View>

      {/* Logout */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SettingRow
          icon="log-out"
          label="Log Out"
          onPress={handleLogout}
          danger
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  profileCard: {
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  profileStatus: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  devCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 12,
  },
  devLogo: {
    width: 26,
    height: 26,
    borderRadius: 5,
    opacity: 0.45,
  },
  devText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
