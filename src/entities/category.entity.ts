import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({nullable: true})
  descripton: string;

  @Column({nullable: true})
  imageUrl: string;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
