import { CinemaService } from './cinema.service';

const file = (name: string) =>
  ({ originalname: name, buffer: Buffer.from(name) }) as Express.Multer.File;

function setup(existing: Record<string, unknown> = {}) {
  const saved: Record<string, unknown>[] = [];
  const movieDoc = {
    title: 'Dune',
    posterPublicId: 'old-poster',
    bannerPublicId: 'old-banner',
    ...existing,
    save: jest.fn(),
    deleteOne: jest.fn().mockResolvedValue(undefined),
  };
  movieDoc.save.mockResolvedValue(movieDoc);

  const MovieModel = jest.fn().mockImplementation((doc: object) => ({
    ...doc,
    save: jest.fn().mockImplementation(() => {
      saved.push(doc as Record<string, unknown>);
      return Promise.resolve(doc);
    }),
  }));
  const select = jest.fn().mockResolvedValue(movieDoc);
  Object.assign(MovieModel, {
    findById: jest.fn().mockReturnValue({ select }),
  });

  const uploadImage = jest.fn().mockImplementation((f: Express.Multer.File) =>
    Promise.resolve({
      url: `https://cdn/${f.originalname}`,
      publicId: `id-${f.originalname}`,
    }),
  );
  const destroyImage = jest.fn().mockResolvedValue(undefined);

  const service = new CinemaService({} as never, MovieModel as never, {
    uploadImage,
    destroyImage,
  });
  return { service, saved, movieDoc, select, uploadImage, destroyImage };
}

describe('CinemaService movie images', () => {
  it('stores a banner alongside the poster when both are uploaded', async () => {
    const t = setup();

    await t.service.createMovie(
      { title: 'Dune' },
      { poster: file('poster.jpg'), banner: file('banner.jpg') },
    );

    expect(t.saved[0]).toMatchObject({
      posterUrl: 'https://cdn/poster.jpg',
      posterPublicId: 'id-poster.jpg',
      bannerUrl: 'https://cdn/banner.jpg',
      bannerPublicId: 'id-banner.jpg',
    });
  });

  it('creates a movie with no banner when none is uploaded', async () => {
    const t = setup();

    await t.service.createMovie(
      { title: 'Dune' },
      { poster: file('poster.jpg') },
    );

    expect(t.uploadImage).toHaveBeenCalledTimes(1);
    expect(t.saved[0].bannerUrl).toBeUndefined();
  });

  it('replaces only the banner, deleting the old one from Cloudinary', async () => {
    const t = setup();

    await t.service.updateMovie('m1', {}, { banner: file('new-banner.jpg') });

    expect(t.select).toHaveBeenCalledWith('+posterPublicId +bannerPublicId');
    expect(t.destroyImage).toHaveBeenCalledTimes(1);
    expect(t.destroyImage).toHaveBeenCalledWith('old-banner');
    expect(t.movieDoc).toMatchObject({
      bannerUrl: 'https://cdn/new-banner.jpg',
      bannerPublicId: 'id-new-banner.jpg',
      posterPublicId: 'old-poster',
    });
  });

  it('deletes both images from Cloudinary when the movie is removed', async () => {
    const t = setup();

    await t.service.removeMovie('m1');

    expect(t.destroyImage).toHaveBeenCalledWith('old-poster');
    expect(t.destroyImage).toHaveBeenCalledWith('old-banner');
    expect(t.movieDoc.deleteOne).toHaveBeenCalled();
  });
});
