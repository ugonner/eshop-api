import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PaymentMethod, PaymentStatus } from "../shared/enums/payment.enum";
import { Order } from "./order.entity";
import { Profile } from "./user.entity";

@Entity()
export class PaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
      id?: string;

      @Column()
      paymentMethod: PaymentMethod;

      @Column()
      paymentStatus: PaymentStatus

      @Column()
      amount: number;

      @OneToOne(() => Order, (order) => order.paymentTransaction)
      order: Order;

      @ManyToOne(() => Profile)
      user: Profile;

      @CreateDateColumn()
      createdAt: Date

      @UpdateDateColumn()
      updatedAt: Date;
    
}