import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppDispatch, RootState } from "../store";
import { fetchSection } from "../store/profileSlice";
import { SectionRenderer } from "./SectionRenderer";
import type { RootStackParamList } from "../navigation/types";
import { neutral } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileSection">;

export default function ProfileSectionScreen({ route, navigation }: Props) {
  const { sectionId, label } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const section = useSelector((state: RootState) => state.profile.sections[sectionId]);

  useEffect(() => {
    navigation.setOptions({ title: label });
    dispatch(fetchSection(sectionId));
  }, [sectionId]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionRenderer
        loading={section?.loading ?? true}
        error={section?.error ?? null}
        payload={section?.data ?? null}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: neutral.background },
  content: { padding: 16, paddingBottom: 32 },
});
