import { EventHandler, Storage } from './mod'
import { LocalStorageProvider } from './src/providers/localStorage';
import { defaultJSONSerializer } from './src/serializers/defaultJSONSerializer';

type Product = {
  id: number;
  name: string;
}

type MyStorage = {
  accessToken: string;
  refreshToken: string;
  products: Product[];
}

const storage = new Storage<MyStorage>({
  prefix: "some-prefix:",
  provider: new LocalStorageProvider(),
  jsonSerializer: defaultJSONSerializer,
});

// const storageWithSuperJson = new Storage<MyStorage>({
//   prefix: "some-prefix:",
//   provider: new LocalStorageProvider(),
//   jsonSerializer: {
//     stringify(value) {
//       return superjson.stringify(value);
//     },
//     parse(value) {
//       return superjson.parse(value);
//     }
//   }
// });

const a = storage.get("products"); // a: Product[]

storage.set("products", [{ id: 123, name: "adsfasdf" }]);

const handleProductsSet: EventHandler<MyStorage, 'products', 'set'> = (e) => {
  console.log(e.type, e.key, e.value);
};

storage.addEventListener('products:set', handleProductsSet);

storage.removeEventListener('products:set', handleProductsSet);

const unsubscribe = storage.addEventListener('products:*', (e) => {
  console.log(e.type, e.key, e.value);
});

unsubscribe();

storage.clear();