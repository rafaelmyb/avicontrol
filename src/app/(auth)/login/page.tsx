"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { pt } from "@/shared/i18n/pt";
import { LoadingSpinner } from "@/components/loading-spinner";

type LoginFields = {
  email: string;
  password: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState("");

  const { register, handleSubmit, formState } = useForm<LoginFields>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFields) {
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (res?.error) {
      setError(pt.invalidCredentials);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          {pt.appName}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {pt.email}
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {pt.password}
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {formState.isSubmitting ? pt.loading : pt.login}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Não tem conta?{" "}
          <a
            href="/register"
            className="text-gray-900 font-medium hover:underline"
          >
            {pt.register}
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
