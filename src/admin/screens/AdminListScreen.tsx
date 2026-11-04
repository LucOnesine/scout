import { BookOpen, CodeXml, Compass, Music, Pencil, Plus, Trash2 } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '../../context/DatabaseContext';
import type { ContentItem, ContentKind } from '../../db/repositoryTypes';
import { confirmDelete } from '../../lib/confirm';
import { cardShadow, fonts, type ThemeColors, themed } from '../../theme/theme';
import type { ChantItem, CodeItem, KojaItem, TechniqueItem } from '../../types';
import { useAdminNav } from '../nav';
import { useTheme } from '../../context/SettingsContext';

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const TABS: { kind: ContentKind; label: string; Icon: IconComponent }[] = [
  { kind: 'chants', label: 'Chants', Icon: Music },
  { kind: 'kojas', label: 'Histoires', Icon: BookOpen },
  { kind: 'techniques', label: 'Techniques', Icon: Compass },
  { kind: 'codes', label: 'Codes', Icon: CodeXml },
];

const META: Record<ContentKind, { title: string; singular: string }> = {
  chants: { title: 'Répertoire de chants', singular: 'un chant' },
  kojas: { title: 'Histoires & traditions', singular: 'une histoire' },
  techniques: { title: 'Compétences scouts', singular: 'une technique' },
  codes: { title: 'Bibliothèque de codes', singular: 'un code' },
};

function describeItem(kind: ContentKind, item: ContentItem) {
  switch (kind) {
    case 'chants': {
      const chant = item as ChantItem;
      return { icon: '🎵', title: chant.title, subtitle: `${chant.artist} · ${chant.dur}` };
    }
    case 'kojas': {
      const koja = item as KojaItem;
      return { icon: '📖', title: koja.title, subtitle: koja.date };
    }
    case 'techniques': {
      const technique = item as TechniqueItem;
      return {
        icon: technique.icon,
        title: technique.name,
        subtitle: `${technique.cat} · ${technique.level}`,
      };
    }
    case 'codes': {
      const code = item as CodeItem;
      return { icon: code.icon, title: code.name, subtitle: code.desc };
    }
  }
}

export function AdminListScreen({
  kind,
  onKindChange,
}: {
  kind: ContentKind;
  onKindChange: (kind: ContentKind) => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { codes, kojas, techniques, chants, deleteContent } = useDatabase();
  const nav = useAdminNav();

  const itemsByKind: Record<ContentKind, ContentItem[]> = {
    codes,
    kojas,
    techniques,
    chants,
  };
  const items = itemsByKind[kind];
  const meta = META[kind];

  const remove = (item: ContentItem) => {
    const { title } = describeItem(kind, item);
    confirmDelete(`Supprimer « ${title} » ? Cette action est définitive.`, () => {
      deleteContent(kind, item.id).catch(() => {
        Alert.alert('Erreur', 'La suppression a échoué.');
      });
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administration</Text>
        <Text style={styles.headerSub}>K2TH Scout · gestion des contenus</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${kind}-${item.id}`}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>Gestion des contenus</Text>
              <Text style={styles.introText}>
                Les modifications sont enregistrées dans la base SQLite et visibles
                immédiatement dans l’application K2TH Scout.
              </Text>
            </View>

            <View style={styles.tabs}>
              {TABS.map(({ kind: tabKind, label, Icon }) => {
                const active = tabKind === kind;
                return (
                  <Pressable
                    key={tabKind}
                    onPress={() => onKindChange(tabKind)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Section ${label}`}
                    style={[styles.tab, active && styles.tabActive]}
                  >
                    <Icon
                      size={15}
                      color={active ? colors.primary : colors.muted}
                      strokeWidth={2.2}
                    />
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
                    <View style={[styles.tabCount, active && styles.tabCountActive]}>
                      <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>
                        {itemsByKind[tabKind].length}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.listLabel}>
              {meta.title} · {items.length}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const description = describeItem(kind, item);
          return (
            <View style={styles.item}>
              <View style={styles.itemIcon}>
                <Text style={styles.itemIconText}>{description.icon}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {description.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {description.subtitle}
                </Text>
              </View>
              <Pressable
                onPress={() => nav.push({ name: 'editor', kind, itemId: item.id })}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Modifier ${description.title}`}
                style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              >
                <Pencil size={16} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => remove(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer ${description.title}`}
                style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              >
                <Trash2 size={16} color={colors.danger} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun contenu dans cette section</Text>
            <Text style={styles.emptyHint}>Utilise le bouton ci-dessous pour en ajouter.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Pressable
          onPress={() => nav.push({ name: 'editor', kind, itemId: null })}
          accessibilityRole="button"
          accessibilityLabel={`Ajouter ${meta.singular}`}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <Plus size={18} color={colors.white} strokeWidth={2.6} />
          <Text style={styles.addText}>Ajouter {meta.singular}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: 2,
  },
  headerTitle: {
    fontFamily: fonts.black,
    fontSize: 17,
    color: colors.deep,
  },
  headerSub: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerBlock: {
    gap: 12,
    marginBottom: 12,
  },
  introCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
    padding: 14,
    gap: 4,
  },
  introTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.deep,
  },
  introText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  tabText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabCount: {
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.soft,
  },
  tabCountActive: {
    backgroundColor: colors.primary,
  },
  tabCountText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.muted,
  },
  tabCountTextActive: {
    color: colors.white,
  },
  listLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: 2,
  },
  separator: {
    height: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconText: {
    fontSize: 19,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.deep,
  },
  itemSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
  },
  iconButtonPressed: {
    backgroundColor: colors.border,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 6,
  },
  emptyIcon: {
    fontSize: 30,
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.muted,
  },
  emptyHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.mutedSoft,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  addButton: {
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  addText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
}));
