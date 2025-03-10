import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { OrderItem } from './orderitem.entity';
import { ProductVariantType } from '../shared/enums/product.enum';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  size: string; // e.g., 'S', 'M', 'L', 'XL'

  @Column({nullable: true})
  color: string; // e.g., 'Red', 'Blue', 'Black'

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({default: ProductVariantType.BASE_PRODUCT})
  productVariantType: ProductVariantType;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product?: Product;
  
    @OneToMany(() => OrderItem, (orderItem) => orderItem.productVariant)
    orderItems?: OrderItem[];
}
