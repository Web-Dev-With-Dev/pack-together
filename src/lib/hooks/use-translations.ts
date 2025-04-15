import { useLanguage } from "@/lib/language-context";

export function useTranslations() {
  const { t } = useLanguage();
  return { t };
} 