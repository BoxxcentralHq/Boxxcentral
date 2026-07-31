import type { Metadata } from "next";
import MoviesManager from "./_components/MoviesManager";

export const metadata: Metadata = {
  title: "Movies — Admin",
};

export default function AdminMoviesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Movies
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        FilmBoxx catalog
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        What&apos;s available to screen. Hidden titles stay off the public
        catalog but guests can always bring their own film.
      </p>

      <div className="mt-8">
        <MoviesManager />
      </div>
    </div>
  );
}
