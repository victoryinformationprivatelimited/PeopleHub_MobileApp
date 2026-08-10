import { useEffect } from "react";
import { ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppDispatch, RootState } from "../store";
import { fetchSection } from "../store/profileSlice";
import { SectionRenderer } from "./SectionRenderer";
import type { RootStackParamList } from "../navigation/types";

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
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <SectionRenderer
        loading={section?.loading ?? true}
        error={section?.error ?? null}
        payload={section?.data ?? null}
      />
    </ScrollView>
  );
}
