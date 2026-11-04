import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AddRowButton,
  ChoiceChips,
  FormSection,
  SaveBar,
  TextField,
} from '../../components/admin/AdminFields';
import { MediaPickerField } from '../../components/admin/MediaPickerField';
import { DetailHeader } from '../../components/AppHeader';
import { useDatabase } from '../../context/DatabaseContext';
import { KOJA_IMAGES, getKojaCover } from '../../data/kojaImages';
import type { ContentKind } from '../../db/repositoryTypes';
import { deleteMediaFiles, mediaImageSource } from '../../lib/mediaStore';
import { fonts, type ThemeColors, themed } from '../../theme/theme';
import type {
  ChantItem,
  CodeItem,
  CodeType,
  KojaItem,
  TechniqueItem,
  TechniqueStep,
} from '../../types';
import { useAdminNav } from '../nav';
import { useTheme } from '../../context/SettingsContext';

const KIND_TITLES: Record<ContentKind, { new: string; edit: string }> = {
  chants: { new: 'Nouveau chant', edit: 'Modifier le chant' },
  kojas: { new: 'Nouvelle histoire', edit: 'Modifier l’histoire' },
  techniques: { new: 'Nouvelle technique', edit: 'Modifier la technique' },
  codes: { new: 'Nouveau code', edit: 'Modifier le code' },
};

const GRADIENTS: { label: string; value: [string, string] }[] = [
  { label: 'Violet', value: ['#6D28D9', '#8B5CF6'] },
  { label: 'Lilas', value: ['#7C3AED', '#A78BFA'] },
  { label: 'Indigo', value: ['#5B21B6', '#7C3AED'] },
  { label: 'Nuit', value: ['#4C1D95', '#6D28D9'] },
];

const LEVELS: { label: string; color: string }[] = [
  { label: 'Débutant', color: '#10B981' },
  { label: 'Intermédiaire', color: '#F59E0B' },
  { label: 'Essentiel', color: '#EF4444' },
  { label: 'Avancé', color: '#6D28D9' },
];

const CODE_TYPES: { value: CodeType; label: string }[] = [
  { value: 'morse', label: 'Morse' },
  { value: 'alpha', label: 'Alphabétique' },
  { value: 'semaphore', label: 'Sémaphore' },
  { value: 'pigpen', label: 'Pigpen' },
];

const IMAGE_LABELS: Record<string, string> = {
  fondation: 'Fondation',
  valeurs: 'Valeurs',
  k2th: 'K2TH',
  camp: 'Camp',
};

const EMPTY_CHANT: ChantItem = {
  id: 0,
  title: '',
  artist: 'K2TH',
  dur: '3:00',
  genre: 'Chant scout',
  lyrics: '',
  gradient: GRADIENTS[0].value,
  audioKey: '',
};

const EMPTY_KOJA: KojaItem = {
  id: 0,
  title: '',
  date: '',
  imageKey: 'fondation',
  coverKey: '',
  desc: '',
  tags: [],
  photos: [],
};

const EMPTY_TECHNIQUE: TechniqueItem = {
  id: 0,
  name: '',
  icon: '⚜️',
  iconKey: '',
  cat: '',
  level: 'Débutant',
  levelColor: LEVELS[0].color,
  desc: '',
  steps: [],
};

const EMPTY_CODE: CodeItem = {
  id: 0,
  name: '',
  icon: '📡',
  desc: '',
  type: 'morse',
  table: [],
};

type Props = {
  kind: ContentKind;
  itemId: number | null;
};

export function AdminEditorScreen({ kind, itemId }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { chants, kojas, techniques, codes, saveContent } = useDatabase();
  const nav = useAdminNav();
  const isNew = itemId == null;

  const chant = isNew ? undefined : chants.find((entry) => entry.id === itemId);
  const koja = isNew ? undefined : kojas.find((entry) => entry.id === itemId);
  const technique = isNew ? undefined : techniques.find((entry) => entry.id === itemId);
  const code = isNew ? undefined : codes.find((entry) => entry.id === itemId);

  const persist = async (item: ChantItem | KojaItem | TechniqueItem | CodeItem) => {
    switch (kind) {
      case 'chants': {
        const next = item as ChantItem;
        await saveContent('chants', next);
        if (chant && chant.audioKey && chant.audioKey !== next.audioKey) {
          deleteMediaFiles([chant.audioKey]);
        }
        break;
      }
      case 'kojas': {
        const next = item as KojaItem;
        await saveContent('kojas', next);
        if (koja) {
          const retired = [koja.coverKey, ...koja.photos].filter(
            (key) => key && !next.photos.includes(key) && key !== next.coverKey,
          );
          deleteMediaFiles(retired);
        }
        break;
      }
      case 'techniques': {
        const next = item as TechniqueItem;
        await saveContent('techniques', next);
        if (technique) {
          const used = new Set([next.iconKey, ...next.steps.map((step) => step.imageKey)]);
          const retired = [technique.iconKey, ...technique.steps.map((step) => step.imageKey)].filter(
            (key) => key && !used.has(key),
          );
          deleteMediaFiles(retired);
        }
        break;
      }
      case 'codes':
        await saveContent('codes', item as CodeItem);
        break;
    }
    nav.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <DetailHeader
        title={isNew ? KIND_TITLES[kind].new : KIND_TITLES[kind].edit}
        onBack={() => nav.back()}
      />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {kind === 'chants' && (
          <ChantForm initial={chant ?? EMPTY_CHANT} onSubmit={persist} />
        )}
        {kind === 'kojas' && <KojaForm initial={koja ?? EMPTY_KOJA} onSubmit={persist} />}
        {kind === 'techniques' && (
          <TechniqueForm initial={technique ?? EMPTY_TECHNIQUE} onSubmit={persist} />
        )}
        {kind === 'codes' && <CodeForm initial={code ?? EMPTY_CODE} onSubmit={persist} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormProps<T> = {
  initial: T;
  onSubmit: (item: T) => Promise<void>;
};

function ChantForm({ initial, onSubmit }: FormProps<ChantItem>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [title, setTitle] = useState(initial.title);
  const [artist, setArtist] = useState(initial.artist);
  const [dur, setDur] = useState(initial.dur);
  const [genre, setGenre] = useState(initial.genre);
  const [lyrics, setLyrics] = useState(initial.lyrics);
  const [audioKey, setAudioKey] = useState(initial.audioKey);
  const [saving, setSaving] = useState(false);

  const gradients = useMemo(() => {
    const known = GRADIENTS.some(
      (entry) => entry.value[0] === initial.gradient[0] && entry.value[1] === initial.gradient[1],
    );
    return known ? GRADIENTS : [...GRADIENTS, { label: 'Actuel', value: initial.gradient }];
  }, [initial.gradient]);

  const [gradientIndex, setGradientIndex] = useState(() => {
    const index = GRADIENTS.findIndex(
      (entry) => entry.value[0] === initial.gradient[0] && entry.value[1] === initial.gradient[1],
    );
    return index === -1 ? GRADIENTS.length : index;
  });

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Champ requis', 'Le titre du chant est obligatoire.');
      return;
    }
    if (!lyrics.trim()) {
      Alert.alert('Champ requis', 'Les paroles du chant sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...initial,
        title: title.trim(),
        artist: artist.trim() || 'Anonyme',
        dur: dur.trim() || '3:00',
        genre: genre.trim() || 'Chant scout',
        lyrics: lyrics.trim(),
        gradient: gradients[gradientIndex].value,
        audioKey,
      });
    } catch {
      setSaving(false);
      Alert.alert('Erreur', 'L’enregistrement du chant a échoué.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title="Informations">
          <TextField label="Titre" value={title} onChangeText={setTitle} placeholder="Hymne K2TH" />
          <TextField label="Artiste" value={artist} onChangeText={setArtist} placeholder="Tradition Scout" />
          <TextField
            label="Durée"
            value={dur}
            onChangeText={setDur}
            placeholder="3:24"
            keyboardType="numbers-and-punctuation"
          />
          <TextField label="Genre" value={genre} onChangeText={setGenre} placeholder="Hymne, marche…" />
        </FormSection>

        <FormSection title="Ambiance & audio">
          <ChoiceChips
            label="Dégradé"
            options={gradients.map((entry, index) => ({
              value: index,
              label: entry.label,
            }))}
            value={gradientIndex}
            onChange={setGradientIndex}
          />
          <MediaPickerField
            label="Audio"
            kind="audio"
            prefix={`chant-${initial.id || 'new'}`}
            value={audioKey}
            onChange={setAudioKey}
          />
        </FormSection>

        <FormSection title="Paroles">
          <TextField
            label="Paroles"
            value={lyrics}
            onChangeText={setLyrics}
            placeholder="Une ligne par vers…"
            multiline
          />
        </FormSection>
      </ScrollView>
      <SaveBar label="Enregistrer le chant" saving={saving} onPress={save} />
    </>
  );
}

function KojaForm({ initial, onSubmit }: FormProps<KojaItem>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [desc, setDesc] = useState(initial.desc);
  const [imageKey, setImageKey] = useState(initial.imageKey);
  const [coverKey, setCoverKey] = useState(initial.coverKey);
  const [photos, setPhotos] = useState<string[]>(initial.photos);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [saving, setSaving] = useState(false);

  const imageKeys = Object.keys(KOJA_IMAGES);
  const images = imageKeys.includes(imageKey) ? imageKeys : [imageKey, ...imageKeys];
  const coverSource = getKojaCover(imageKey, coverKey);

  const updateTag = (index: number, value: string) => {
    setTags((current) => current.map((tag, position) => (position === index ? value : tag)));
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Champ requis', 'Le titre de l’histoire est obligatoire.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...initial,
        title: title.trim(),
        date: date.trim(),
        desc: desc.trim(),
        imageKey,
        coverKey,
        tags: [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))],
        photos,
      });
    } catch {
      setSaving(false);
      Alert.alert('Erreur', 'L’enregistrement de l’histoire a échoué.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title="Informations">
          <TextField label="Titre" value={title} onChangeText={setTitle} placeholder="La fondation du scoutisme" />
          <TextField label="Date" value={date} onChangeText={setDate} placeholder="1907 · Brownsea" />
          <TextField
            label="Description"
            value={desc}
            onChangeText={setDesc}
            placeholder="Raconte l’histoire…"
            multiline
          />
        </FormSection>

        <FormSection title="Illustration">
          <ChoiceChips
            label="Image de couverture"
            options={images.map((key) => ({ value: key, label: IMAGE_LABELS[key] ?? key }))}
            value={imageKey}
            onChange={setImageKey}
          />
          <MediaPickerField
            label="Importer une couverture"
            kind="image"
            prefix={`koja-${initial.id || 'new'}-cover`}
            value={coverKey}
            onChange={setCoverKey}
          />
          <Image source={coverSource} style={styles.preview} resizeMode="cover" />
        </FormSection>

        <FormSection title="Photos">
          {photos.map((photo, index) => (
            <View key={`photo-${photo}-${index}`} style={styles.photoRow}>
              <Image
                source={mediaImageSource(photo) ?? KOJA_IMAGES.fondation}
                style={styles.photoThumb}
                resizeMode="cover"
              />
              <Text style={styles.photoName} numberOfLines={1}>
                Photo {index + 1}
              </Text>
              <Pressable
                onPress={() => {
                  deleteMediaFiles([photo]);
                  setPhotos((current) => current.filter((_, position) => position !== index));
                }}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer la photo ${index + 1}`}
                hitSlop={6}
                style={styles.rowRemove}
              >
                <X size={15} color={colors.danger} />
              </Pressable>
            </View>
          ))}
          <MediaPickerField
            label="Ajouter une photo"
            kind="image"
            prefix={`koja-${initial.id || 'new'}-photo`}
            value=""
            onChange={(key) => setPhotos((current) => [...current, key])}
          />
        </FormSection>

        <FormSection title="Tags">
          {tags.map((tag, index) => (
            <View key={`tag-${index}`} style={styles.row}>
              <TextInput
                value={tag}
                onChangeText={(value) => updateTag(index, value)}
                placeholder={`Tag ${index + 1}`}
                placeholderTextColor={colors.mutedSoft}
                accessibilityLabel={`Tag ${index + 1}`}
                style={[styles.rowInput, styles.rowInputFlex]}
              />
              <Pressable
                onPress={() => setTags((current) => current.filter((_, position) => position !== index))}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer le tag ${index + 1}`}
                hitSlop={6}
                style={styles.rowRemove}
              >
                <X size={15} color={colors.danger} />
              </Pressable>
            </View>
          ))}
          <AddRowButton label="Ajouter un tag" onPress={() => setTags((current) => [...current, ''])} />
        </FormSection>
      </ScrollView>
      <SaveBar label="Enregistrer l’histoire" saving={saving} onPress={save} />
    </>
  );
}

function TechniqueForm({ initial, onSubmit }: FormProps<TechniqueItem>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [name, setName] = useState(initial.name);
  const [icon, setIcon] = useState(initial.icon);
  const [iconKey, setIconKey] = useState(initial.iconKey);
  const [cat, setCat] = useState(initial.cat);
  const [level, setLevel] = useState(initial.level);
  const [levelColor, setLevelColor] = useState(initial.levelColor);
  const [desc, setDesc] = useState(initial.desc);
  const [steps, setSteps] = useState<TechniqueStep[]>(
    initial.steps.length ? initial.steps : [{ text: '', imageKey: '' }],
  );
  const [saving, setSaving] = useState(false);

  const levels = LEVELS.some((entry) => entry.label === initial.level)
    ? LEVELS
    : [...LEVELS, { label: initial.level, color: initial.levelColor }];

  const updateStep = (index: number, value: string) => {
    setSteps((current) =>
      current.map((step, position) => (position === index ? { ...step, text: value } : step)),
    );
  };

  const updateStepImage = (index: number, value: string) => {
    setSteps((current) =>
      current.map((step, position) => (position === index ? { ...step, imageKey: value } : step)),
    );
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Le nom de la technique est obligatoire.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...initial,
        name: name.trim(),
        icon: icon.trim() || '⚜️',
        iconKey,
        cat: cat.trim() || 'Général',
        level,
        levelColor,
        desc: desc.trim(),
        steps: steps
          .map((step) => ({ text: step.text.trim(), imageKey: step.imageKey }))
          .filter((step) => step.text || step.imageKey),
      });
    } catch {
      setSaving(false);
      Alert.alert('Erreur', 'L’enregistrement de la technique a échoué.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title="Informations">
          <TextField label="Nom" value={name} onChangeText={setName} placeholder="Nœuds de base" />
          <TextField label="Icône" value={icon} onChangeText={setIcon} placeholder="🪢" />
          <MediaPickerField
            label="Image de l’icône"
            kind="image"
            prefix={`technique-${initial.id || 'new'}-icon`}
            value={iconKey}
            onChange={setIconKey}
          />
          <TextField label="Catégorie" value={cat} onChangeText={setCat} placeholder="Survie, navigation…" />
          <TextField
            label="Description"
            value={desc}
            onChangeText={setDesc}
            placeholder="À quoi sert cette technique ?"
            multiline
          />
        </FormSection>

        <FormSection title="Niveau">
          <ChoiceChips
            label="Niveau"
            options={levels.map((entry) => ({ value: entry.label, label: entry.label }))}
            value={level}
            onChange={(value) => {
              setLevel(value);
              const match = levels.find((entry) => entry.label === value);
              if (match) {
                setLevelColor(match.color);
              }
            }}
          />
        </FormSection>

        <FormSection title="Étapes">
          {steps.map((step, index) => (
            <View key={`step-${index}`} style={styles.stepBlock}>
              <View style={styles.row}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <TextInput
                  value={step.text}
                  onChangeText={(value) => updateStep(index, value)}
                  placeholder="Décrire l’étape…"
                  placeholderTextColor={colors.mutedSoft}
                  accessibilityLabel={`Étape ${index + 1}`}
                  multiline
                  style={[styles.rowInput, styles.rowInputFlex, styles.rowInputMultiline]}
                />
                <Pressable
                  onPress={() => {
                    if (step.imageKey) {
                      deleteMediaFiles([step.imageKey]);
                    }
                    setSteps((current) => current.filter((_, position) => position !== index));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Supprimer l’étape ${index + 1}`}
                  hitSlop={6}
                  style={styles.rowRemove}
                >
                  <X size={15} color={colors.danger} />
                </Pressable>
              </View>
              <MediaPickerField
                label={`Image de l’étape ${index + 1}`}
                kind="image"
                prefix={`technique-${initial.id || 'new'}-step`}
                value={step.imageKey}
                onChange={(value) => updateStepImage(index, value)}
              />
            </View>
          ))}
          <AddRowButton
            label="Ajouter une étape"
            onPress={() => setSteps((current) => [...current, { text: '', imageKey: '' }])}
          />
        </FormSection>
      </ScrollView>
      <SaveBar label="Enregistrer la technique" saving={saving} onPress={save} />
    </>
  );
}

function CodeForm({ initial, onSubmit }: FormProps<CodeItem>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [name, setName] = useState(initial.name);
  const [icon, setIcon] = useState(initial.icon);
  const [desc, setDesc] = useState(initial.desc);
  const [type, setType] = useState<CodeType>(initial.type);
  const [table, setTable] = useState(initial.table.length ? initial.table : [{ l: '', c: '' }]);
  const [saving, setSaving] = useState(false);

  const updateRow = (index: number, field: 'l' | 'c', value: string) => {
    setTable((current) =>
      current.map((row, position) => (position === index ? { ...row, [field]: value } : row)),
    );
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Le nom du code est obligatoire.');
      return;
    }
    const rows = table
      .map((row) => ({ l: row.l.trim(), c: row.c.trim() }))
      .filter((row) => row.l || row.c);
    if (!rows.length) {
      Alert.alert('Champ requis', 'Ajoute au moins une correspondance.');
      return;
    }
    const letters = new Set<string>();
    for (const row of rows) {
      const letter = row.l.toUpperCase();
      if (letters.has(letter)) {
        Alert.alert('Doublon', `La lettre « ${row.l} » apparaît plusieurs fois.`);
        return;
      }
      letters.add(letter);
    }
    setSaving(true);
    try {
      await onSubmit({
        ...initial,
        name: name.trim(),
        icon: icon.trim() || '📡',
        desc: desc.trim(),
        type,
        table: rows,
      });
    } catch {
      setSaving(false);
      Alert.alert('Erreur', 'L’enregistrement du code a échoué.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title="Informations">
          <TextField label="Nom" value={name} onChangeText={setName} placeholder="Code Morse" />
          <TextField label="Icône" value={icon} onChangeText={setIcon} placeholder="📡" />
          <TextField
            label="Description"
            value={desc}
            onChangeText={setDesc}
            placeholder="Communication par points et tirets"
          />
          <ChoiceChips label="Type" options={CODE_TYPES} value={type} onChange={setType} />
        </FormSection>

        <FormSection title="Correspondances">
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableLetter]}>Lettre</Text>
            <Text style={[styles.tableHeaderText, styles.tableSymbol]}>Symbole</Text>
            <View style={styles.rowRemoveSpacer} />
          </View>
          {table.map((row, index) => (
            <View key={`row-${index}`} style={styles.row}>
              <TextInput
                value={row.l}
                onChangeText={(value) => updateRow(index, 'l', value)}
                placeholder="A"
                placeholderTextColor={colors.mutedSoft}
                accessibilityLabel={`Correspondance ${index + 1} lettre`}
                autoCapitalize="characters"
                style={[styles.rowInput, styles.tableLetter]}
              />
              <TextInput
                value={row.c}
                onChangeText={(value) => updateRow(index, 'c', value)}
                placeholder=".-"
                placeholderTextColor={colors.mutedSoft}
                accessibilityLabel={`Correspondance ${index + 1} symbole`}
                style={[styles.rowInput, styles.tableSymbol]}
              />
              <Pressable
                onPress={() => setTable((current) => current.filter((_, position) => position !== index))}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer la correspondance ${index + 1}`}
                hitSlop={6}
                style={styles.rowRemove}
              >
                <X size={15} color={colors.danger} />
              </Pressable>
            </View>
          ))}
          <AddRowButton
            label="Ajouter une correspondance"
            onPress={() => setTable((current) => [...current, { l: '', c: '' }])}
          />
        </FormSection>
      </ScrollView>
      <SaveBar label="Enregistrer le code" saving={saving} onPress={save} />
    </>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 18,
  },
  preview: {
    width: '100%',
    height: 132,
    borderRadius: 16,
    backgroundColor: colors.soft,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photoThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.soft,
  },
  photoName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.deep,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowInput: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.deep,
  },
  rowInputFlex: {
    flex: 1,
  },
  rowInputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  rowRemove: {
    width: 34,
    height: 34,
    marginTop: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
  },
  rowRemoveSpacer: {
    width: 34,
  },
  stepBadge: {
    width: 26,
    height: 26,
    marginTop: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
  },
  stepBlock: {
    gap: 8,
  },
  stepBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    marginBottom: -2,
  },
  tableHeaderText: {
    fontFamily: fonts.extraBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  tableLetter: {
    width: 84,
    flexGrow: 0,
    flexShrink: 0,
  },
  tableSymbol: {
    flex: 1,
  },
}));
