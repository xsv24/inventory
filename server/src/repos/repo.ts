export type Query<T> = (item: T) => boolean;

export type Connection = 'CONNECTION_OK' | 'CONNECTION_BAD';

// TODO: Repository throws errors would be nice to return a result
export type Repository<T extends { id: string }> = {
  filter: (query?: Query<T>) => Promise<T[]>;
  getById: (id: string) => Promise<undefined | T>;
  create: (item: T) => Promise<T>;
  update: (item: Partial<T> & { id: T['id'] }) => Promise<T>;
  connection: () => Promise<Connection>;
};
