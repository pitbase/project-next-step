import { redirect } from "next/navigation";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AuthCallbackAliasPage({ searchParams }: Props) {
  const qs = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
      else if (typeof value === "string") qs.set(key, value);
    }
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/app/auth/callback${suffix}`);
}
