import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { EmailService } from '../email/email.service';

const PENDING_EXPIRY_MS = 30 * 60 * 1000;

@Injectable()
export class GymService {
  constructor(
    @InjectModel(GymPlan.name) private gymPlanModel: Model<GymPlanDocument>,
    @InjectModel(GymSubscription.name)
    private gymSubscriptionModel: Model<GymSubscriptionDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private flutterwaveService: FlutterwaveService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private generateRef(): string {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${TX_REF_PREFIX}${stamp}-${rand}`;
  }

  // sweeps two unrelated cases into the same "expired" bucket: a pass
  // that ran its course, and a signup that was never paid for
  private async expireLapsed(ids?: string[]) {
    const now = new Date();
    const pendingCutoff = new Date(now.getTime() - PENDING_EXPIRY_MS);

    const activeFilter: Record<string, unknown> = {
      status: GymSubscriptionStatus.ACTIVE,
      endDate: { $lt: now },
    };
    const pendingFilter: Record<string, unknown> = {
      status: GymSubscriptionStatus.PENDING,
      createdAt: { $lt: pendingCutoff },
    };
    if (ids) {
      activeFilter._id = { $in: ids };
      pendingFilter._id = { $in: ids };
    }

    const stalePending = await this.gymSubscriptionModel.find(pendingFilter, {
      _id: 1,
    });

    await this.gymSubscriptionModel.updateMany(activeFilter, {
      status: GymSubscriptionStatus.EXPIRED,
    });

    if (stalePending.length > 0) {
      const staleIds = stalePending.map((s) => s._id);
      await this.gymSubscriptionModel.updateMany(
        { _id: { $in: staleIds } },
        { status: GymSubscriptionStatus.EXPIRED },
      );
      await this.paymentModel.updateMany(
        { subscriptionId: { $in: staleIds }, status: PaymentStatus.PENDING },
        { status: PaymentStatus.FAILED },
      );
    }
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

  async activate(id: string) {
    const subscription = await this.gymSubscriptionModel.findById(id);
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.status !== GymSubscriptionStatus.PAID) {
      throw new BadRequestException(
        `Cannot activate a subscription with status "${subscription.status}" — it must be paid first`,
      );
    }

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000,
    );

    subscription.status = GymSubscriptionStatus.ACTIVE;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();

    await this.emailService.sendMembershipActivated({
      memberName: subscription.memberName,
      memberEmail: subscription.memberEmail,
      subscriptionRef: subscription.subscriptionRef,
      planName: subscription.planName,
      startDate,
      endDate,
    });

    return subscription;
  }
}
