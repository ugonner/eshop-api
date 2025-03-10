import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { Profile } from './user.entity';
import { IAttachment } from '../shared/interfaces/typings';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({nullable: true})
  description: string;

  @Column({nullable: true, type: "decimal"})
  discountRate?: number;

  @Column({type: "bool", default: false})
  isPublished?: boolean;
  
  @Column({type: "bool", default: false})
  isDeleted?: boolean;



  @Column()
  imageUrl: string;

  @Column({type: "json", nullable: true})
  attachments?: IAttachment[];

  @ManyToOne(() => Profile, (profile) => profile.products)
  user: Profile;

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: true })
  @JoinTable({
    name: 'product_tag',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToMany(() => Category, (category) => category.products, { cascade: true })
  @JoinTable({
    name: 'product_category',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product)
  variants: ProductVariant[];

}
