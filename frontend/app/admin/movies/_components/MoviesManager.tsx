"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ClapperboardIcon,
  Delete02Icon,
  ImageAdd01Icon,
  PencilEdit01Icon,
  Search01Icon,
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
import type { Movie } from "@/lib/api/types";
import {
  useCreateMovie,
  useDeleteMovie,
  useMoviesAdmin,
  useUpdateMovie,
} from "@/lib/movies";
import { cn } from "@/lib/utils";
import Pagination from "../../_components/Pagination";

const PAGE_SIZE = 10;

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

/** One poster card in the catalog grid, with its own hover actions. */
function MovieCard({
  movie,
  onToggleVisible,
  onEdit,
  onDelete,
  togglePending,
  deletePending,
}: {
  movie: Movie;
  onToggleVisible: () => void;
  onEdit: () => void;
  onDelete: () => void;
  togglePending: boolean;
  deletePending: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal transition-colors duration-200 hover:border-boxx-red/30">
      <div className="relative aspect-2/3 bg-boxx-night">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <HugeiconsIcon icon={ClapperboardIcon} className="size-8 text-boxx-dim" />
          </div>
        )}
        <Badge
          variant={movie.visible ? "soft" : "outline"}
          className="absolute top-2.5 left-2.5 text-[10px]"
        >
          {movie.visible ? "Visible" : "Hidden"}
        </Badge>
      </div>

      <div className="p-4">
        <p className="truncate font-heading text-sm tracking-wide text-boxx-white uppercase">
          {movie.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-boxx-dim">
          {[movie.genre, movie.durationMins ? `${movie.durationMins} min` : null]
            .filter(Boolean)
            .join(" · ") || "No details yet"}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleVisible}
            disabled={togglePending}
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
            onClick={onEdit}
            aria-label={`Edit ${movie.title}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            aria-label={`Delete ${movie.title}`}
            className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-dim transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red disabled:pointer-events-none disabled:opacity-40"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** The FilmBoxx movie catalog's admin surface — a poster grid, not a data table. */
export default function MoviesManager() {
  const { data: movies, isLoading, isError } = useMoviesAdmin();
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Movie | null>(null);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteMovie.mutate(pendingDelete._id, {
      onSuccess: () => {
        toast.success("Movie deleted");
        setPendingDelete(null);
      },
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
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

      {/* Poster grid */}
      {isLoading && (
        <p className="mt-14 text-center text-sm text-boxx-dim">Loading movies…</p>
      )}
      {isError && (
        <p className="mt-14 text-center text-sm text-boxx-dim">
          Couldn&apos;t load the catalog. Try refreshing.
        </p>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-boxx-line">
          <EmptyState
            icon={Search01Icon}
            title="No movies match this view"
            description="Try a different search term."
          />
        </div>
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <Reveal delay={100} className="mt-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginated.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onToggleVisible={() => toggleVisible(movie)}
                onEdit={() => openEditDialog(movie)}
                onDelete={() => setPendingDelete(movie)}
                togglePending={updateMovie.isPending && updateMovie.variables?.id === movie._id}
                deletePending={deleteMovie.isPending}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            onPageChange={setPage}
          />
        </Reveal>
      )}

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <div className="p-6">
            <DialogHeader className="gap-1.5 p-0">
              <DialogTitle>{editingMovie ? "Edit movie" : "Add movie"}</DialogTitle>
              <DialogDescription>
                {editingMovie
                  ? "Update this title's details."
                  : "Add the poster and details — you can publish or hide it anytime from the grid."}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this movie?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed from the catalog for good. This can't be undone.`
            : ""
        }
        pending={deleteMovie.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
