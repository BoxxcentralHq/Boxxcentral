"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, toastApiError } from "@/lib/api/toast";
import type { GymPlan } from "@/lib/api/types";
import {
  useCreateGymPlan,
  useDeleteGymPlan,
  useGymPlansAdmin,
  useUpdateGymPlan,
} from "@/lib/gym";
import { cn } from "@/lib/utils";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

const fieldClass =
  "w-full rounded-xl border border-boxx-line bg-boxx-night px-4 py-3 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </label>
  );
}

type FormState = {
  name: string;
  durationDays: string;
  price: string;
  description: string;
  features: string[];
  featured: boolean;
  subtitle: string;
};

const emptyForm: FormState = {
  name: "",
  durationDays: "",
  price: "",
  description: "",
  features: [],
  featured: false,
  subtitle: "",
};

/** GymBoxx's admin surface — add, edit, hide, and remove membership plans. */
export default function PlansManager() {
  const { data: plans, isLoading, isError } = useGymPlansAdmin();
  const createPlan = useCreateGymPlan();
  const updatePlan = useUpdateGymPlan();
  const deletePlan = useDeleteGymPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymPlan | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [featureInput, setFeatureInput] = useState("");
  const [pendingDelete, setPendingDelete] = useState<GymPlan | null>(null);

  function openAddDialog() {
    setEditingPlan(null);
    setForm(emptyForm);
    setFeatureInput("");
    setDialogOpen(true);
  }

  function openEditDialog(plan: GymPlan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      durationDays: String(plan.durationDays),
      price: String(plan.price),
      description: plan.description,
      features: plan.features,
      featured: plan.featured,
      subtitle: plan.subtitle ?? "",
    });
    setFeatureInput("");
    setDialogOpen(true);
  }

  function addFeature() {
    const value = featureInput.trim();
    if (value === "" || form.features.includes(value)) return;
    setForm((f) => ({ ...f, features: [...f.features, value] }));
    setFeatureInput("");
  }

  function removeFeature(feature: string) {
    setForm((f) => ({ ...f, features: f.features.filter((x) => x !== feature) }));
  }

  function toggleVisible(plan: GymPlan) {
    updatePlan.mutate(
      { id: plan._id, body: { visible: !plan.visible } },
      {
        onSuccess: () =>
          toast.success(plan.visible ? "Plan hidden" : "Plan is now visible"),
        onError: (error) => toastApiError(error, "Couldn't update visibility."),
      },
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deletePlan.mutate(pendingDelete._id, {
      onSuccess: () => {
        toast.success("Plan deleted");
        setPendingDelete(null);
      },
      onError: (error) => toastApiError(error, "Couldn't delete that plan."),
    });
  }

  const durationValue = Number(form.durationDays);
  const priceValue = Number(form.price);
  const isValid =
    form.name.trim() !== "" &&
    form.description.trim() !== "" &&
    form.durationDays.trim() !== "" &&
    !Number.isNaN(durationValue) &&
    durationValue > 0 &&
    form.price.trim() !== "" &&
    !Number.isNaN(priceValue) &&
    priceValue >= 0;

  function handleSave() {
    if (!isValid) return;

    const shared = {
      name: form.name.trim(),
      durationDays: durationValue,
      price: priceValue,
      description: form.description.trim(),
      features: form.features,
      featured: form.featured,
      subtitle: form.subtitle.trim() || undefined,
    };

    if (editingPlan) {
      updatePlan.mutate(
        { id: editingPlan._id, body: shared },
        {
          onSuccess: () => {
            toast.success("Plan updated");
            setDialogOpen(false);
          },
          onError: (error) => toastApiError(error, "Couldn't save changes."),
        },
      );
    } else {
      createPlan.mutate(shared, {
        onSuccess: () => {
          toast.success("Plan added");
          setDialogOpen(false);
        },
        onError: (error) => toastApiError(error, "Couldn't add that plan."),
      });
    }
  }

  const saving = createPlan.isPending || updatePlan.isPending;

  return (
    <div>
      <Reveal className="flex justify-end">
        <Button onClick={openAddDialog} className="shrink-0">
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Add plan
        </Button>
      </Reveal>

      <Reveal
        delay={100}
        className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-4 py-4 font-bold">Duration</th>
                <th className="px-4 py-4 font-bold">Price</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Loading plans…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Couldn&apos;t load plans. Try refreshing.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                plans?.map((plan) => (
                  <tr key={plan._id} className="border-b border-boxx-line/50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-boxx-white">{plan.name}</p>
                        {plan.featured && (
                          <Badge variant="default" className="text-[10px]">
                            {plan.subtitle ?? "Featured"}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-boxx-dim">
                        {plan.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {plan.durationDays} days
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {naira(plan.price)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={plan.visible ? "soft" : "outline"} className="text-[10px]">
                        {plan.visible ? "Visible" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVisible(plan)}
                          disabled={
                            updatePlan.isPending && updatePlan.variables?.id === plan._id
                          }
                          aria-label={plan.visible ? `Hide ${plan.name}` : `Show ${plan.name}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                        >
                          <HugeiconsIcon
                            icon={plan.visible ? ViewOffSlashIcon : ViewIcon}
                            className="size-3.5"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditDialog(plan)}
                          aria-label={`Edit ${plan.name}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(plan)}
                          disabled={deletePlan.isPending}
                          aria-label={`Delete ${plan.name}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-dim transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red disabled:pointer-events-none disabled:opacity-40"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && !isError && (plans?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Add01Icon}
                      title="No membership plans yet"
                      description="Add your first plan to get it in front of guests."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <div className="p-6">
            <DialogHeader className="gap-1.5 p-0">
              <DialogTitle>{editingPlan ? "Edit plan" : "Add plan"}</DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update this membership tier's details."
                  : "New plans appear on the public GymBoxx page instantly (unless hidden)."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. 1 Month"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Duration (days)</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={form.durationDays}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, durationDays: e.target.value }))
                    }
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Price (₦)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step={500}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="45000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Full access, no long-term commitment."
                  className={cn(fieldClass, "resize-y")}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel>Features</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    placeholder="e.g. Locker access"
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    Add
                  </Button>
                </div>
                {form.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1.5 rounded-full border border-boxx-line px-3 py-1.5 text-xs text-boxx-mist"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          aria-label={`Remove ${feature}`}
                          className="cursor-pointer text-boxx-dim hover:text-boxx-white"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm text-boxx-mist">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="size-4 rounded border-boxx-line accent-boxx-red"
                />
                Featured (highlighted as &ldquo;Most Popular&rdquo;)
              </label>

              {form.featured && (
                <div className="space-y-2">
                  <FieldLabel>Featured badge text (optional)</FieldLabel>
                  <Input
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subtitle: e.target.value }))
                    }
                    placeholder="Most Popular"
                  />
                </div>
              )}

              {!editingPlan && (
                <p className="text-xs text-boxx-dim">
                  New plans are visible immediately — use the eye icon in the
                  table to hide one later.
                </p>
              )}
            </div>

            <DialogFooter className="mt-8 p-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isValid || saving}>
                {saving ? "Saving…" : editingPlan ? "Save changes" : "Add plan"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this plan?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from the public page for good. Existing subscriptions already purchased are unaffected. This can't be undone.`
            : ""
        }
        pending={deletePlan.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
