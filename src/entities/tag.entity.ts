import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Product, (product) => product.tags)
  products?: Product[];
}
