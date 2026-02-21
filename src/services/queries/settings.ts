import { queryClient } from "@/lib/query-client";
import { loadSettings } from "@/services/requests/settings/load-settings";
import { updateSettings as updateSettingsRequest } from "@/services/requests/settings/update-settings";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLoadSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: loadSettings,
  });
};

const useUpdateSettings = () => {
  return useMutation({
    mutationFn: updateSettingsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const SettingsQueries = {
  useLoadSettings,
};

export const SettingsMutations = {
  useUpdateSettings,
};
