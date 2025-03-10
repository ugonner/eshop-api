import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Auth } from "./auth.entity";
import { Gender } from "../shared/enums/user.enum";
import { Order } from "./order.entity";
import { Product } from "./product.entity";
import { DeliveryAddressDTO } from "../shared/dtos/order.dto";
import { PaymentTransaction } from "./transaction.entity";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column()
    email: string;

    @Column({nullable: true})
    firstName?: string;

    @Column({nullable: true})
    lastName?: string;

    @Column({nullable: true})
    avatar?: string;

    @Column({nullable: true})
    gender?: Gender;

    @Column({nullable: true})
    phoneNumber?: string;

    @Column({type: "json", nullable: true})
    address?: DeliveryAddressDTO;

    @OneToOne(() => Auth, (auth) => auth.profile)
    account: Auth;

    @OneToMany(() => Product, (product) => product.user)
    products: Product[]

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToMany(() => PaymentTransaction, (trx) => trx.user)
    paymentTransactions: PaymentTransaction[];

}