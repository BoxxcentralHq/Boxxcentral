import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ScreeningsService } from './screenings.service';
import { TicketOrderStatus } from './schemas/ticket-order.schema';
import {
  addDays,
  isCalendarDate,
  lagosDateTime,
  lagosToday,
} from './lagos-time';
import { PaymentStatus } from '../payments/schemas/payment.schema';

const MOVIE_ID = new Types.ObjectId().toString();
const SCREENING_ID = new Types.ObjectId().toString();
const FUTURE = addDays(lagosToday(), 2);

const settings = {
  rooms: ['Cinema 1', 'Cinema 2'],
  vatRate: 7.5,
  defaultTicketPrice: 10000,
  screeningBufferMins: 30,
};

const movie = { _id: MOVIE_ID, title: 'Dune', durationMins: 120 };

function chain<T>(result: T) {
  const query = {
    sort: jest.fn(),
    lean: jest.fn().mockResolvedValue(result),
    populate: jest.fn().mockResolvedValue(result),
    then: (resolve: (value: T) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  query.sort.mockReturnValue(query);
  return query;
}

function heldScreening(overrides: Record<string, unknown> = {}) {
  return {
    _id: SCREENING_ID,
    movieId: MOVIE_ID,
    date: FUTURE,
    time: '13:30',
    screen: 'Cinema 2',
    ticketPrice: 10000,
    capacity: 40,
    seatsHeld: 3,
    seatsSold: 0,
    visible: true,
    startsAt: lagosDateTime(FUTURE, '13:30'),
    ...overrides,
  };
}

function setup() {
  const screeningFind = jest.fn().mockReturnValue(chain([]));
  const screeningFindOne = jest.fn().mockResolvedValue(null);
  const screeningFindById = jest.fn().mockResolvedValue(null);
  const screeningHold = jest.fn().mockResolvedValue(heldScreening());
  const screeningUpdateOne = jest.fn().mockResolvedValue({});
  const screeningCreate = jest
    .fn()
    .mockImplementation((doc: Record<string, unknown>) => Promise.resolve(doc));
  const orderFind = jest.fn().mockResolvedValue([]);
  const orderClaim = jest.fn().mockResolvedValue(null);
  const orderCreate = jest
    .fn()
    .mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ _id: 'order1', ...doc }),
    );
  const movieFind = jest.fn().mockReturnValue(chain([]));
  const movieFindById = jest.fn().mockResolvedValue(movie);
  const paymentCreate = jest.fn().mockResolvedValue({});
  const paymentUpdateMany = jest.fn().mockResolvedValue({});
  const getSettings = jest.fn().mockResolvedValue(settings);
  const initializePayment = jest
    .fn()
    .mockResolvedValue({ link: 'https://pay.example/abc' });

  const service = new ScreeningsService(
    {
      find: screeningFind,
      findOne: screeningFindOne,
      findById: screeningFindById,
      findOneAndUpdate: screeningHold,
      updateOne: screeningUpdateOne,
      create: screeningCreate,
    } as never,
    {
      find: orderFind,
      findOneAndUpdate: orderClaim,
      create: orderCreate,
    } as never,
    { find: movieFind, findById: movieFindById } as never,
    { create: paymentCreate, updateMany: paymentUpdateMany } as never,
    { getSettings } as never,
    { initializePayment } as never,
    { get: () => 'https://boxxcentral.com' } as never,
  );

  return {
    service,
    screeningFind,
    screeningFindOne,
    screeningFindById,
    screeningHold,
    screeningUpdateOne,
    screeningCreate,
    orderFind,
    orderClaim,
    orderCreate,
    movieFind,
    movieFindById,
    paymentCreate,
    paymentUpdateMany,
    initializePayment,
  };
}

const newScreening = {
  movieId: MOVIE_ID,
  date: FUTURE,
  time: '13:30',
  screen: 'Cinema 2',
  capacity: 40,
};

describe('ScreeningsService', () => {
  describe('create', () => {
    it('schedules a screening with the default price and a buffered end time', async () => {
      const t = setup();

      await t.service.create(newScreening);

      const startsAt = lagosDateTime(FUTURE, '13:30');
      expect(t.screeningCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketPrice: 10000,
          startsAt,
          endsAt: new Date(startsAt.getTime() + 150 * 60_000),
        }),
      );
    });

    it('keeps an explicit ticket price', async () => {
      const t = setup();

      await t.service.create({ ...newScreening, ticketPrice: 15000 });

      expect(t.screeningCreate).toHaveBeenCalledWith(
        expect.objectContaining({ ticketPrice: 15000 }),
      );
    });

    it('rejects a screen that is not one of the cinema rooms', async () => {
      const t = setup();

      await expect(
        t.service.create({ ...newScreening, screen: 'Hall 1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('schedules a movie without a duration, blocking only the cleaning gap', async () => {
      const t = setup();
      t.movieFindById.mockResolvedValue({ ...movie, durationMins: undefined });

      await t.service.create(newScreening);

      const startsAt = lagosDateTime(FUTURE, '13:30');
      expect(t.screeningCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          endsAt: new Date(startsAt.getTime() + 30 * 60_000),
        }),
      );
    });

    it('rejects a date that does not exist', async () => {
      const t = setup();

      await expect(
        t.service.create({ ...newScreening, date: '2026-02-31' }),
      ).rejects.toThrow('2026-02-31 is not a real date');
    });

    it('rejects a screening in the past', async () => {
      const t = setup();

      await expect(
        t.service.create({ ...newScreening, date: '2020-01-01' }),
      ).rejects.toThrow('A screening must start in the future');
    });

    it('rejects a screening that overlaps another in the same room', async () => {
      const t = setup();
      t.screeningFindOne.mockResolvedValue({ time: '12:00', date: FUTURE });

      await expect(t.service.create(newScreening)).rejects.toThrow(
        ConflictException,
      );
      const startsAt = lagosDateTime(FUTURE, '13:30');
      expect(t.screeningFindOne).toHaveBeenCalledWith({
        screen: 'Cinema 2',
        startsAt: { $lt: new Date(startsAt.getTime() + 150 * 60_000) },
        endsAt: { $gt: startsAt },
      });
    });
  });

  describe('update and remove', () => {
    function existing(overrides: Record<string, unknown> = {}) {
      const doc = {
        ...heldScreening({ seatsHeld: 2, seatsSold: 5 }),
        movieId: new Types.ObjectId(MOVIE_ID),
        save: jest.fn(),
        deleteOne: jest.fn(),
        ...overrides,
      };
      doc.save.mockResolvedValue(doc);
      return doc;
    }

    it('refuses to move a screening that already has tickets', async () => {
      const t = setup();
      t.screeningFindById.mockResolvedValue(existing());

      await expect(
        t.service.update(SCREENING_ID, { time: '18:00' }),
      ).rejects.toThrow(ConflictException);
    });

    it('still allows price and visibility changes once tickets are sold', async () => {
      const t = setup();
      const doc = existing();
      t.screeningFindById.mockResolvedValue(doc);

      await t.service.update(SCREENING_ID, {
        ticketPrice: 12000,
        visible: false,
        time: '13:30',
      });

      expect(doc).toMatchObject({ ticketPrice: 12000, visible: false });
      expect(doc.save).toHaveBeenCalled();
    });

    it('refuses a capacity below the seats already taken', async () => {
      const t = setup();
      t.screeningFindById.mockResolvedValue(existing());

      await expect(
        t.service.update(SCREENING_ID, { capacity: 6 }),
      ).rejects.toThrow("Capacity can't go below the 7 seats already taken");
    });

    it('reschedules an unsold screening, excluding itself from the clash check', async () => {
      const t = setup();
      const doc = existing({ seatsHeld: 0, seatsSold: 0 });
      t.screeningFindById.mockResolvedValue(doc);

      await t.service.update(SCREENING_ID, { time: '18:00' });

      expect(t.screeningFindOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: { $ne: SCREENING_ID } }),
      );
      expect(doc).toMatchObject({
        time: '18:00',
        startsAt: lagosDateTime(FUTURE, '18:00'),
      });
    });

    it('refuses to delete a screening with tickets', async () => {
      const t = setup();
      const doc = existing();
      t.screeningFindById.mockResolvedValue(doc);

      await expect(t.service.remove(SCREENING_ID)).rejects.toThrow(
        ConflictException,
      );
      expect(doc.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('createOrder', () => {
    const guest = {
      tickets: 3,
      guestName: 'Kemi',
      guestEmail: 'kemi@example.com',
      guestPhone: '0801',
    };

    it('holds seats atomically, prices with VAT, and returns the payment link', async () => {
      const t = setup();

      const result = await t.service.createOrder(SCREENING_ID, guest);

      expect(t.screeningHold).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: SCREENING_ID,
          visible: true,
          $expr: {
            $lte: [{ $add: ['$seatsHeld', '$seatsSold', 3] }, '$capacity'],
          },
        }),
        { $inc: { seatsHeld: 3 } },
        { new: true },
      );
      expect(result.order).toMatchObject({
        tickets: 3,
        unitPrice: 10000,
        subtotal: 30000,
        vatAmount: 2250,
        totalPrice: 32250,
        movieTitle: 'Dune',
        screen: 'Cinema 2',
      });
      expect(result.paymentLink).toBe('https://pay.example/abc');
      expect(t.paymentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 32250,
          category: 'ticket_payment',
          ticketOrderId: 'order1',
        }),
      );
      expect(t.initializePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 32250,
          redirect_url: 'https://boxxcentral.com/payment/confirm',
        }),
      );
    });

    it('says so when the screening is sold out', async () => {
      const t = setup();
      t.screeningHold.mockResolvedValue(null);
      t.screeningFindById.mockResolvedValue(
        heldScreening({ seatsHeld: 10, seatsSold: 30 }),
      );

      await expect(t.service.createOrder(SCREENING_ID, guest)).rejects.toThrow(
        'This screening is sold out',
      );
    });

    it('says how many seats are left when the request is too big', async () => {
      const t = setup();
      t.screeningHold.mockResolvedValue(null);
      t.screeningFindById.mockResolvedValue(
        heldScreening({ seatsHeld: 0, seatsSold: 38 }),
      );

      await expect(t.service.createOrder(SCREENING_ID, guest)).rejects.toThrow(
        'Only 2 seats are left for this screening',
      );
    });

    it('refuses a screening that has already started', async () => {
      const t = setup();
      t.screeningHold.mockResolvedValue(null);
      t.screeningFindById.mockResolvedValue(
        heldScreening({ startsAt: new Date(Date.now() - 60_000) }),
      );

      await expect(t.service.createOrder(SCREENING_ID, guest)).rejects.toThrow(
        'This screening has already started',
      );
    });

    it('treats a malformed id as not found', async () => {
      const t = setup();

      await expect(t.service.createOrder('nope', guest)).rejects.toThrow(
        NotFoundException,
      );
      expect(t.screeningHold).not.toHaveBeenCalled();
    });

    it('releases the held seats when the payment link cannot be created', async () => {
      const t = setup();
      t.initializePayment.mockRejectedValue(
        new InternalServerErrorException(
          'Could not connect to payment gateway',
        ),
      );
      t.orderClaim.mockResolvedValue({
        _id: 'order1',
        screeningId: SCREENING_ID,
        tickets: 3,
      });

      await expect(t.service.createOrder(SCREENING_ID, guest)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(t.orderClaim).toHaveBeenCalledWith(
        { _id: 'order1', status: TicketOrderStatus.PENDING },
        { status: TicketOrderStatus.EXPIRED },
        { new: true },
      );
      expect(t.screeningUpdateOne).toHaveBeenCalledWith(
        { _id: SCREENING_ID },
        { $inc: { seatsHeld: -3 } },
      );
      expect(t.paymentUpdateMany).toHaveBeenCalledWith(
        { ticketOrderId: 'order1', status: PaymentStatus.PENDING },
        { status: PaymentStatus.FAILED },
      );
    });

    it('releases the hold directly when it fails before an order exists', async () => {
      const t = setup();
      t.movieFindById.mockResolvedValue(null);

      await expect(t.service.createOrder(SCREENING_ID, guest)).rejects.toThrow(
        'Movie not found',
      );
      expect(t.orderCreate).not.toHaveBeenCalled();
      expect(t.screeningUpdateOne).toHaveBeenCalledWith(
        { _id: SCREENING_ID },
        { $inc: { seatsHeld: -3 } },
      );
    });
  });

  describe('expireStaleOrders', () => {
    it('releases each stale order exactly once', async () => {
      const t = setup();
      t.orderFind.mockResolvedValue([{ _id: 'a' }, { _id: 'b' }]);
      t.orderClaim
        .mockResolvedValueOnce({ _id: 'a', screeningId: 's1', tickets: 2 })
        .mockResolvedValueOnce(null);

      await t.service.expireStaleOrders();

      expect(t.screeningUpdateOne).toHaveBeenCalledTimes(1);
      expect(t.screeningUpdateOne).toHaveBeenCalledWith(
        { _id: 's1' },
        { $inc: { seatsHeld: -2 } },
      );
    });
  });

  describe('listUpcoming', () => {
    it('groups the next week of showtimes under their movies', async () => {
      const t = setup();
      t.screeningFind.mockReturnValue(
        chain([
          heldScreening({ seatsHeld: 2, seatsSold: 30 }),
          heldScreening({ _id: 'other', movieId: 'm2', time: '18:00' }),
        ]),
      );
      t.movieFind.mockReturnValue(chain([movie]));

      const result = await t.service.listUpcoming();

      expect(result).toEqual([
        {
          ...movie,
          showtimes: [
            {
              _id: SCREENING_ID,
              date: FUTURE,
              time: '13:30',
              screen: 'Cinema 2',
              ticketPrice: 10000,
              seatsLeft: 8,
            },
          ],
        },
      ]);
    });

    it('returns nothing without querying movies when no screenings are scheduled', async () => {
      const t = setup();

      await expect(t.service.listUpcoming()).resolves.toEqual([]);
      expect(t.movieFind).not.toHaveBeenCalled();
    });
  });
});

describe('lagos-time', () => {
  it('reads a date and time as Lagos local time', () => {
    expect(lagosDateTime('2026-10-20', '13:30').toISOString()).toBe(
      '2026-10-20T12:30:00.000Z',
    );
  });

  it('rolls over to the next Lagos day an hour before UTC midnight', () => {
    expect(lagosToday(new Date('2026-10-20T23:30:00Z'))).toBe('2026-10-21');
  });

  it('rejects impossible calendar dates that JavaScript would roll over', () => {
    expect(isCalendarDate('2026-02-31')).toBe(false);
    expect(isCalendarDate('2026-13-01')).toBe(false);
    expect(isCalendarDate('2028-02-29')).toBe(true);
  });
});
