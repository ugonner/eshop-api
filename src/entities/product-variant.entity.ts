import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { OrderItem } from './orderitem.entity';
import { ProductVariantType } from '../shared/enums/product.enum';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  size: string; 
  
  @Column({nullable: true})
  color: string; 
 
  @Column({nullable: true})
  flavor: string; 
 
  @Column({nullable: true})
  imageUrl: string; 
  
  @Column({type: "bool", nullable: true})
  isDeleted: boolean;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({default: ProductVariantType.BASE_PRODUCT})
  productVariantType: ProductVariantType;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn()
  product?: Product;
  
    @OneToMany(() => OrderItem, (orderItem) => orderItem.productVariant)
    orderItems?: OrderItem[];
}
