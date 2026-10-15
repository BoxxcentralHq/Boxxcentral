import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from './schemas/payment.schema';
import { BookingStatus } from '../bookings/schemas/booking.schema';
import { GymSubscriptionStatus } from '../gym/schemas/gym-subscription.schema';
import { TicketOrderStatus } from '../screenings/schemas/ticket-order.schema';
import type { FlutterwaveWebhookPayload } from '../flutterwave/types/flutterwave.types';

const REF = 'BXX-TEST-0001';
const AMOUNT = 118250;

const event: FlutterwaveWebhookPayload = {
  event: 'charge.completed',
  data: {
    id: 99,
    tx_ref: REF,
    flw_ref: 'FLW-99',
    amount: AMOUNT,
    currency: 'NGN',
    status: 'successful',
  },
};

const booking = {
  guestName: 'Ada',
  guestEmail: 'ada@example.com',
  guestPhone: '0800',
  bookingRef: REF,
  experience: 'filmboxx',
  room: 'Cinema 1',
  date: '2026-10-20',
  timeSlot: '19:00',
  guests: 4,
  subtotal: 110000,
  vatAmount: 8250,
  totalPrice: AMOUNT,
};

const subscription = {
  memberName: 'Tolu',
  memberEmail: 'tolu@example.com',
  subscriptionRef: REF,
  planName: 'Monthly',
  durationDays: 30,
  price: AMOUNT,
};

const ticketOrder = {
  _id: 'order1',
  screeningId: 'scr1',
  guestName: 'Kemi',
  guestEmail: 'kemi@example.com',
  guestPhone: '0801',
  orderRef: REF,
  movieTitle: 'Dune',
  screen: 'Cinema 2',
  date: '2026-10-20',
  time: '13:30',
  tickets: 3,
  subtotal: 30000,
  vatAmount: 2250,
  totalPrice: 32250,
};

function setup(paymentOverrides: Record<string, unknown> = {}) {
  const payment = {
    _id: 'pay1',
    reference: REF,
    amount: AMOUNT,
    currency: 'NGN',
    status: PaymentStatus.PENDING,
    bookingId: 'book1',
    ...paymentOverrides,
  };

  const paymentFindOne = jest.fn().mockResolvedValue(payment);
  const paymentClaim = jest
    .fn()
    .mockResolvedValue({ ...payment, status: PaymentStatus.SUCCESS });
  const paymentUpdateOne = jest.fn().mockResolvedValue({});
  const bookingUpdate = jest.fn().mockResolvedValue(booking);
  const subscriptionUpdate = jest.fn().mockResolvedValue(subscription);
  const validateSignature = jest.fn().mockReturnValue(true);
  const verifyTransaction = jest.fn().mockResolvedValue({
    id: 99,
    tx_ref: REF,
    flw_ref: 'FLW-99',
    amount: AMOUNT,
    currency: 'NGN',
    status: 'successful',
  });
  const sendBookingConfirmation = jest.fn().mockResolvedValue(undefined);
  const sendMembershipPaymentReceipt = jest.fn().mockResolvedValue(undefined);
  const sendTicketConfirmation = jest.fn().mockResolvedValue(undefined);
  const ticketOrderUpdate = jest.fn().mockResolvedValue(ticketOrder);
  const ticketOrderFindOne = jest.fn().mockResolvedValue(null);
  const screeningUpdateOne = jest.fn().mockResolvedValue({});
  const screeningReseat = jest.fn().mockResolvedValue({ _id: 'scr1' });

  const service = new PaymentsService(
    {
      findOne: paymentFindOne,
      findOneAndUpdate: paymentClaim,
      updateOne: paymentUpdateOne,
    } as never,
    { findOneAndUpdate: bookingUpdate } as never,
    { findOneAndUpdate: subscriptionUpdate } as never,
    {
      findOneAndUpdate: ticketOrderUpdate,
      findOne: ticketOrderFindOne,
    } as never,
    {
      updateOne: screeningUpdateOne,
      findOneAndUpdate: screeningReseat,
    } as never,
    { validateSignature, verifyTransaction } as never,
    {
      sendBookingConfirmation,
      sendMembershipPaymentReceipt,
      sendTicketConfirmation,
    } as never,
  );

  return {
    service,
    paymentFindOne,
    paymentClaim,
    paymentUpdateOne,
    bookingUpdate,
    subscriptionUpdate,
    validateSignature,
    verifyTransaction,
    sendBookingConfirmation,
    sendMembershipPaymentReceipt,
    sendTicketConfirmation,
    ticketOrderUpdate,
    ticketOrderFindOne,
    screeningUpdateOne,
    screeningReseat,
  };
}

describe('PaymentsService.handleWebhook', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => jest.restoreAllMocks());

  it('rejects an invalid signature', async () => {
    const t = setup();
    t.validateSignature.mockReturnValue(false);

    await expect(t.service.handleWebhook(event, 'bad')).rejects.toThrow(
      BadRequestException,
    );
    expect(t.paymentFindOne).not.toHaveBeenCalled();
  });

  it('acknowledges an unknown reference without retrying or verifying', async () => {
    const t = setup();
    t.paymentFindOne.mockResolvedValue(null);

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'ignored',
    });
    expect(t.verifyTransaction).not.toHaveBeenCalled();
  });

  it('confirms a verified payment, reserves the booking, and emails once', async () => {
    const t = setup();

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toEqual({
      status: 'success',
      reference: REF,
    });
    expect(t.verifyTransaction).toHaveBeenCalledWith('99');
    expect(t.paymentClaim).toHaveBeenCalledWith(
      {
        _id: 'pay1',
        status: { $in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
      },
      expect.objectContaining({
        status: PaymentStatus.SUCCESS,
        transactionId: '99',
      }),
      { new: true },
    );
    expect(t.bookingUpdate).toHaveBeenCalledWith(
      { _id: 'book1', status: BookingStatus.PENDING },
      { status: BookingStatus.RESERVED },
      { new: true },
    );
    expect(t.sendBookingConfirmation).toHaveBeenCalledTimes(1);
  });

  it('trusts the gateway over the webhook body', async () => {
    const t = setup();
    t.verifyTransaction.mockResolvedValue({
      id: 99,
      tx_ref: REF,
      amount: AMOUNT,
      currency: 'NGN',
      status: 'failed',
    });

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'failed',
    });
    expect(t.paymentUpdateOne).toHaveBeenCalledWith(
      { _id: 'pay1', status: PaymentStatus.PENDING },
      expect.objectContaining({ status: PaymentStatus.FAILED }),
    );
    expect(t.paymentClaim).not.toHaveBeenCalled();
    expect(t.bookingUpdate).not.toHaveBeenCalled();
    expect(t.sendBookingConfirmation).not.toHaveBeenCalled();
  });

  it('leaves a payment untouched while the gateway still reports pending', async () => {
    const t = setup();
    t.verifyTransaction.mockResolvedValue({
      id: 99,
      tx_ref: REF,
      amount: AMOUNT,
      currency: 'NGN',
      status: 'pending',
    });

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'pending',
    });
    expect(t.paymentUpdateOne).not.toHaveBeenCalled();
    expect(t.paymentClaim).not.toHaveBeenCalled();
  });

  it('asks Flutterwave to retry when the gateway cannot be reached', async () => {
    const t = setup();
    t.verifyTransaction.mockResolvedValue(null);

    await expect(t.service.handleWebhook(event, 'sig')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(t.paymentClaim).not.toHaveBeenCalled();
  });

  it('ignores a gateway transaction that belongs to another reference', async () => {
    const t = setup();
    t.verifyTransaction.mockResolvedValue({
      id: 99,
      tx_ref: 'BXX-SOMEONE-ELSE',
      amount: AMOUNT,
      currency: 'NGN',
      status: 'successful',
    });

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'ignored',
    });
    expect(t.paymentClaim).not.toHaveBeenCalled();
  });

  it.each([
    ['underpaid', { amount: AMOUNT - 1, currency: 'NGN' }],
    ['wrong currency', { amount: AMOUNT, currency: 'USD' }],
  ])(
    'flags a %s payment for review instead of confirming it',
    async (_, paid) => {
      const t = setup();
      t.verifyTransaction.mockResolvedValue({
        id: 99,
        tx_ref: REF,
        status: 'successful',
        ...paid,
      });

      await expect(
        t.service.handleWebhook(event, 'sig'),
      ).resolves.toMatchObject({ status: 'review', reason: 'amount_mismatch' });
      expect(t.paymentUpdateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          needsReview: true,
          reviewReason: 'amount_mismatch',
        }),
      );
      expect(t.paymentClaim).not.toHaveBeenCalled();
      expect(t.sendBookingConfirmation).not.toHaveBeenCalled();
    },
  );

  it('does not email again on a repeat delivery', async () => {
    const t = setup({ status: PaymentStatus.SUCCESS });
    t.bookingUpdate.mockResolvedValue(null);

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'duplicate',
    });
    expect(t.verifyTransaction).not.toHaveBeenCalled();
    expect(t.bookingUpdate).toHaveBeenCalledTimes(1);
    expect(t.sendBookingConfirmation).not.toHaveBeenCalled();
  });

  it('lets only one of two racing deliveries confirm', async () => {
    const t = setup();
    t.paymentClaim.mockResolvedValue(null);

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'duplicate',
    });
    expect(t.bookingUpdate).not.toHaveBeenCalled();
    expect(t.sendBookingConfirmation).not.toHaveBeenCalled();
  });

  it('reinstates a booking that expired while the guest was paying', async () => {
    const t = setup({ status: PaymentStatus.FAILED });
    t.bookingUpdate.mockResolvedValueOnce(null).mockResolvedValueOnce(booking);

    await t.service.handleWebhook(event, 'sig');

    expect(t.bookingUpdate).toHaveBeenLastCalledWith(
      { _id: 'book1', status: BookingStatus.CANCELLED },
      { status: BookingStatus.RESERVED },
      { new: true },
    );
    expect(t.sendBookingConfirmation).toHaveBeenCalledTimes(1);
  });

  it('flags a late payment for review when the slot was taken meanwhile', async () => {
    const t = setup({ status: PaymentStatus.FAILED });
    t.bookingUpdate
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(Object.assign(new Error('dup'), { code: 11000 }));

    await expect(t.service.handleWebhook(event, 'sig')).resolves.toMatchObject({
      status: 'success',
    });
    expect(t.paymentUpdateOne).toHaveBeenCalledWith(
      { _id: 'pay1' },
      { needsReview: true, reviewReason: 'slot_taken' },
    );
    expect(t.sendBookingConfirmation).not.toHaveBeenCalled();
  });

  it('marks a gym subscription paid and sends the receipt', async () => {
    const t = setup({ bookingId: undefined, subscriptionId: 'sub1' });

    await t.service.handleWebhook(event, 'sig');

    expect(t.subscriptionUpdate).toHaveBeenCalledWith(
      {
        _id: 'sub1',
        status: {
          $in: [GymSubscriptionStatus.PENDING, GymSubscriptionStatus.EXPIRED],
        },
        startDate: { $exists: false },
      },
      { status: GymSubscriptionStatus.PAID },
      { new: true },
    );
    expect(t.sendMembershipPaymentReceipt).toHaveBeenCalledTimes(1);
    expect(t.bookingUpdate).not.toHaveBeenCalled();
  });

  it('never revives an expired subscription on a repeat delivery', async () => {
    const t = setup({
      bookingId: undefined,
      subscriptionId: 'sub1',
      status: PaymentStatus.SUCCESS,
    });
    t.subscriptionUpdate.mockResolvedValue(null);

    await t.service.handleWebhook(event, 'sig');

    expect(t.subscriptionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { $in: [GymSubscriptionStatus.PENDING] },
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(t.sendMembershipPaymentReceipt).not.toHaveBeenCalled();
  });

  describe('ticket orders', () => {
    const ticketPayment = { bookingId: undefined, ticketOrderId: 'order1' };

    it('marks the order paid, moves held seats to sold, and emails the tickets', async () => {
      const t = setup(ticketPayment);

      await t.service.handleWebhook(event, 'sig');

      expect(t.ticketOrderUpdate).toHaveBeenCalledWith(
        { _id: 'order1', status: TicketOrderStatus.PENDING },
        { status: TicketOrderStatus.PAID },
        { new: true },
      );
      expect(t.screeningUpdateOne).toHaveBeenCalledWith(
        { _id: 'scr1' },
        { $inc: { seatsHeld: -3, seatsSold: 3 } },
      );
      expect(t.sendTicketConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ orderRef: REF, tickets: 3 }),
      );
      expect(t.bookingUpdate).not.toHaveBeenCalled();
    });

    it('re-seats an order that expired while the guest was paying', async () => {
      const t = setup({ ...ticketPayment, status: PaymentStatus.FAILED });
      t.ticketOrderUpdate
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(ticketOrder);
      t.ticketOrderFindOne.mockResolvedValue({
        ...ticketOrder,
        status: TicketOrderStatus.EXPIRED,
      });

      await t.service.handleWebhook(event, 'sig');

      expect(t.screeningReseat).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'scr1' }),
        { $inc: { seatsSold: 3 } },
      );
      expect(t.screeningUpdateOne).not.toHaveBeenCalled();
      expect(t.sendTicketConfirmation).toHaveBeenCalledTimes(1);
    });

    it('flags a late payment for review when the screening sold out meanwhile', async () => {
      const t = setup({ ...ticketPayment, status: PaymentStatus.FAILED });
      t.ticketOrderUpdate.mockResolvedValueOnce(null);
      t.ticketOrderFindOne.mockResolvedValue({
        ...ticketOrder,
        status: TicketOrderStatus.EXPIRED,
      });
      t.screeningReseat.mockResolvedValue(null);

      await t.service.handleWebhook(event, 'sig');

      expect(t.paymentUpdateOne).toHaveBeenCalledWith(
        { _id: 'pay1' },
        { needsReview: true, reviewReason: 'sold_out' },
      );
      expect(t.sendTicketConfirmation).not.toHaveBeenCalled();
    });

    it('gives the seats back if the order was claimed by another delivery', async () => {
      const t = setup({ ...ticketPayment, status: PaymentStatus.FAILED });
      t.ticketOrderUpdate.mockResolvedValue(null);
      t.ticketOrderFindOne.mockResolvedValue({
        ...ticketOrder,
        status: TicketOrderStatus.EXPIRED,
      });

      await t.service.handleWebhook(event, 'sig');

      expect(t.screeningUpdateOne).toHaveBeenCalledWith(
        { _id: 'scr1' },
        { $inc: { seatsSold: -3 } },
      );
      expect(t.sendTicketConfirmation).not.toHaveBeenCalled();
    });

    it('never re-seats an expired order on a repeat delivery', async () => {
      const t = setup({ ...ticketPayment, status: PaymentStatus.SUCCESS });
      t.ticketOrderUpdate.mockResolvedValue(null);

      await t.service.handleWebhook(event, 'sig');

      expect(t.ticketOrderFindOne).not.toHaveBeenCalled();
      expect(t.screeningReseat).not.toHaveBeenCalled();
      expect(t.sendTicketConfirmation).not.toHaveBeenCalled();
    });
  });
});
