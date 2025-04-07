import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { OrderItem } from './orderitem.entity';
import { Profile } from './user.entity';
import { OrderStatus } from '../shared/enums/order.enum';
import { DeliveryAddressDTO } from '../shared/dtos/order.dto';
import { PaymentTransaction } from './transaction.entity';
import { IShippingMethodDetail } from '../shared/DATASETS/shipping/shippingMethods';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNo: string;

  @Column({nullable: true, type: "json"})
  shippingMethod?: IShippingMethodDetail;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'json' })
  deliveryAddress: DeliveryAddressDTO;

  @Column({ nullable: true })
  additionalInformation?: string;

  @Column({ default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  @OneToOne(() => PaymentTransaction, (trx) => trx.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  paymentTransaction: PaymentTransaction;

  @ManyToOne(() => Profile, (profile) => profile.orders)
  user: Profile;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
