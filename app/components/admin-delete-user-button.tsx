"use client";

import { deleteAdminUser } from "@/app/admin/actions";

export default function AdminDeleteUserButton({ userId, label }: { userId: string; label: string }) {
  return (
    <form
      action={deleteAdminUser}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${label}? This removes the login account and disables its charts.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      <button type="submit" className="rounded-lg border border-[#e9c5c0] bg-[#fff4f2] px-3 py-2 text-xs font-semibold text-[#8b3c35]">
        Delete user
      </button>
    </form>
  );
}
