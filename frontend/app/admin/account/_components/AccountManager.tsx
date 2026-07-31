"use client";

import { useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon, UserAccountIcon } from "@hugeicons/core-free-icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import Reveal from "@/components/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, toastApiError } from "@/lib/api/toast";
import {
  useAdmins,
  useChangePassword,
  useCreateAdmin,
  useDeleteAdmin,
  useProfile,
} from "@/lib/auth";
import type { Admin, AdminRole } from "@/lib/api/types";
import EmptyState from "@/components/EmptyState";

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim"
    >
      {children}
    </label>
  );
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super admin",
  cinema_admin: "Cinema admin",
  lounge_admin: "Lounge admin",
};

const CREATABLE_ROLES: { value: "cinema_admin" | "lounge_admin"; label: string }[] = [
  { value: "cinema_admin", label: ROLE_LABELS.cinema_admin },
  { value: "lounge_admin", label: ROLE_LABELS.lounge_admin },
];

function ChangePasswordCard() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mismatch = confirmPassword !== "" && newPassword !== confirmPassword;
  const isValid =
    currentPassword !== "" && newPassword.length >= 8 && newPassword === confirmPassword;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password updated");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (error) =>
          toastApiError(error, "Couldn't update your password. Check your current password and try again."),
      },
    );
  }

  return (
    <Reveal className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-8">
      <h2 className="font-heading text-xl uppercase tracking-wide text-boxx-white">
        Change password
      </h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <FieldLabel htmlFor="current-password">Current password</FieldLabel>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {mismatch && <p className="text-xs text-boxx-red">Passwords don&apos;t match.</p>}
          </div>
        </div>
        <Button type="submit" disabled={!isValid || changePassword.isPending}>
          {changePassword.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Reveal>
  );
}

type NewAdminForm = { name: string; email: string; password: string; role: "cinema_admin" | "lounge_admin" };
const emptyNewAdmin: NewAdminForm = { name: "", email: "", password: "", role: "cinema_admin" };

function StaffAccounts({ profile }: { profile: { userId: string } }) {
  const { data: admins, isLoading, isError } = useAdmins();
  const createAdmin = useCreateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewAdminForm>(emptyNewAdmin);
  const [pendingDelete, setPendingDelete] = useState<Admin | null>(null);

  const isValid = form.name.trim() !== "" && form.email.trim() !== "" && form.password.length >= 8;

  function handleCreate() {
    if (!isValid) return;
    createAdmin.mutate(
      { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role },
      {
        onSuccess: () => {
          toast.success("Staff account created");
          setDialogOpen(false);
          setForm(emptyNewAdmin);
        },
        onError: (error) => toastApiError(error, "Couldn't create that account."),
      },
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteAdmin.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success("Staff account removed");
        setPendingDelete(null);
      },
      onError: (error) => toastApiError(error, "Couldn't remove that account."),
    });
  }

  return (
    <Reveal delay={100} className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl uppercase tracking-wide text-boxx-white">
          Staff accounts
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyNewAdmin);
            setDialogOpen(true);
          }}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Add staff
        </Button>
      </div>

      <div className="mt-6 divide-y divide-boxx-line/50">
        {isLoading && <p className="py-8 text-center text-sm text-boxx-dim">Loading staff…</p>}
        {isError && (
          <p className="py-8 text-center text-sm text-boxx-dim">Couldn&apos;t load staff accounts.</p>
        )}
        {!isLoading &&
          !isError &&
          (admins ?? []).map((admin) => {
            const isSelf = admin.id === profile.userId;
            const isSuperAdmin = admin.role === "super_admin";
            return (
              <div key={admin.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-boxx-white">
                    {admin.name}
                    {isSelf && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                        You
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-boxx-dim">{admin.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">
                    {ROLE_LABELS[admin.role]}
                  </Badge>
                  {!isSelf && !isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(admin)}
                      disabled={deleteAdmin.isPending}
                      aria-label={`Remove ${admin.name}`}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-dim transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red disabled:pointer-events-none disabled:opacity-40"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        {!isLoading && !isError && (admins ?? []).length === 0 && (
          <EmptyState
            icon={UserAccountIcon}
            title="No staff accounts yet"
            description="Add a cinema or lounge admin to get started."
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <DialogHeader className="gap-1.5 p-0">
              <DialogTitle>Add staff account</DialogTitle>
              <DialogDescription>
                They&apos;ll sign in with this email and password — share it with them directly.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="name@boxxcentral.com"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v as NewAdminForm["role"] }))
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl border-boxx-line bg-boxx-night px-4 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CREATABLE_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 p-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!isValid || createAdmin.isPending}>
                {createAdmin.isPending ? "Creating…" : "Create account"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove staff access?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will no longer be able to sign in. This can't be undone.`
            : ""
        }
        confirmLabel="Remove access"
        pending={deleteAdmin.isPending}
        onConfirm={confirmDelete}
      />
    </Reveal>
  );
}

export default function AccountManager() {
  const { data: profile } = useProfile();

  return (
    <div>
      <ChangePasswordCard />
      {profile?.role === "super_admin" && <StaffAccounts profile={profile} />}
    </div>
  );
}
