export type RegisterBody = {
  email: string;
  password: string;
  name?: string;
};

export const registerUser = async (
  body: RegisterBody
): Promise<{ ok: boolean }> => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error === "Email already registered"
        ? "E-mail já cadastrado."
        : data.error ?? "Failed"
    );
  }
  return data;
};
