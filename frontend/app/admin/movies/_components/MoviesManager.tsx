"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  ImageAdd01Icon,
  PencilEdit01Icon,
  Search01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
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
import type { Movie } from "@/lib/api/types";
import {
  useCreateMovie,
  useDeleteMovie,
  useMoviesAdmin,
  useUpdateMovie,
} from "@/lib/movies";
import { cn } from "@/lib/utils";

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
  title: string;
  synopsis: string;
  genre: string;
  durationMins: string;
  posterFile: File | null;
};

const emptyForm: FormState = {
  title: "",
  synopsis: "",
  genre: "",
  durationMins: "",
  posterFile: null,
};

/** The FilmBoxx movie catalog's admin surface — add, edit, hide, and remove titles. */
export default function MoviesManager() {
  const { data: movies, isLoading, isError } = useMoviesAdmin();
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = movies ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.genre ?? "").toLowerCase().includes(q),
    );
  }, [movies, query]);

  useEffect(() => {
    return () => {
      if (posterPreview?.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  function openAddDialog() {
    setEditingMovie(null);
    setForm(emptyForm);
    setPosterPreview(null);
    setDialogOpen(true);
  }

  function openEditDialog(movie: Movie) {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      synopsis: movie.synopsis ?? "",
      genre: movie.genre ?? "",
      durationMins: movie.durationMins !== undefined ? String(movie.durationMins) : "",
      posterFile: null,
    });
    setPosterPreview(movie.posterUrl ?? null);
    setDialogOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, posterFile: file }));
    setPosterPreview(URL.createObjectURL(file));
  }

  function toggleVisible(movie: Movie) {
    updateMovie.mutate(
      { id: movie._id, input: { visible: !movie.visible } },
      {
        onSuccess: () =>
          toast.success(movie.visible ? "Movie hidden" : "Movie is now visible"),
        onError: (error) => toastApiError(error, "Couldn't update visibility."),
      },
    );
  }

  function handleDelete(movie: Movie) {
    if (!window.confirm(`Delete "${movie.title}"? This can't be undone.`)) return;
    deleteMovie.mutate(movie._id, {
      onSuccess: () => toast.success("Movie deleted"),
      onError: (error) => toastApiError(error, "Couldn't delete that movie."),
    });
  }

  const durationValue = form.durationMins.trim() === "" ? undefined : Number(form.durationMins);
  const isValid =
    form.title.trim() !== "" &&
    (durationValue === undefined || Number.isFinite(durationValue)) &&
    (editingMovie !== null || form.posterFile !== null);

  function handleSave() {
    if (!isValid) return;

    const shared = {
      title: form.title.trim(),
      synopsis: form.synopsis.trim() || undefined,
      genre: form.genre.trim() || undefined,
      durationMins: durationValue,
      ...(form.posterFile ? { poster: form.posterFile } : {}),
    };

    if (editingMovie) {
      updateMovie.mutate(
        { id: editingMovie._id, input: shared },
        {
          onSuccess: () => {
            toast.success("Movie updated");
            setDialogOpen(false);
          },
          onError: (error) => toastApiError(error, "Couldn't save changes."),
        },
      );
    } else {
      createMovie.mutate(
        { ...shared, poster: form.posterFile as File },
        {
          onSuccess: () => {
            toast.success("Movie added");
            setDialogOpen(false);
          },
          onError: (error) => toastApiError(error, "Couldn't add that movie."),
        },
      );
    }
  }

  const saving = createMovie.isPending || updateMovie.isPending;

  return (
    <div>
      {/* Filters + add */}
      <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <HugeiconsIcon
            icon={Search01Icon}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-boxx-dim"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
            aria-label="Search movies"
            className="w-full rounded-full border border-boxx-line bg-boxx-coal py-2.5 pl-11 pr-4 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        </div>

        <Button onClick={openAddDialog} className="shrink-0">
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Add movie
        </Button>
      </Reveal>

      {/* Table */}
      <Reveal
        delay={100}
        className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                <th className="px-6 py-4 font-bold">Title</th>
                <th className="px-4 py-4 font-bold">Genre</th>
                <th className="px-4 py-4 font-bold">Duration</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Loading movies…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Couldn&apos;t load the catalog. Try refreshing.
                  </td>
                </tr>
              )}
              {!isLoading && !isError &&
                filtered.map((movie) => (
                  <tr
                    key={movie._id}
                    className="border-b border-boxx-line/50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-boxx-line bg-boxx-night">
                          {movie.posterUrl && (
                            <Image
                              src={movie.posterUrl}
                              alt={movie.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-boxx-white">
                            {movie.title}
                          </p>
                          {movie.synopsis && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-boxx-dim">
                              {movie.synopsis}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-boxx-mist">
                      {movie.genre ?? "—"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {movie.durationMins !== undefined ? `${movie.durationMins} min` : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={movie.visible ? "soft" : "outline"} className="text-[10px]">
                        {movie.visible ? "Visible" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVisible(movie)}
                          disabled={updateMovie.isPending}
                          aria-label={movie.visible ? `Hide ${movie.title}` : `Show ${movie.title}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                        >
                          <HugeiconsIcon
                            icon={movie.visible ? ViewOffSlashIcon : ViewIcon}
                            className="size-3.5"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditDialog(movie)}
                          aria-label={`Edit ${movie.title}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(movie)}
                          disabled={deleteMovie.isPending}
                          aria-label={`Delete ${movie.title}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-dim transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red disabled:pointer-events-none disabled:opacity-40"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    No movies match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
      <p className="mt-3 text-xs tracking-[0.2em] text-boxx-dim uppercase">
        {filtered.length} {filtered.length === 1 ? "movie" : "movies"}
      </p>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <div className="p-6">
            <DialogHeader className="gap-1.5 p-0">
              <DialogTitle>{editingMovie ? "Edit movie" : "Add movie"}</DialogTitle>
              <DialogDescription>
                {editingMovie
                  ? "Update this title's details."
                  : "Add the poster and details — you can publish or hide it anytime from the table."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-[7rem_1fr] gap-5">
                <div className="space-y-2">
                  <FieldLabel>Poster</FieldLabel>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex aspect-2/3 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-boxx-line bg-boxx-night transition-colors duration-200 hover:border-boxx-red/40"
                  >
                    {posterPreview ? (
                      <Image
                        src={posterPreview}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <HugeiconsIcon icon={ImageAdd01Icon} className="size-5 text-boxx-dim" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <FieldLabel>Title</FieldLabel>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Everything Everywhere"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <FieldLabel>Genre</FieldLabel>
                      <Input
                        value={form.genre}
                        onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                        placeholder="Drama"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Duration (min)</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        value={form.durationMins}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, durationMins: e.target.value }))
                        }
                        placeholder="128"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>Synopsis</FieldLabel>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))}
                  rows={3}
                  placeholder="A short description for the catalog."
                  className={cn(fieldClass, "resize-y")}
                />
              </div>
            </div>

            <DialogFooter className="mt-8 p-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isValid || saving}>
                {saving ? "Saving…" : editingMovie ? "Save changes" : "Add movie"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
