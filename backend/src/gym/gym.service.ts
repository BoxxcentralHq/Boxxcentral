import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GymPlan, GymPlanDocument } from './schemas/gym-plan.schema';
import {
  GymSubscription,
  GymSubscriptionDocument,
  GymSubscriptionStatus,
} from './schemas/gym-subscription.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../payments/schemas/payment.schema';
import { CreateGymPlanDto } from './dto/create-gym-plan.dto';
import { UpdateGymPlanDto } from './dto/update-gym-plan.dto';
import { CreateGymSubscriptionDto } from './dto/create-gym-subscription.dto';
import {
  FlutterwaveService,
  TX_REF_PREFIX,
} from '../flutterwave/flutterwave.service';

@Injectable()
export class GymService {
  constructor(
    @InjectModel(GymPlan.name) private gymPlanModel: Model<GymPlanDocument>,
    @InjectModel(GymSubscription.name)
    private gymSubscriptionModel: Model<GymSubscriptionDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private flutterwaveService: FlutterwaveService,
    private configService: ConfigService,
  ) {}

  private generateRef(): string {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${TX_REF_PREFIX}${stamp}-${rand}`;
  }

  // opportunistic active -> expired flip, same trick as
  // BookingsService.expireStalePending, applied on the read path instead
  private async expireLapsed(ids?: string[]) {
    const filter: Record<string, unknown> = {
      status: GymSubscriptionStatus.ACTIVE,
      endDate: { $lt: new Date() },
    };
    if (ids) filter._id = { $in: ids };
    await this.gymSubscriptionModel.updateMany(filter, {
      status: GymSubscriptionStatus.EXPIRED,
    });
  }

  async listVisiblePlans() {
    return this.gymPlanModel
      .find({ visible: true })
      .sort({ sortOrder: 1, createdAt: 1 });
  }

  async listAllPlans() {
    return this.gymPlanModel.find().sort({ sortOrder: 1, createdAt: 1 });
  }

  async createPlan(dto: CreateGymPlanDto) {
    return new this.gymPlanModel(dto).save();
  }

  async updatePlan(id: string, dto: UpdateGymPlanDto) {
    const plan = await this.gymPlanModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!plan) throw new NotFoundException('Gym plan not found');
    return plan;
  }

  async removePlan(id: string) {
    const plan = await this.gymPlanModel.findByIdAndDelete(id);
    if (!plan) throw new NotFoundException('Gym plan not found');
    return { message: `"${plan.name}" removed` };
  }

  async createSubscription(dto: CreateGymSubscriptionDto) {
    const plan = await this.gymPlanModel.findOne({
      _id: dto.planId,
      visible: true,
    });
    if (!plan) throw new NotFoundException('Gym plan not found');

    const subscriptionRef = this.generateRef();

    const subscription = await new this.gymSubscriptionModel({
      subscriptionRef,
      planId: plan._id,
      planName: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      memberName: dto.memberName,
      memberEmail: dto.memberEmail,
      memberPhone: dto.memberPhone,
    }).save();

    await new this.paymentModel({
      reference: subscriptionRef,
      amount: plan.price,
      status: PaymentStatus.PENDING,
      category: 'gym_subscription_payment',
      subscriptionId: subscription._id,
    }).save();

    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    ).split(',')[0];

    const payment = await this.flutterwaveService.initializePayment({
      tx_ref: subscriptionRef,
      amount: plan.price,
      currency: 'NGN',
      redirect_url: `${frontendUrl}/payment/confirm`,
      meta: { subscriptionId: String(subscription._id), experience: 'gymboxx' },
      customer: {
        email: dto.memberEmail,
        phonenumber: dto.memberPhone,
        name: dto.memberName,
      },
      customizations: {
        title: 'GymBoxx Membership',
        description: `${plan.name} — ${plan.durationDays} days`,
      },
    });

    return {
      subscription: {
        subscriptionRef,
        planName: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
      },
      paymentLink: payment.link,
    };
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: GymSubscriptionStatus;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    await this.expireLapsed();

    const filter: Record<string, unknown> = {};
    if (query?.status) filter.status = query.status;

    const [subscriptions, total] = await Promise.all([
      this.gymSubscriptionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.gymSubscriptionModel.countDocuments(filter),
    ]);

    return {
      subscriptions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // front-desk lookup: is this person's membership currently active?
  async search(query: string) {
    const regex = new RegExp(query, 'i');
    const matches = await this.gymSubscriptionModel
      .find({
        $or: [
          { memberName: regex },
          { memberEmail: regex },
          { memberPhone: regex },
          { subscriptionRef: regex },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(25);

    await this.expireLapsed(matches.map((m) => String(m._id)));

    // re-fetch so callers see post-expiry statuses, not the stale in-memory copy
    return this.gymSubscriptionModel
      .find({ _id: { $in: matches.map((m) => m._id) } })
      .sort({ createdAt: -1 });
  }

  async cancel(id: string) {
    const subscription = await this.gymSubscriptionModel.findByIdAndUpdate(
      id,
      { status: GymSubscriptionStatus.CANCELLED },
      { new: true },
    );
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }
}
